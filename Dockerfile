# Single-stage Dockerfile: run Django backend and serve pre-built React frontend

### Backend runtime stage
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev pkg-config gcc libssl-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend

# Copy pre-built frontend build folder directly from repository
COPY frontend/build ./frontend/build

WORKDIR /app/backend
# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000
CMD ["gunicorn", "backend.wsgi", "--bind", "0.0.0.0:8000", "--log-file", "-"]
