# 🔐 Como Adicionar Firebase Token ao GitHub

## Informações do Token

Seu arquivo JSON de credenciais foi baixado e está em:
`C:\Users\GabrielOliveiraDeFar\Downloads\controle-atividade-a6b6d-firebase-adminsdk-fbsvc-1a05897869.json`

---

## ✅ Passos para Adicionar o Secret no GitHub

### 1️⃣ Ir para o Repositório no GitHub
- Abra seu navegador e vá para:
  **https://github.com/gabrielsiteargus2026-lgtm/controle-atividade-**

### 2️⃣ Acessar Settings (Configurações)
- No topo do repositório, procure pela aba **Settings**
- Clique nela (fica entre Pull requests e outras opções)

### 3️⃣ Acessar Secrets (Segredos)
- No menu esquerdo, procure por **"Secrets and variables"**
- Expanda e clique em **"Actions"**

### 4️⃣ Criar Novo Secret
- Clique no botão **"New repository secret"** (botão verde no canto superior direito)

### 5️⃣ Preencher os Dados

**Name (Nome):**
```
FIREBASE_TOKEN
```

**Secret (Valor):**
1. Abra o arquivo `controle-atividade-a6b6d-firebase-adminsdk-fbsvc-1a05897869.json`
2. Selecione TUDO (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole na caixa "Secret" (Ctrl+V)

### 6️⃣ Salvar
- Clique em **"Add secret"** (botão verde)

---

## ✅ Pronto!

O deploy automático agora está ativado. Próximo push para `main` iniciará o deploy no Firebase!

### Para fazer deploy:
```bash
git add .
git commit -m "Nova versão para deploy"
git push origin main
```

O GitHub Actions processará automaticamente!

---

**Observações:**
- O arquivo JSON contém dados sensíveis. Nunca compartilhe publicamente!
- O secret é criptografado e seguro no GitHub
- Apenas ações do repositório podem acessar este secret
