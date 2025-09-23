# Quick Deployment Fix for ERR_CONNECTION_REFUSED

## The Problem
Your frontend is trying to connect to `localhost:3002` which doesn't work on a Linode server.

## The Solution

### Step 1: Create Environment Files

**Backend (.env file in `backend/` folder):**
```env
DB_USER=admin
DB_HOST=66.175.209.51
DB_NAME=sapb1validator
DB_PASSWORD=Chung@2024
DB_PORT=5432
PORT=3002
FRONTEND_URL=*
```

**Frontend (.env file in `frontend/` folder):**
```env
REACT_APP_API_URL=http://YOUR_SERVER_IP:3002
```

**Replace `YOUR_SERVER_IP` with your actual Linode server IP address**

### Step 2: Deploy

1. **Upload your code to Linode server**

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Build frontend:**
   ```bash
   npm run build
   ```

4. **Start backend:**
   ```bash
   cd ../backend
   node index.js
   ```

5. **Serve frontend (in another terminal):**
   ```bash
   cd frontend
   npx serve -s build -l 3000
   ```

### Step 3: Test

- Backend health check: `http://YOUR_SERVER_IP:3002/health`
- Frontend application: `http://YOUR_SERVER_IP:3000`

### Step 4: Firewall (Important!)

Make sure your Linode server allows traffic on ports 3000 and 3002:

```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 3002

# Or check current rules
sudo ufw status
```

## That's it! 

The connection error should be resolved. Your frontend will now connect to the correct server IP instead of localhost.
