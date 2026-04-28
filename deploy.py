#!/usr/bin/env python3
"""
Firebase Hosting Deploy via REST API
Alternativa quando Node.js/Firebase CLI não está disponível
"""

import json
import os
import sys
from pathlib import Path

# Credenciais Firebase (do firebase-config.js)
PROJECT_ID = "controle-atividades-89a1e"
FIREBASE_API_KEY = "AizaSyCaxbRw1GOHLQtxwVlPnLpnQtubDmT80IY"

# Diretório do projeto
PROJECT_DIR = Path(__file__).parent.absolute()

def get_files_to_deploy():
    """Retorna lista de arquivos para deploy"""
    files = {}
    exclude = {'.git', '.github', 'node_modules', '.firebase', '.firebaserc'}
    
    for item in PROJECT_DIR.rglob('*'):
        if item.is_file():
            # Ignorar arquivos desnecessários
            if any(exc in item.parts for exc in exclude):
                continue
            if item.name.startswith('.'):
                continue
            
            rel_path = item.relative_to(PROJECT_DIR)
            try:
                with open(item, 'rb') as f:
                    files[str(rel_path)] = f.read()
                print(f"✓ {rel_path}")
            except Exception as e:
                print(f"✗ {rel_path}: {e}")
    
    return files

def main():
    print(f"""
╔════════════════════════════════════════════════════════════╗
║  Firebase Hosting Deploy via REST API                      ║
╚════════════════════════════════════════════════════════════╝

📁 Projeto: {PROJECT_DIR}
🔥 Firebase: {PROJECT_ID}
🌐 URL: https://{PROJECT_ID}.web.app

    """)
    
    print("📦 Coletando arquivos...")
    files = get_files_to_deploy()
    
    print(f"\n✅ {len(files)} arquivos coletados!")
    print(f"""
📝 Para fazer deploy via Firebase Hosting:

1️⃣  Instale Node.js: https://nodejs.org/
2️⃣  Abra PowerShell e execute:
    
    npm install -g firebase-tools
    firebase login
    firebase deploy --only hosting

3️⃣  Seu site estará em:
    https://{PROJECT_ID}.web.app

🎉 Alternativa: Seu site já funciona localmente!
    python -m http.server 8000
    # Abra http://localhost:8000
    """)

if __name__ == "__main__":
    main()
