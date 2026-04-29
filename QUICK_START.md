# ⚡ Guia Rápido - Colocar Online em 2 Minutos

## 1️⃣ Instalar Firebase CLI

Abra o PowerShell e execute:

```powershell
npm install -g firebase-tools
```

Se pedir para confirmar, pressione `Y` e `Enter`.

## 2️⃣ Autenticar no Firebase

```powershell
firebase login
```

- Vai abrir uma janela do navegador
- Faça login com sua conta Google
- Volta automaticamente para o PowerShell

## 3️⃣ Deploy (Enviar para a Nuvem)

Navegue até a pasta do projeto:

```powershell
cd "c:\Users\GabrielOliveiraDeFar\OneDrive - Argus Solutions\Gabriel\Controle-de-atividade"
```

Depois execute:

```powershell
firebase deploy
```

Aguarde aparecer algo como:
```
✔ Deploy complete!
Hosting URL: https://controle-atividade-a6b6d.web.app
```

## ✅ Pronto!

Sua aplicação está online em:
🌐 **https://controle-atividade-a6b6d.web.app**

Compartilhe o link com todos os usuários!

---

## 🔄 Próximas Atualizações

Se fizer mudanças no código, apenas execute de novo:

```powershell
firebase deploy
```

Leva menos de 1 minuto e as mudanças já estão no ar.

---

## 📱 Como Usar

1. Acesse o link no navegador
2. Selecione seu nome (colaborador)
3. Digite o número do ticket
4. Clique em "Iniciar"
5. O cronômetro começa automaticamente
6. Pause, retome ou conclua quando terminar

Todos os usuários conectados veem as mesmas atividades em tempo real!
