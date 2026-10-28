import pytest
from utils import normalizar_texto, identificar_cliente

def test_normalizar_texto():
    """Prueba que los acentos, mayúsculas y espacios se limpien correctamente."""
    assert normalizar_texto("Nómina CDF") == "nomina cdf"
    assert normalizar_texto("   ESPACIOS  dobles   ") == "espacios dobles"
    assert normalizar_texto("áéíóúÁÉÍÓÚ") == "aeiouaeiou"
    
def test_identificar_cliente_por_dominio():
    """Prueba la detección de clientes basada en el correo del remitente."""
    config_mock = {
        "clientes": {
            "cdf": {
                "activo": True,
                "deteccion": {
                    "palabras_clave_asunto": ["nomina cdf"],
                    "dominios_remitente": ["cdf.com"]
                }
            }
        }
    }
    cliente = identificar_cliente("Cualquier asunto", "recursos@cdf.com", config_mock)
    assert cliente == "cdf"

def test_identificar_cliente_por_asunto():
    """Prueba la detección de clientes basada en palabras clave del asunto."""
    config_mock = {
        "clientes": {
            "continental": {
                "activo": True,
                "deteccion": {
                    "palabras_clave_asunto": ["nomina continental"],
                    "dominios_remitente": ["cont.com"]
                }
            }
        }
    }
    cliente = identificar_cliente("Envío Nómina Continental 2026", "gmail@gmail.com", config_mock)
    assert cliente == "continental"

def test_identificar_cliente_no_encontrado():
    """Prueba el comportamiento cuando un correo no pertenece a ningún cliente mapeado."""
    config_mock = {
        "clientes": {
            "dxc": {
                "activo": True,
                "deteccion": {
                    "palabras_clave_asunto": ["dxc"],
                    "dominios_remitente": ["dxc.com"]
                }
            }
        }
    }
    cliente = identificar_cliente("Hola", "pedro@hotmail.com", config_mock)
    assert cliente is None
