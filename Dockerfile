# Use a base image with Python 10.5 installed
FROM python:3.10.16-slim-bullseye

# Set the working directory
WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project to the working directory
COPY . .

# Set the command to run the Flask app
CMD ["python", "-u", "app.py"]