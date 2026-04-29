# 🚀 Guia de Deploy - Controle de Atividade Online

## 📋 Pré-requisitos

1. **Node.js** instalado (download em https://nodejs.org/)
2. **Conta Google/Firebase** (já criada em controle-atividade-a6b6d)
3. **Git** instalado

## 🔧 Instalação do Firebase CLI

```bash
npm install -g firebase-tools
```

## 🔑 Autenticação com Firebase

```bash
firebase login
```

Isso abrirá seu navegador para autenticar. Faça login com sua conta Google vinculada ao projeto.

## ✅ Verificar Configuração

```bash
firebase projects:list
```

Você deve ver `controle-atividade-a6b6d` na lista.

## 🚀 Fazer Deploy (Primeira vez ou Atualização)

Na pasta do projeto, execute:

```bash
firebase deploy
```

Aguarde a conclusão. Você verá uma URL como:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/controle-atividade-a6b6d/overview
Hosting URL: https://controle-atividade-a6b6d.web.app
```

## 🌐 URL Online

Após o deploy, acesse:
- **Principal**: https://controle-atividade-a6b6d.web.app
- **Alternativa**: https://controle-atividade-a6b6d.firebaseapp.com

## 📱 Compartilhar com Outros

Todos podem acessar usando o link acima pelo navegador (celular, tablet, computador).

## 🔄 Sincronização em Tempo Real

- Múltiplos usuários acessando simultaneamente verão as mesmas atividades
- Alterações são sincronizadas via Firebase Realtime Database em tempo real
- Funciona offline e sincroniza quando voltar online

## 📊 Monitorar Dados

Para ver os dados no Firebase Console:
1. Acesse: https://console.firebase.google.com/
2. Selecione projeto `controle-atividade-a6b6d`
3. Vá em **Realtime Database** → **Dados**

## ⚙️ Configurações Firebase

Os dados são armazenados em:
- `sistema/atividades` → Histórico completo
- `sistema/atividadesEmAndamento` → Atividades ativas
- `sistema/kanbanState` → Estados no Kanban

## 🛑 Problemas Comuns

### "Firebase CLI não encontrado"
```bash
npm install -g firebase-tools
```

### "Falha na autenticação"
```bash
firebase logout
firebase login
```

### "Permissão negada"
Verifique em https://console.firebase.google.com se você é contribuidor do projeto.

## 📝 Dicas

- Deploy é gratuito (até 100 requests/dia)
- Dados no Firebase são gratuitos (até 100 conexões simultâneas)
- Os dados persistem mesmo se todos saírem
- Backup automático pelo Firebase

---

**Pronto!** Sua aplicação agora está online e pronta para múltiplos usuários!
