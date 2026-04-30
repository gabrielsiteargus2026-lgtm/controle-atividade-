# 🚀 Guia de Configuração e Deploy

## Visão Geral

Este sistema usa o **Firebase Realtime Database** (gratuito) para sincronizar dados em tempo real entre todos os computadores, e o **GitHub Pages** (gratuito) para hospedar o site.

---

## ✅ PASSO 1 — Criar conta no Firebase (gratuita)

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Criar um projeto"**
3. Dê um nome (ex: `controle-atividades`)
4. Desative o Google Analytics (opcional) e clique em **"Criar projeto"**

---

## ✅ PASSO 2 — Criar o Banco de Dados

1. No painel do Firebase, clique em **"Realtime Database"** (menu lateral)
2. Clique em **"Criar banco de dados"**
3. Escolha a região mais próxima (ex: `us-central1`)
4. Selecione **"Iniciar no modo de teste"** → Ativar

---

## ✅ PASSO 3 — Copiar as Credenciais

1. Clique na **engrenagem ⚙️** (Configurações do projeto) → **"Configurações do projeto"**
2. Role até **"Seus apps"** → clique em **`</>`** (Web)
3. Dê um apelido (ex: `controle-web`) → **"Registrar app"**
4. Copie o objeto `firebaseConfig` que aparece

---

## ✅ PASSO 4 — Editar o arquivo `firebase-config.js`

Abra o arquivo `firebase-config.js` com o Bloco de Notas e substitua os valores:

```js
const FIREBASE_CONFIG = {
    apiKey: "AIzaSy...",              // ← Cole seu valor aqui
    authDomain: "meu-projeto.firebaseapp.com",
    databaseURL: "https://meu-projeto-default-rtdb.firebaseio.com",
    projectId: "meu-projeto",
    storageBucket: "meu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

---

## ✅ PASSO 5 — Criar repositório no GitHub (gratuito)

1. Acesse: https://github.com/ e faça login (ou crie uma conta)
2. Clique em **"New repository"** (Novo repositório)
3. Nome: `controle-atividades`
4. Deixe **Público** → **"Create repository"**
5. Copie a URL do repositório (ex: `https://github.com/seu-usuario/controle-atividades.git`)

---

## ✅ PASSO 6 — Instalar o Git no Windows

Se ainda não tiver o Git:

1. Acesse: https://git-scm.com/download/win
2. Baixe e instale com as opções padrão
3. Reinicie o computador

---

## ✅ PASSO 7 — Fazer o Deploy

1. Coloque todos os arquivos desta pasta em uma pasta no seu computador
2. **Dê duplo clique** no arquivo `deploy.bat`
3. Na primeira vez, informe a URL do repositório GitHub quando solicitado
4. Aguarde o upload terminar

---

## ✅ PASSO 8 — Ativar o GitHub Pages

1. Acesse seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **"Branch"**, selecione `main` e clique em **Save**
5. Aguarde 1-2 minutos

Seu site estará disponível em:
```
https://SEU-USUARIO.github.io/controle-atividades/
```

---

## 🔄 Como fazer atualizações futuras

Sempre que quiser atualizar o site:
1. Edite os arquivos na pasta
2. Dê **duplo clique** no `deploy.bat`
3. O site é atualizado automaticamente!

---

## 🔒 Regras de Segurança do Firebase (Recomendado)

Após testar, acesse Firebase → Realtime Database → Regras e configure:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Para produção com senha, entre em contato para uma configuração de autenticação.

---

## ❓ Dúvidas Frequentes

**Q: Os dados somem quando eu fechar o navegador?**
A: Não! Os dados ficam salvos no Firebase na nuvem.

**Q: Funciona em celular também?**
A: Sim! O site funciona em qualquer dispositivo com navegador.

**Q: O site fica fora do ar?**
A: GitHub Pages tem 99.9% de uptime. Firebase também.

**Q: É gratuito para sempre?**
A: O plano gratuito do Firebase suporta até 1GB de dados e 10GB/mês de transferência — mais que suficiente para uso interno de equipe.
