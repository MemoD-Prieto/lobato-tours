# Database initialization script for Windows (PowerShell)
# This script initializes the database schema on a fresh database

Write-Host "Initializing database schema..."

# Wait for the app to be ready
Write-Host "Waiting for application to be ready..."
$maxRetries = 30
$retryCount = 0
$appReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/init-simple" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "Application is ready!"
            $appReady = $true
            break
        }
    }
    catch {
        # App not ready yet, continue waiting
    }
    
    $retryCount++
    Write-Host "   Attempt $retryCount/$maxRetries..."
    Start-Sleep -Seconds 2
}

if (-not $appReady) {
    Write-Host "ERROR: Application did not become ready in time"
    exit 1
}

# Initialize the database
Write-Host "Initializing database schema..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/init-simple" -Method POST -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.ok -eq $true) {
        Write-Host "SUCCESS: Database initialized successfully!"
        Write-Host ""
        Write-Host "Default admin credentials:"
        Write-Host "   Username: admin"
        Write-Host "   Password: admin123"
        Write-Host ""
        Write-Host "Application is ready at: http://localhost:3000"
    } else {
        Write-Host "ERROR: Database initialization failed:"
        Write-Host $response.Content
        exit 1
    }
}
catch {
    Write-Host "ERROR: Error initializing database:"
    Write-Host $_.Exception.Message
    exit 1
}
