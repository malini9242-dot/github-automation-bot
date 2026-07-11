# Multi-stage Dockerfile: build React frontend, then run Django backend

### Frontend build stage
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

### Backend runtime stage
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev gcc libssl-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend

# Copy frontend build from builder
COPY --from=frontend-builder /app/frontend/build ./frontend/build

WORKDIR /app/backend
# Collect static files (ignore failure if settings not fully configured yet)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000
CMD ["gunicorn", "backend.wsgi", "--bind", "0.0.0.0:8000", "--log-file", "-"]
