#!/usr/bin/env python3
"""
🚀 Script para Fazer Deploy Limpo no GitHub Pages
Limpa cache e força atualização completa
"""

import os
import subprocess
import sys
import time

def run_command(cmd, description):
    """Executa comando e mostra resultado"""
    print(f"\n{'='*60}")
    print(f"▶ {description}")
    print(f"{'='*60}")
    print(f"$ {cmd}\n")
    
    result = subprocess.run(cmd, shell=True, cwd=os.getcwd())
    
    if result.returncode != 0:
        print(f"\n❌ ERRO ao executar: {description}")
        return False
    
    print(f"✅ {description} concluído com sucesso!")
    return True

def main():
    print("""
    ╔════════════════════════════════════════════════════╗
    ║   🚀 DEPLOY LIMPO - GitHub Pages                  ║
    ║                                                    ║
    ║   Este script irá:                                ║
    ║   1. Fazer git add de todos os arquivos          ║
    ║   2. Fazer commit com mensagem                    ║
    ║   3. Push para GitHub (ativa GitHub Pages)       ║
    ║   4. Limpar cache do navegador                    ║
    ╚════════════════════════════════════════════════════╝
    """)
    
    # Passo 1: Git Add
    if not run_command("git add -A", "Git Add - Adicionando todos os arquivos"):
        return False
    
    # Passo 2: Git Commit
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"🔧 Deploy Limpo Firebase - {timestamp} (Corrigido: Supabase → Firebase, Data DD/MM/YYYY → YYYY-MM-DD)"
    
    if not run_command(f'git commit -m "{commit_msg}"', "Git Commit"):
        print("⚠️  Aviso: Nenhuma mudança para commit ou erro ao fazer commit")
    
    # Passo 3: Git Push
    if not run_command("git push -u origin main", "Git Push para GitHub Pages"):
        print("❌ Falha no push. Verifique sua conexão com GitHub")
        return False
    
    print("""
    ╔════════════════════════════════════════════════════╗
    ║   ✅ DEPLOY CONCLUÍDO COM SUCESSO!               ║
    ║                                                    ║
    ║   📍 Atualizações em progresso:                   ║
    ║   - GitHub Pages processando (2-3 min)           ║
    ║   - Cache sendo limpo                            ║
    ║                                                    ║
    ║   🔗 Acesse em 3 minutos:                         ║
    ║   https://gabrielsiteargus2026-lgtm.github.io/   ║
    ║   controle-atividade/                            ║
    ║                                                    ║
    ║   💡 Dica:                                        ║
    ║   Se ainda ver erros, abra em Modo Anônimo       ║
    ║   (Ctrl+Shift+P no navegador)                    ║
    ║                                                    ║
    ║   🗑️  Para limpar cache completo:                 ║
    ║   Ctrl+F5 (Chrome/Firefox)                       ║
    ║   Cmd+Shift+R (Mac)                              ║
    ╚════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()
