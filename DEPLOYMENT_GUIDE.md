# Deployment Guide for Linode Server

## Issue Resolution: ERR_CONNECTION_REFUSED

The error you're experiencing is because the frontend is trying to connect to `localhost:3002` which doesn't work when deployed on a server.

## Quick Fix

### 1. Frontend Configuration

Create a `.env` file in your `frontend` directory with:

```env
REACT_APP_API_URL=http://YOUR_SERVER_IP:3002
```

Replace `YOUR_SERVER_IP` with your actual Linode server IP address.

### 2. Backend Configuration

Create a `.env` file in your `backend` directory with:

```env
# Database Configuration
DB_USER=admin
DB_HOST=66.175.209.51
DB_NAME=sapb1validator
DB_PASSWORD=Chung@2024
DB_PORT=5432

# Server Configuration
PORT=3002
FRONTEND_URL=http://YOUR_SERVER_IP:3000

# For production, replace YOUR_SERVER_IP with your actual server IP
```

### 3. Deploy Steps

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend:**
   ```bash
   cd backend
   node index.js
   ```

3. **Serve the frontend:**
   You can use a simple HTTP server or nginx to serve the built frontend files.

## Security Notes

- For production, consider using HTTPS
- Restrict CORS origins to your specific domain
- Use environment variables for all sensitive data
- Consider using a reverse proxy (nginx) for better security

## Testing

After deployment, test the connection by visiting:
- `http://YOUR_SERVER_IP:3002/health` (Backend health check)
- `http://YOUR_SERVER_IP:3000` (Frontend application)

## Troubleshooting

If you still get connection errors:
1. Check if the backend is running: `curl http://YOUR_SERVER_IP:3002/health`
2. Check firewall settings on your Linode server
3. Verify the port is open and accessible
4. Check server logs for any errors
