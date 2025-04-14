# PowerShell script to get an access token

# API endpoint
$url = "http://localhost:8000/token"

# Credentials to use
$username = "varsha24"
$password = "Sa@230304"

Write-Host "Attempting to get token from $url..."

try {
    # First try with application/x-www-form-urlencoded format
    $body = "username=$username&password=$password"
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "`nSuccess! Token obtained.`n"
    Write-Host "Access Token: $($response.access_token)"
    Write-Host "Token Type: $($response.token_type)"
    
    # Display how to use the token
    Write-Host "`nTo use this token in Swagger UI:"
    Write-Host "1. Click the 'Authorize' button"
    Write-Host "2. Enter this in the value field:"
    Write-Host "   Bearer $($response.access_token)"
    
    # Write token to a file for easy access
    $response.access_token | Out-File -FilePath "access_token.txt"
    Write-Host "`nToken also saved to 'access_token.txt'"
    
} catch {
    Write-Host "Error with form data approach: $_"
    
    # Try again with JSON format as fallback
    try {
        Write-Host "`nTrying JSON format instead..."
        $bodyJson = @{
            username = $username
            password = $password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $bodyJson -ContentType "application/json"
        
        Write-Host "`nSuccess! Token obtained with JSON format.`n"
        Write-Host "Access Token: $($response.access_token)"
        Write-Host "Token Type: $($response.token_type)"
        
        # Display how to use the token
        Write-Host "`nTo use this token in Swagger UI:"
        Write-Host "1. Click the 'Authorize' button"
        Write-Host "2. Enter this in the value field:"
        Write-Host "   Bearer $($response.access_token)"
        
        # Write token to a file for easy access
        $response.access_token | Out-File -FilePath "access_token.txt"
        Write-Host "`nToken also saved to 'access_token.txt'"
        
    } catch {
        Write-Host "Error with JSON approach: $_"
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        
        try {
            $responseBody = $_.ErrorDetails.Message
            Write-Host "Response: $responseBody"
        } catch {
            Write-Host "Could not parse error response."
        }
        
        Write-Host "`nTroubleshooting tips:"
        Write-Host "1. Make sure the API server is running at $url"
        Write-Host "2. Verify the username and password are correct"
        Write-Host "3. Check API format requirements (form vs JSON)"
    }
} 