@echo off
echo Stopping existing HealLink Backend (Port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo Starting Backend...
start "HealLink Backend" cmd /k "cd backend && npm start"

echo Starting Web Dashboard (if not already running, check Port 3000)...
start "HealLink Web Dashboard" cmd /k "cd web-dashboard && npm run dev"

echo Starting Mobile App...
start "HealLink Mobile App" cmd /k "cd mobile-app && npx expo start"

echo IMPORTANT: If dashboard or mobile app windows were already open, you may close them or let them continue running.
echo The Backend has been restarted to apply the latest fixes.
pause
