"""API HTTP para ejecutar trabajos del RPA desde React."""

from pathlib import Path

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from firebase_service import firebase_service
from main import procesar_archivo_cliente

app = FastAPI(title="RPA LAD-6819 API", version="1.0.0")
bearer = HTTPBearer()


def usuario_autenticado(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    try:
        token = auth.verify_id_token(credentials.credentials)
        return token["uid"]
    except Exception as error:
        raise HTTPException(status_code=401, detail="Token Firebase inválido") from error


def ejecutar_trabajo(job_id: str) -> None:
    job = firebase_service.get_job(job_id)
    if not job:
        return

    firebase_service.update_job(job_id, {"estado": "PROCESANDO", "error": None})
    user_id = job.get("usuarioId")
    input_path = Path("files") / "jobs" / job_id / Path(job["nombreArchivo"]).name

    try:
        archivo_entrada = job.get("archivoEntrada")
        if not archivo_entrada and user_id:
            archivo_entrada = f"jobs/{user_id}/{job_id}/entrada/{Path(job['nombreArchivo']).name}"
        elif not archivo_entrada:
            raise ValueError("No se encontró la ruta del archivo de entrada en el trabajo.")

        firebase_service.download_input(job_id, archivo_entrada, input_path)
        resultado = procesar_archivo_cliente(job["cliente"], str(input_path))
        values = {
            "estado": "EXITOSO" if resultado["exito"] else "FALLIDO",
            "batchId": resultado.get("batch_id"),
            "error": resultado.get("error"),
        }

        if resultado.get("archivo_zip"):
            values["archivoSalida"] = firebase_service.upload_output(
                job_id, resultado["archivo_zip"], user_id=user_id
            )

        firebase_service.update_job(job_id, values)
    except Exception as error:
        firebase_service.update_job(
            job_id,
            {"estado": "FALLIDO", "error": str(error)},
        )
    finally:
        if input_path.exists():
            input_path.unlink()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/jobs/{job_id}/process", status_code=202)
def process_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(usuario_autenticado),
) -> dict[str, str]:
    job = firebase_service.get_job(job_id)
    if not job or job.get("usuarioId") != user_id:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")

    background_tasks.add_task(ejecutar_trabajo, job_id)
    return {"job_id": job_id, "estado": "PENDIENTE"}
