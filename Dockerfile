# ============================================================================
# Django App (FUGA) - Device Configuration Generator
# ============================================================================
# Multi-stage build for optimized production image
# ============================================================================

FROM python:3.12-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# Dependencies Stage
# ============================================================================
FROM base AS dependencies

# Copy requirements
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ============================================================================
# Production Stage
# ============================================================================
FROM base AS production

# Copy installed dependencies from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy application code
COPY . /app/

# Create directories for static files and database
RUN mkdir -p /app/staticfiles && \
    mkdir -p /app/media

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user for security
RUN useradd -m -u 1000 django && \
    chown -R django:django /app

USER django

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/', timeout=5)" || exit 1

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "4", "--timeout", "60", "--access-logfile", "-", "--error-logfile", "-", "FUGA.wsgi:application"]

