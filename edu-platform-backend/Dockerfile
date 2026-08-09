FROM python:3.10-slim

# Prevent python from writing pyc files to disc and buffering stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose backend port
EXPOSE 8000

# Start FastAPI using uvicorn. Render injects its own $PORT (currently 10000)
# and health-checks that exact port — a hardcoded --port 8000 here made the
# container listen on the wrong port and the deploy never went live. Shell
# form (not exec-form JSON) is required so ${PORT:-8000} actually expands;
# falls back to 8000 for local `docker run` where $PORT isn't set.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
