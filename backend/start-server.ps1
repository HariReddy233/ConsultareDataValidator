Write-Host "Starting SAP Data Validator Backend Server..." -ForegroundColor Green
Write-Host ""

# Kill any existing Node.js processes on port 3002
$processes = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        Write-Host "Killing process $pid on port 3002" -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

# Wait a moment
Start-Sleep -Seconds 2

# Start the server
Write-Host "Starting server on port 3002..." -ForegroundColor Green
try {
    node index.js
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Write-Host "Make sure you're in the backend directory and have run 'npm install'" -ForegroundColor Yellow
}

Read-Host "Press Enter to continue"





