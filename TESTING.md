# 🧪 Guia de Testes

## ✅ Testar Localmente Primeiro

Antes de fazer o deploy, teste em múltiplas abas do navegador para simular múltiplos usuários.

### 1️⃣ Abra a aplicação

```
http://localhost:5000/index.html
(ou simplesmente abra o arquivo index.html no navegador)
```

### 2️⃣ Simule múltiplos usuários

1. Abra **3 abas** do navegador
2. Em cada aba, acesse: `index.html`
3. Em cada aba, selecione um **colaborador diferente**

### 3️⃣ Teste as funcionalidades

#### Na Aba 1 (Gabriel):
- [ ] Selecione "Gabriel Oliveira"
- [ ] Digite ticket "123"
- [ ] Clique em "Iniciar"
- [ ] Veja o cronômetro começar
- [ ] Observe no Kanban "Em Andamento"

#### Na Aba 2 (Francielly):
- [ ] Abra a mesma página
- [ ] Selecione "Francielly Cristina"
- [ ] Digite ticket "456"
- [ ] Clique em "Iniciar"
- [ ] **Veja se a atividade do Gabriel ainda aparece no Kanban?** ✅

#### Na Aba 3 (Edson):
- [ ] Abra a mesma página
- [ ] Selecione "Edson Michellon"
- [ ] Digite ticket "789"
- [ ] Clique em "Iniciar"

### 4️⃣ Teste Operações

#### Pausar uma Atividade
1. Na Aba 2, clique em "⏸️ Pausar" na atividade do Kanban
2. Escreva o motivo da pausa
3. Clique em "Pausar"
4. Veja se a atividade saiu de "Em Andamento" para "Pausado" ✅
5. Veja em **TODAS as abas** se a mudança aparece ✅

#### Concluir uma Atividade
1. Na Aba 1, clique em "✓ Concluir"
2. Deixe em branco ou escreva uma observação
3. Clique em "Concluir com Observação" ou "Concluir Sem Observação"
4. Veja se a atividade saiu do Kanban
5. Veja na tabela "Histórico de Atividades" se apareceu lá ✅
6. Verifique em **TODAS as abas** se o histórico atualizou ✅

#### Filtros
1. Na Aba 1, use os filtros para buscar "Gabriel Oliveira"
2. Clique em "🔎" para aplicar
3. Veja se mostra apenas atividades do Gabriel
4. Clique em "↺" para limpar
5. Veja se mostra tudo de novo

#### Exportar para CSV
1. Clique em "📥 Exportar para CSV"
2. Um arquivo deve baixar
3. Abra o arquivo e veja se tem os dados corretos

---

## 🔥 Sincronização (Teste Importante!)

### Teste de Sincronização em Tempo Real

1. Abra 2 abas lado a lado (use janela dividida se possível)
2. Na Aba 1, inicie uma atividade
3. **Sem recarregar a Aba 2**, veja se a atividade aparece lá também
4. Se apareceu **instantaneamente**, sincronização OK ✅

### Teste de Offline

1. Abra DevTools (F12)
2. Vá em "Application" → "Service Workers" ou use Network
3. Coloque offline
4. Inicie uma atividade
5. Volte online
6. Veja se a atividade sincronizou com Firebase ✅

---

## ✅ Checklist Final

Antes de fazer deploy para produção:

- [ ] Múltiplos usuários veem os mesmos dados
- [ ] Alterações aparecem em tempo real em todas as abas
- [ ] Pausar atualiza em todas as abas
- [ ] Concluir atualiza em todas as abas
- [ ] Filtros funcionam corretamente
- [ ] Exportar CSV gera arquivo com dados
- [ ] Histórico persiste após recarregar a página
- [ ] Funcionamento offline está OK (sync após voltar online)

Se todos os testes passarem ✅, está pronto para deploy!

---

## 🚀 Fazer Deploy

Quando tudo estiver testado:

```powershell
firebase deploy
```

Veja [QUICK_START.md](./QUICK_START.md) para instruções rápidas.
