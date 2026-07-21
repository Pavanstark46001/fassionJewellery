# Redeploys the backend: stop -> pull -> rebuild -> restart.
# Run from the repo root: powershell -ExecutionPolicy Bypass -File .\redeploy.ps1

cd $PSScriptRoot\jewellery-backend

# Ask the JVM itself for its real home (works correctly even when the first
# `java` on PATH is Oracle's javapath shim, which has no real JDK layout and
# breaks path-guessing approaches).
$javaHomeLine = & java -XshowSettings:properties -version 2>&1 | Select-String "java\.home"
if (-not $javaHomeLine) {
    Write-Error "Could not determine JAVA_HOME from 'java -XshowSettings:properties'. Aborting."
    exit 1
}
$env:JAVA_HOME = ($javaHomeLine -split "=")[1].Trim()
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