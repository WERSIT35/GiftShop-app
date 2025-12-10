#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting Fullstack App Deployment..."
echo "======================================"

# Get VM IP
VM_IP=$(hostname -I | awk '{print $1}')
echo "📡 VM IP Address: $VM_IP"

# Load environment variables
if [ -f .env ]; then
    echo "📝 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found! Creating from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your values and run again."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Build images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check service status
echo "📊 Checking service status..."
echo ""
echo "Container Status:"
docker-compose ps
echo ""

echo "🧪 Running health checks..."
echo ""

# Check MongoDB
if docker exec fullstack-mongodb mongosh --eval "db.adminCommand('ping')" | grep -q "ok"; then
    echo "✅ MongoDB is healthy"
else
    echo "❌ MongoDB health check failed"
fi

# Check Backend
if curl -s -f http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check Frontend
if curl -s -f http://localhost:80 > /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Show logs from last 10 lines
echo ""
echo "📝 Recent logs:"
echo "Backend logs:"
docker logs fullstack-backend --tail 10
echo ""
echo "Frontend logs:"
docker logs fullstack-frontend --tail 10
echo ""

# Show access information
echo "======================================"
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:    http://$VM_IP"
echo "   Backend API: http://$VM_IP:5000"
echo "   MongoDB:     mongodb://$VM_IP:27017"
echo ""
echo "🔧 Admin Interfaces:"
echo "   MongoDB Express (optional): http://$VM_IP:8081"
echo ""
echo "📋 Quick Commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop:         docker-compose down"
echo "   Restart:      docker-compose restart"
echo "   Update:       git pull && ./deploy.sh"
echo "======================================"