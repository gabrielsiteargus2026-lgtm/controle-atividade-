@echo off
chcp 65001 >nul
title 🚀 Deploy - Controle de Atividades

echo.
echo ================================================
echo   🚀 DEPLOY AUTOMATICO - Controle de Atividades
echo ================================================
echo.

:: Verificar se Git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git nao encontrado!
    echo.
    echo Por favor, instale o Git em: https://git-scm.com/download/win
    echo Apos instalar, execute este script novamente.
    pause
    exit /b 1
)

:: Verificar se firebase-config.js foi configurado
findstr /C:"COLE_AQUI" firebase-config.js >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  ATENCAO: firebase-config.js ainda nao foi configurado!
    echo.
    echo Por favor, siga as instrucoes em CONFIGURACAO.md antes de fazer o deploy.
    echo.
    pause
    exit /b 1
)

:: Verificar se repositório Git já foi inicializado
if not exist ".git" (
    echo 📁 Inicializando repositorio Git...
    git init
    git branch -M main
    echo.
    echo ⚠️  PRIMEIRO DEPLOY: Informe a URL do seu repositorio GitHub:
    echo    (Ex: https://github.com/seu-usuario/controle-atividades.git)
    echo.
    set /p REPO_URL="URL do repositorio: "
    git remote add origin %REPO_URL%
)

:: Adicionar todos os arquivos
echo 📦 Preparando arquivos para deploy...
git add .

:: Criar mensagem de commit com data/hora
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATA=%%c-%%b-%%a
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set HORA=%%a:%%b
git commit -m "Deploy: %DATA% %HORA%"

:: Push para GitHub
echo.
echo 🌐 Enviando para o GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao enviar para o GitHub.
    echo    Verifique sua conexao e credenciais do Git.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   ✅ DEPLOY CONCLUÍDO COM SUCESSO!
echo ================================================
echo.
echo 🌐 Seu site estara disponivel em alguns minutos em:
echo    https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO
echo.
echo 💡 Dica: Ative o GitHub Pages em:
echo    GitHub → Repositorio → Settings → Pages → Branch: main
echo.
pause
