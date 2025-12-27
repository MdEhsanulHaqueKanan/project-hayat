# 1. Base Image: Use lightweight Python 3.10
FROM python:3.10-slim

# 2. Set working directory inside the container
WORKDIR /app

# 3. Install system dependencies (Updated for Debian Bookworm/Trixie)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements and install Python dependencies
COPY requirements.txt .
# Note: We use the CPU version of torch for Docker compatibility 
# (Running GPU in Docker requires complex NVIDIA setup, we want this portable)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the port
EXPOSE 8000

# 7. Command to run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]