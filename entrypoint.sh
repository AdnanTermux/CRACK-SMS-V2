#!/bin/bash
set -e

# Start Celery worker in background
celery -A tasks worker --loglevel=info &

# Start Celery beat for periodic tasks
celery -A tasks beat --loglevel=info &

# Start Uvicorn
exec uvicorn main:app --host 0.0.0.0 --port 8000
