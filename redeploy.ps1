cd C:\Users\vmuser\fassionJewellery\jewellery-backend

# 1. Stop the currently running backend (finds whoever is listening on 9090)
$conn = Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $procId = $conn.OwningProcess | Select-Object -First 1
    Write-Output "Stopping existing backend (PID $procId)..."
    Stop-Process -Id $procId -Force
    Start-Sleep -Seconds 2
} else {
    Write-Output "Nothing currently running on port 9090."
}

# 2. Pull latest code
git pull

# 3. Rebuild
.\mvnw.cmd clean package -DskipTests

# 4. Start it again in the background
Start-Process -FilePath "java" -ArgumentList "-jar target\jewellery-backend.jar" -WindowStyle Hidden -RedirectStandardOutput "backend-out.log" -RedirectStandardError "backend-err.log"

# 5. Confirm it came back up
Start-Sleep -Seconds 15
Get-Content backend-out.log -Tail 20