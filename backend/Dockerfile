# Usar una imagen oficial de Python ligera
FROM python:3.11-slim

# Metadatos
LABEL maintainer="Blacksmith Research Colombia SAS"
LABEL version="1.0"
LABEL description="Bot RPA LAD-6819"

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Evitar que Python escriba archivos .pyc en disco y forzar logs inmediatos (sin buffer)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema operativo (C++ build tools útiles para Pandas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de dependencias primero (aprovecha la caché de Docker)
COPY requirements.txt .

# Instalar las librerías de Python
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar todo el código fuente al contenedor
COPY . .

# Crear las carpetas de estado (volúmenes recomendados)
RUN mkdir -p logs files/incoming data

# Si quisieras correr un cron dentro del contenedor, podrías instalar 'cron' arriba.
# Pero la mejor práctica en Docker es dejar que el servicio en la nube (ej. Cloud Run o ECS)
# llame al contenedor según su propio scheduler.

# Comando por defecto al iniciar el contenedor (Inicia el modo buzón automático)
CMD ["python", "main.py"]
