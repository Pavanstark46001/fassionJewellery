cd C:\Users\vmuser\fassionJewellery\jewellery-backend

# Auto-detect JAVA_HOME from java.exe on PATH (mvnw needs this set explicitly, PATH alone isn't enough)
$javaExe = (Get-Command java -ErrorAction SilentlyContinue).Source
if (-not $javaExe) {
    Write-Error "Could not find java.exe on PATH. Aborting."
    exit 1
}
$env:JAVA_HOME = Split-Path (Split-Path $javaExe -Parent) -Parent
Write-Output "Using JAVA_HOME: $env:JAVA_HOME"

# 1. Stop the currently running backend (whoever is listening on 9090)
$conn = Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $procId = $conn.OwningProcess | Select-Object -First 1
    Write-Output "Stopping existing backend (PID $procId)..."
    try {
        Stop-Process -Id $procId -Force -ErrorAction Stop
        Start-Sleep -Seconds 2
    } catch {
        Write-Error "Could not stop PID $procId - $_. Re-run this script from an elevated (Run as Administrator) PowerShell."
        exit 1
    }
} else {
    Write-Output "Nothing currently running on port 9090."
}

# 2. Pull latest code
git pull

# 3. Rebuild
.\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed - aborting, NOT restarting with a stale jar."
    exit 1
}

# 4. Start it again in the background
Start-Process -FilePath "java" -ArgumentList "-jar target\jewellery-backend.jar" -WindowStyle Hidden -RedirectStandardOutput "backend-out.log" -RedirectStandardError "backend-err.log"

# 5. Confirm it came back up
Start-Sleep -Seconds 15
Get-Content backend-out.log -Tail 20