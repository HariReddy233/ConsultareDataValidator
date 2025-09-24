@echo off
REM Consultare Data Validator Deployment Script for Windows
REM Run this script on your Linode server

echo 🚀 Starting Consultare Data Validator Deployment...

REM Get server IP (you'll need to replace this with your actual IP)
set SERVER_IP=YOUR_SERVER_IP_HERE
echo 📍 Please replace YOUR_SERVER_IP_HERE with your actual server IP

REM Create backend .env file
echo 📝 Creating backend .env file...
(
echo # Database Configuration
echo DB_USER=admin
echo DB_HOST=66.175.209.51
echo DB_NAME=sapb1validator
echo DB_PASSWORD=Chung@2024
echo DB_PORT=5432
echo.
echo # Server Configuration
echo PORT=3002
echo FRONTEND_URL=http://%SERVER_IP%:3000
) > backend\.env

REM Create frontend .env file
echo 📝 Creating frontend .env file...
(
echo # API Base URL
echo REACT_APP_API_URL=http://%SERVER_IP%:3002
) > frontend\.env

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

REM Build frontend
echo 🏗️ Building frontend...
call npm run build

REM Go back to root
cd ..

echo ✅ Deployment configuration complete!
echo.
echo 🔧 Next steps:
echo 1. Start the backend server:
echo    cd backend ^&^& node index.js
echo.
echo 2. In another terminal, serve the frontend:
echo    cd frontend ^&^& npx serve -s build -l 3000
echo.
echo 3. Test the application:
echo    Backend: http://%SERVER_IP%:3002/health
echo    Frontend: http://%SERVER_IP%:3000
echo.
echo 🔒 Security Note: Make sure your Linode firewall allows traffic on ports 3000 and 3002
pause
