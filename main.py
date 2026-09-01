"""
main.py
Orquestador Principal del Sistema RPA LAD-6819.
Une todos los componentes (Buzón, Clientes, FTP, Email) y maneja 
el flujo de extremo a extremo (End-to-End).
"""

import argparse
import traceback
from pathlib import Path

from registro_log import get_logger
from config.environment import env
from services.mailbox import MailboxService
from services.email import EmailService
from clients import CLIENT_MAP
from records_data import ProcessTracker

logger = get_logger()

# Cargamos el archivo YAML globalmente para que esté disponible en main
yaml_config = cargar_configuracion_yaml()

def procesar_archivo_cliente(nombre_cliente: str, archivo_entrada: str) -> dict:
    """Instancia la clase del cliente correcto y ejecuta el pipeline de procesamiento."""
    if nombre_cliente not in CLIENT_MAP:
        logger.error(f"Cliente no soportado o no mapeado: {nombre_cliente}")
        return {"exito": False, "error": "Cliente no soportado en CLIENT_MAP"}
        
    cliente_class = CLIENT_MAP[nombre_cliente]
    instancia = cliente_class()
    
    # Ejecuta el Template Method del BaseClient
    resultado = instancia.run(archivo_entrada)
    return resultado

def modo_buzon():
    """
    Modo automático: 
    1. Lee el buzón IMAP/Exchange.
    2. Identifica el cliente y descarga archivos.
    3. Ejecuta el procesamiento.
    4. Envía correo de resultados y mueve los correos en el buzón.
    """
    logger.seccion("Iniciando Modo Buzón (Automático)")
    
    buzon = MailboxService()
    email_svc = EmailService()
    tracker = ProcessTracker()
    
    if not buzon.conectar():
        logger.critical("No se pudo conectar al buzón. Cancelando ejecución.")
        return

    correos = buzon.obtener_correos_pendientes()
    if not correos:
        logger.info("El buzón está al día. No hay correos nuevos para procesar.")
        return
        
    # Crear carpeta temporal de descargas iniciales
    incoming_dir = Path(env.files_base_path) / "incoming"
    incoming_dir.mkdir(parents=True, exist_ok=True)

    for correo in correos:
        asunto = correo.subject or "Sin Asunto"
        correo_id = correo.message_id or correo.id
        
        logger.info(f"Procesando correo: '{asunto}'")
        
        # Evitar procesamiento duplicado
        if tracker.ya_fue_procesado(correo_id):
            logger.warning(f"El correo '{asunto}' ya fue procesado exitosamente en el pasado. Ignorando duplicidad.")
            buzon.marcar_como_leido(correo)
            continue
        
        adjuntos = buzon.descargar_adjuntos(correo, str(incoming_dir))
        if not adjuntos:
            logger.warning(f"El correo '{asunto}' no tenía adjuntos Excel válidos. Ignorando.")
            buzon.marcar_como_leido(correo)
            tracker.registrar_proceso(correo_id, "N/A", asunto, "IGNORADO", "Sin adjuntos")
            continue
            
        # 1. Identificar de qué cliente es este correo usando el YAML
        remitente = correo.sender.email_address if hasattr(correo.sender, 'email_address') else ""
        nombre_cliente = identificar_cliente(asunto, remitente, yaml_config)
        
        if not nombre_cliente:
            logger.error(f"No se pudo identificar a qué cliente pertenece el correo: '{asunto}'.")
            buzon.mover_correo(correo, exito=False)
            tracker.registrar_proceso(correo_id, "DESCONOCIDO", asunto, "FALLIDO", "Cliente no identificado")
            continue

        exito_total = True
        
        for archivo in adjuntos:
            # 2. Procesar el archivo
            resultado = procesar_archivo_cliente(nombre_cliente, archivo)
            
            # 3. Preparar Notificación
            # En producción, 'correo.sender' en exchangelib tiene email_address
            remitente = correo.sender.email_address if hasattr(correo.sender, 'email_address') else env.admin_email
            
            mensaje_html = resultado.get("error") if not resultado["exito"] else "Los archivos fueron procesados y validados correctamente."
            
            # 4. Enviar reporte SMTP
            email_svc.enviar_reporte(
                destinatarios=[remitente, env.admin_email],
                cliente=nombre_cliente,
                batch_id=resultado.get("batch_id", "N/A"),
                exito=resultado["exito"],
                mensaje=mensaje_html,
                archivo_adjunto=resultado.get("archivo_zip")
            )
            
            if not resultado["exito"]:
                exito_total = False
        
        # 5. Registrar en la bitácora JSON y mover en el buzón Exchange
        estado_final = "EXITOSO" if exito_total else "FALLIDO"
        tracker.registrar_proceso(correo_id, nombre_cliente, asunto, estado_final)
        buzon.mover_correo(correo, exito=exito_total)
        
def modo_manual(cliente: str, archivo: str):
    """
    Modo manual por consola: 
    Ignora el buzón de correo, procesa un archivo local específico y genera el ZIP.
    """
    logger.seccion(f"Iniciando Modo Manual - Cliente: {cliente.upper()}")
    
    if not Path(archivo).exists():
        logger.error(f"El archivo de entrada no existe: {archivo}")
        return
        
    resultado = procesar_archivo_cliente(cliente, archivo)
    
    if resultado["exito"]:
        logger.success(f"✅ Procesamiento manual exitoso.")
        logger.info(f"📂 Archivo ZIP generado en: {resultado.get('archivo_zip')}")
    else:
        logger.error(f"❌ Procesamiento fallido: {resultado.get('error')}")

def main():
    parser = argparse.ArgumentParser(description="Orquestador Bot RPA LAD-6819")
    parser.add_argument("--cliente", type=str, help="Fuerza la ejecución manual para un cliente específico (ej. cdf, continental, dxc)")
    parser.add_argument("--archivo", type=str, help="Ruta local del archivo Excel a procesar en modo manual")
    args = parser.parse_args()

    logger.separador(char="=", longitud=50)
    logger.info("=== INICIANDO MOTOR RPA ===")
    
    if args.cliente and args.archivo:
        modo_manual(args.cliente.lower(), args.archivo)
    elif args.cliente or args.archivo:
        logger.error("ERROR DE ARGUMENTOS: Para el modo manual debes especificar TANTO --cliente COMO --archivo.")
    else:
        modo_buzon()
        
    logger.info("=== FIN DE EJECUCIÓN ===")
    logger.separador(char="=", longitud=50)
    logger.get_logger().cerrar() # Cerramos limpiamente el archivo log

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logger.critical(f"Error fatal irrecuperable en el orquestador: {e}")
        logger.debug(traceback.format_exc())
