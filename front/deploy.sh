#!/bin/bash

# Get your VM's IP (for reference)
VM_IP=$(hostname -I | awk '{print $1}')
echo "Your VM IP: $VM_IP"

# Stop and remove existing container
docker-compose down

# Build and start new container
docker-compose up -d --build

# Check container status
echo "Checking container status..."
sleep 5
docker ps

# Check logs
echo "Container logs:"
docker logs angular-app --tail 20

echo "========================================"
echo "Your app is now running!"
echo "Access it at: http://$VM_IP"
echo "========================================"