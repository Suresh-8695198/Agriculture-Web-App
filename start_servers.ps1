Write-Host "Starting AgriConnect Servers..." -ForegroundColor Green

Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd backend && venv\Scripts\activate && python manage.py runserver" -WindowStyle Normal
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd frontend && npm run dev" -WindowStyle Normal

Write-Host "Servers started!"
Write-Host "Backend: http://127.0.0.1:8000"
Write-Host "Frontend: http://localhost:5173"
Read-Host "Press Enter to exit..."
