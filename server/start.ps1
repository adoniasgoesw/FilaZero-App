# Script para iniciar o servidor FilaZero
# Verifica se a porta está em uso e mata processos conflitantes

Write-Host "🚀 Iniciando servidor FilaZero..." -ForegroundColor Green

# Verificar se a porta 3002 está em uso
$portCheck = netstat -ano | findstr :3002 | findstr LISTENING

if ($portCheck) {
    Write-Host "⚠️  Porta 3002 está em uso. Liberando..." -ForegroundColor Yellow
    
    # Extrair PIDs dos processos na porta 3002
    $pids = $portCheck | ForEach-Object {
        $parts = $_ -split '\s+'
        $parts[-1]
    } | Where-Object { $_ -match '^\d+$' }
    
    # Matar cada processo
    foreach ($pid in $pids) {
        Write-Host "🔄 Matando processo $pid..." -ForegroundColor Yellow
        taskkill /PID $pid /F 2>$null
    }
    
    # Aguardar um pouco
    Start-Sleep -Seconds 2
}

Write-Host "✅ Iniciando servidor..." -ForegroundColor Green
node server.js
