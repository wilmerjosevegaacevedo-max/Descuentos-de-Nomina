import pytest
import os
import tempfile
from records_data import ProcessTracker

def test_flujo_completo_process_tracker():
    """
    Prueba que la bitácora JSON registre correctamente los correos
    y devuelva True sólo cuando el estado fue EXITOSO.
    """
    # Usamos una carpeta temporal para no ensuciar los datos reales durante el test
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_file = os.path.join(temp_dir, "test_records.json")
        tracker = ProcessTracker(filepath=temp_file)
        
        # 1. Al inicio, un ID nuevo NO debe estar procesado
        assert tracker.ya_fue_procesado("ID_123") == False
        
        # 2. Registramos que hubo un intento FALLIDO
        tracker.registrar_proceso("ID_123", "cdf", "Asunto", "FALLIDO")
        
        # Como fue fallido, debe permitir que se vuelva a procesar
        assert tracker.ya_fue_procesado("ID_123") == False
        
        # 3. Registramos que ahora sí fue EXITOSO
        tracker.registrar_proceso("ID_123", "cdf", "Asunto", "EXITOSO")
        
        # Ahora el sistema debe bloquearlo para que no se duplique
        assert tracker.ya_fue_procesado("ID_123") == True
