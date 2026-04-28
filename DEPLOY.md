# 🚀 FAZER DEPLOY NO FIREBASE HOSTING

## Passo 1: Instalar Firebase CLI

Abra o **PowerShell** (Windows) e execute:

```powershell
npm install -g firebase-tools
```

Se receber erro, tente:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois execute novamente o npm install.

---

## Passo 2: Logar no Firebase

No PowerShell, execute:

```powershell
firebase login
```

- Abrirá seu navegador
- Clique em permitir
- Volta para o PowerShell

---

## Passo 3: Fazer Deploy

Na pasta do projeto (`Controle-de-atividade`), execute:

```powershell
cd "C:\Users\GabrielOliveiraDeFar\OneDrive - Argus Solutions\Gabriel\Controle-de-atividade"
firebase deploy --only hosting
```

---

## Passo 4: Acessar Online

Após deploy bem-sucedido, aparecerá algo assim:

```
Hosting URL: https://controle-atividades-89a1e.web.app
```

Copie esse URL e abra no navegador! ✅

---

## ✅ Link Final
```
https://controle-atividades-89a1e.web.app
```

Compartilhe esse link com seus 6 computadores! 🎉

---

## 📝 Notas:
- Primeira vez leva 2-5 minutos
- Próximos deploys são instantâneos
- Alterações são vistas em tempo real (sem cache)
- Todos os PCs veem sincronizado via Firebase Realtime
