# Use official Python 3.12 image
FROM python:3.12-slim

# Set working directory
WORKDIR /usr/src/app

# Prevent Python from writing pyc files and keep stdout unbuffered
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies required for psycopg2 and compiling
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and migrations
COPY ./app ./app
COPY alembic.ini .
COPY ./alembic ./alembic

# Expose the internal port
EXPOSE 8000

# Run Uvicorn with 4 workers as specified in the architecture plan
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
