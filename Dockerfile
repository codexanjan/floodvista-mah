# FLOODVISTA AI — Containerized Backend Deployment
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for GDAL/PROJ/C libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgdal-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and artifacts
COPY src/ ./src/
COPY artifacts/ ./artifacts/
COPY frontend/dist/ ./frontend/dist/
COPY pyproject.toml .

ENV PYTHONPATH=/app/src
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn floodmap.api.server:app --host 0.0.0.0 --port ${PORT:-8000}"]
