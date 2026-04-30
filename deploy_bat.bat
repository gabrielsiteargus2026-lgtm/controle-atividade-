@echo off
title Deploy - Controle de Atividades

echo.
echo ================================================
echo   DEPLOY AUTOMATICO - Controle de Atividades
echo ================================================
echo.

:: Verificar se Git esta instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Git nao encontrado!
    echo.
    echo Por favor, instale o Git em: https://git-scm.com/download/win
    echo Apos instalar, execute este script novamente.
    pause
    exit /b 1
)

:: Verificar se repositorio Git ja foi inicializado
if not exist ".git" (
    echo Inicializando repositorio Git...
    git init
    git branch -M main
    echo.
    echo PRIMEIRO DEPLOY: Informe a URL do seu repositorio GitHub:
    echo    Ex: https://github.com/seu-usuario/controle-atividades.git
    echo.
    set /p REPO_URL="URL do repositorio: "
    git remote add origin %REPO_URL%
)

:: Adicionar todos os arquivos
echo Preparando arquivos para deploy...
git add .

:: Criar commit com data/hora
git commit -m "Deploy automatico"

:: Push para GitHub
echo.
echo Enviando para o GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ERRO ao enviar para o GitHub.
    echo Verifique sua conexao e credenciais do Git.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo ================================================
echo.
echo Seu site estara disponivel em alguns minutos em:
echo https://SEU-USUARIO.github.io/controle-atividades
echo.
pause
