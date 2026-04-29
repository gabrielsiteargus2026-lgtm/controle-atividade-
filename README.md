# 📊 Sistema de Controle de Atividades Online

## 🌐 Agora com Sincronização em Tempo Real!

Aplicação web para rastreamento de atividades com múltiplos usuários usando **Firebase Realtime Database**.

---

## 📁 Arquivos Principais

### 1. **index.html** - Aplicação Principal
- ✅ Registre atividades com nome, ticket e descrição
- ✅ Cronômetro em tempo real para cada atividade
- ✅ Histórico completo sincronizado
- ✅ Kanban visual (Em Andamento → Pausado → Concluído)
- ✅ Pausa com justificativa
- ✅ Exportar para CSV
- ✅ Filtros por colaborador, data e status

### 2. **dashboard-ranking.html** - Dashboard Dedicado
- Visualização em tempo real do ranking
- Filtro por data
- Estatísticas gerais
- Atualização automática a cada 2 segundos

### 3. **api-ranking.html** - API de Dados
- Visualização dos dados em formato JSON
- Endpoint para integração com sistemas externos
- Atualização automática

---

## 🚀 Como Usar Localmente

1. Abra `index.html` no navegador
2. Selecione um colaborador e ticket
3. Clique em "Iniciar" para começar a contar o tempo
4. Os dados sincronizam com Firebase automaticamente

---

## 🌍 Usar Online (Firebase Hosting)

### Veja o arquivo [DEPLOY.md](./DEPLOY.md) para instruções completas de deploy

**TL;DR:**
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

**URL Online:** https://controle-atividade-a6b6d.web.app

---

## ✨ Funcionalidades

- 📱 **Responsivo**: Funciona em celular, tablet e desktop
- 🔄 **Sincronização em Tempo Real**: Múltiplos usuários, dados atualizados simultaneamente
- 💾 **Offline-First**: Funciona offline e sincroniza quando voltar online
- 🔐 **Sem Login Necessário**: Acesso aberto para todos
- 📊 **Kanban Visual**: Visualize o status de todas as atividades
- ⏱️ **Cronômetro Preciso**: Atualiza a cada segundo
- 🎯 **Filtros Avançados**: Por colaborador, data e status
- 📥 **Exportar para CSV**: Baixe relatórios

---

## 📱 Colaboradores Pré-cadastrados

- Gabriel Oliveira
- Francielly Cristina
- Edson Michellon
- Angelica Luz
- Brandon Spinoza
- Ellen Ferreira

---

## 💾 Integração com Dashboards Externos

### **Opção 1: iframe no seu Dashboard**
```html
<iframe src="./dashboard-ranking.html" width="600" height="800"></iframe>
```

### **Opção 2: Consumir dados via JavaScript**
```javascript
// Dentro do seu dashboard
function obterRankingAtualizado() {
    const atividades = JSON.parse(localStorage.getItem('atividades')) || [];
    const emAndamento = JSON.parse(localStorage.getItem('atividadesEmAndamento')) || [];
    
    // Processar dados...
    console.log(atividades, emAndamento);
}

// Atualizar a cada 2 segundos
setInterval(obterRankingAtualizado, 2000);
```

### **Opção 3: Ver dados em JSON**
Abra `api-ranking.html` para visualizar todos os dados em formato JSON estruturado.

---

## 💾 Estrutura de Dados

### **Dados de Atividades (localStorage):**
```json
{
  "atividades": [
    {
      "colaborador": "Gabriel Oliveira",
      "ticket": "56888",
      "dataInicio": "24/04/2026",
      "horaInicio": "14:30:00",
      "horaFim": "15:45:30",
      "duracao": "01:15:30",
      "observacao": "Integração com API",
      "justificativa": ""
    }
  ],
  "atividadesEmAndamento": [
    {
      "id": 1713970200000,
      "nome": "Francielly Cristina",
      "ticket": "56889",
      "dataInicio": "24/04/2026",
      "horaInicio": "16:00:00",
      "observacao": ""
    }
  ]
}
```

---

## 🎯 Ranking em Tempo Real

O ranking mostra:
- **🥇 1º lugar** com fundo dourado
- **🥈 2º lugar** com fundo prateado
- **🥉 3º lugar** com fundo bronze
- Demais posições em cinza

### **Métrica de Ranking:**
- **Total**: Atividades iniciadas + finalizadas no dia
- **Finalizadas**: Atividades com hora de término
- **Em Andamento**: Atividades sem hora de término

---

## 🔄 Sincronização Automática

### **Como funciona:**

1. Sistema salva dados no `localStorage` do navegador
2. Dashboard lê dados do `localStorage` automaticamente
3. Atualiza a cada 2 segundos
4. Sem necessidade de servidor ou conexão de rede

### **Dados Sincronizados:**
- ✅ Atividades finalizadas
- ✅ Atividades em andamento
- ✅ Observações
- ✅ Justificativas
- ✅ Timestamps

---

## 📊 Exemplos de Uso

### **Exemplo 1: Monitoramento de Produtividade**
```html
<!-- Seu Dashboard -->
<iframe src="./dashboard-ranking.html" id="ranking"></iframe>
<button onclick="atualizar()">Atualizar Manualmente</button>
```

### **Exemplo 2: Integração com Planilha**
```javascript
// Exportar ranking como CSV
const dados = JSON.parse(localStorage.getItem('atividades'));
// Processar e enviar para planilha...
```

### **Exemplo 3: Notificação em Tempo Real**
```javascript
// Verificar quando alguém ultrapassa 12 horas
setInterval(() => {
    const emAndamento = JSON.parse(localStorage.getItem('atividadesEmAndamento'));
    emAndamento.forEach(atividade => {
        const duracao = Date.now() - atividade.tempoInicio;
        if (duracao > 12 * 60 * 60 * 1000) {
            console.log('⚠️ Atividade excedeu 12 horas!');
        }
    });
}, 1000);
```

---

## ⚙️ Configuração

### **Abrir múltiplas abas/dashboards:**
1. Abra `index.html` na aba 1
2. Abra `dashboard-ranking.html` na aba 2
3. Abra `dashboard-ranking.html` em várias abas se necessário
4. Todas sincronizam automaticamente!

### **Limpar dados:**
```javascript
// No console do navegador
localStorage.clear();
```

---

## 🎨 Personalização

### **Mudar cores do ranking:**
Edite o arquivo CSS em `dashboard-ranking.html`:
```css
.ranking-item.first {
    border-left-color: #ffd700;
    background: linear-gradient(135deg, #fffef0 0%, #fffacd 100%);
}
```

### **Mudar frequência de atualização:**
No dashboard, procure por:
```javascript
setInterval(atualizarRanking, 2000); // Mude 2000 para outro valor em ms
```

---

## 🐛 Troubleshooting

### **Dashboard não atualiza?**
1. Verifique se o localStorage está habilitado
2. Confirme que ambas as abas estão no mesmo domínio
3. Abra o console (F12) e verifique erros

### **Dados não aparecem?**
1. Crie uma atividade no `index.html` primeiro
2. Aguarde 2 segundos para o dashboard sincronizar
3. Recarregue `dashboard-ranking.html` se necessário

### **Ranking vazio?**
1. Confirme que há atividades registradas
2. Verifique o filtro de data
3. Certifique-se de que as datas estão no formato DD/MM/YYYY

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Verifique o localStorage (Aplicação → Storage → Local Storage)
3. Certifique-se de usar navegadores modernos (Chrome, Firefox, Edge, Safari)

---

**Desenvolvido com ❤️ para melhorar a produtividade**
