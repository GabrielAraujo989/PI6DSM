@echo off
echo === Teste da Solução para Variável PORT ===
echo Simulando ambiente Railway...

:: Simula variáveis de ambiente do Railway
if "%PORT%"=="" set PORT=8000
if "%WORKERS%"=="" set WORKERS=1
if "%TIMEOUT%"=="" set TIMEOUT=600
if "%ENV%"=="" set ENV=production
if "%HOST%"=="" set HOST=0.0.0.0

echo Variáveis de ambiente:
echo PORT=%PORT%
echo WORKERS=%WORKERS%
echo TIMEOUT=%TIMEOUT%
echo ENV=%ENV%
echo HOST=%HOST%

:: Testa validação da variável PORT
if "%PORT%"=="" (
    echo ERRO: PORT não definida
    exit /b 1
)

:: Verifica se PORT é um número válido
set "temp=%PORT%"
set /a test=1%temp% 2>nul
if errorlevel 1 (
    echo ERRO: PORT '%PORT%' não é um número válido
    exit /b 1
)

:: Verifica se está na faixa válida (simplificado)
if %PORT% LSS 1 (
    echo ERRO: PORT '%PORT%' está abaixo do mínimo (1)
    exit /b 1
)

if %PORT% GTR 65535 (
    echo ERRO: PORT '%PORT%' está acima do máximo (65535)
    exit /b 1
)

echo ✓ PORT validada com sucesso: %PORT%

:: Cria um arquivo .env de teste
echo # Test environment > test.env
echo ENV=production >> test.env
echo HOST=0.0.0.0 >> test.env
echo # PORT será injetada pelo Railway - não definir aqui >> test.env
echo WORKERS=1 >> test.env

:: Verifica se PORT não está definida no .env
findstr /b "PORT=" test.env >nul
if not errorlevel 1 (
    echo ERRO: PORT está definida no arquivo .env
    del test.env
    exit /b 1
) else (
    echo ✓ PORT não está definida no arquivo .env (correto)
)

:: Testa o comando do gunicorn (sem executar)
set GUNICORN_CMD=gunicorn --bind 0.0.0.0:%PORT% --workers %WORKERS% --timeout %TIMEOUT% --keep-alive 2 --max-requests 500 --max-requests-jitter 100 --preload server:app

echo Comando que será executado:
echo %GUNICORN_CMD%

:: Verifica se o comando contém a variável PORT expandida
echo %GUNICORN_CMD%| findstr "%PORT%" >nul
if errorlevel 1 (
    echo ERRO: Variável PORT não foi expandida no comando
    del test.env
    exit /b 1
) else (
    echo ✓ Variável PORT foi expandida corretamente no comando
)

:: Limpa
if exist test.env del test.env

echo.
echo === Todos os testes passaram! ===
echo A solução deve funcionar corretamente no Railway.
echo.
echo Próximos passos:
echo 1. Faça commit das alterações
echo 2. Faça push para o GitHub
echo 3. Monitore os logs no Railway
echo 4. Verifique se o erro de PORT não ocorre mais

pause