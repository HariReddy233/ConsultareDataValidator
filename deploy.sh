#!/bin/bash

# SAP Data Validator Deployment Script
# Run this script on your Linode server

echo "🚀 Starting SAP Data Validator Deployment..."

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo "📍 Server IP: $SERVER_IP"

# Create backend .env file
echo "📝 Creating backend .env file..."
cat > backend/.env << EOF
# Database Configuration
DB_USER=admin
DB_HOST=66.175.209.51
DB_NAME=sapb1validator
DB_PASSWORD=Chung@2024
DB_PORT=5432

# Server Configuration
PORT=3002
FRONTEND_URL=http://$SERVER_IP:3000
EOF

# Create frontend .env file
echo "📝 Creating frontend .env file..."
cat > frontend/.env << EOF
# API Base URL
REACT_APP_API_URL=http://$SERVER_IP:3002
EOF

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Go back to root
cd ..

echo "✅ Deployment configuration complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && node index.js"
echo ""
echo "2. In another terminal, serve the frontend:"
echo "   cd frontend && npx serve -s build -l 3000"
echo ""
echo "3. Test the application:"
echo "   Backend: http://$SERVER_IP:3002/health"
echo "   Frontend: http://$SERVER_IP:3000"
echo ""
echo "🔒 Security Note: Make sure your Linode firewall allows traffic on ports 3000 and 3002"
