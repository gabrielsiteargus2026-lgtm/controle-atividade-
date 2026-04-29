/**
 * 🔥 FIREBASE SINCRONIZAÇÃO CORRIGIDA PARA INDEX.HTML
 * Sincroniza atividades de múltiplos computadores em tempo real
 * Resolve o problema: "Não vejo o que outros computadores fazem"
 * 
 * Data: 29/04/2026
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    push, 
    remove,
    update,
    get,
    onChildAdded,
    onChildChanged,
    onChildRemoved
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoLGZgImxHrg_n8Lq12Ppv80m5HLXQKjs",
  authDomain: "controle-atividade-a6b6d.firebaseapp.com",
  databaseURL: "https://controle-atividade-a6b6d-default-rtdb.firebaseio.com",
  projectId: "controle-atividade-a6b6d",
  storageBucket: "controle-atividade-a6b6d.appspot.com",
  messagingSenderId: "449852839157",
  appId: "1:449852839157:web:da90aec3840427f375e1bc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referências separadas para sincronização incremental
const emAndamentoRef = ref(db, "atividades_em_andamento");
const concluidasRef = ref(db, "atividades_concluidas");

// Rastreamento de IDs
window.firebaseIDs = {
    emAndamento: {},      // { localID: firebaseID }
    concluidas: {}        // { localID: firebaseID }
};

console.log("🔥 Firebase Sincronização Corrigida Carregando...");

/**
 * 📤 SALVAR Atividade EM ANDAMENTO
 * Chamado quando usuario inicia uma nova atividade
 */
window.salvarAtividadeEmAndamentoNoFirebase = function(atividade) {
    try {
        const novaRef = push(emAndamentoRef);
        
        update(novaRef, {
            id: atividade.id,
            nome: atividade.nome,
            ticket: atividade.ticket,
            dataInicio: atividade.dataInicio,
            horaInicio: atividade.horaInicio,
            observacao: atividade.observacao || '',
            tempoInicio: atividade.tempoInicio,
            descricao: atividade.descricao || '',
            status: 'em_andamento',
            computador: window.location.hostname || 'Desconhecido',
            timestamp: new Date().toISOString()
        });

        // Registrar mapping
        window.firebaseIDs.emAndamento[atividade.id] = novaRef.key;
        
        console.log(`✅ [FIREBASE] Atividade iniciada: ${atividade.ticket}`);
        return novaRef.key;
    } catch (error) {
        console.error(`❌ [FIREBASE] Erro ao salvar atividade: ${error.message}`);
    }
};

/**
 * 🔄 ATUALIZAR Atividade EM ANDAMENTO (pause/resume)
 */
window.atualizarAtividadeEmAndamentoNoFirebase = function(atividade, novoStatus) {
    try {
        const firebaseID = window.firebaseIDs.emAndamento[atividade.id];
        if (!firebaseID) {
            console.warn(`⚠️ [FIREBASE] ID não encontrado para ${atividade.id}`);
            return;
        }

        const atividadeRef = ref(db, `atividades_em_andamento/${firebaseID}`);
        
        update(atividadeRef, {
            status: novoStatus,
            observacao: atividade.observacao,
            ultimaAtualizacao: new Date().toISOString()
        });

        console.log(`✅ [FIREBASE] Atividade atualizada: ${atividade.ticket} → ${novoStatus}`);
    } catch (error) {
        console.error(`❌ [FIREBASE] Erro ao atualizar: ${error.message}`);
    }
};

/**
 * ✅ FINALIZAR Atividade (move para concluídas)
 */
window.finalizarAtividadeNoFirebase = function(atividade) {
    try {
        const firebaseID = window.firebaseIDs.emAndamento[atividade.id];
        if (!firebaseID) {
            console.warn(`⚠️ [FIREBASE] ID não encontrado para ${atividade.id}`);
            return;
        }

        // 1. Adicionar às concluídas
        const novaRef = push(concluidasRef);
        update(novaRef, {
            id: atividade.id,
            nome: atividade.nome,
            ticket: atividade.ticket,
            dataInicio: atividade.dataInicio,
            horaInicio: atividade.horaInicio,
            horaFim: new Date().toLocaleTimeString('pt-BR'),
            duracao: atividade.duracao || '00:00:00',
            observacao: atividade.observacao || '',
            descricao: atividade.descricao || '',
            justificativa: atividade.justificativa || '',
            status: 'concluida',
            computador: window.location.hostname || 'Desconhecido',
            dataFinalizacao: new Date().toISOString()
        });

        window.firebaseIDs.concluidas[atividade.id] = novaRef.key;

        // 2. Remover de em andamento
        const emAndamentoItem = ref(db, `atividades_em_andamento/${firebaseID}`);
        remove(emAndamentoItem);

        delete window.firebaseIDs.emAndamento[atividade.id];

        console.log(`✅ [FIREBASE] Atividade finalizada: ${atividade.ticket}`);
    } catch (error) {
        console.error(`❌ [FIREBASE] Erro ao finalizar: ${error.message}`);
    }
};

/**
 * 🗑️ REMOVER Atividade EM ANDAMENTO (se cancelada)
 */
window.removerAtividadeDoFirebase = function(atividadeId) {
    try {
        const firebaseID = window.firebaseIDs.emAndamento[atividadeId];
        if (!firebaseID) return;

        const atividadeRef = ref(db, `atividades_em_andamento/${firebaseID}`);
        remove(atividadeRef);

        delete window.firebaseIDs.emAndamento[atividadeId];
        console.log(`✅ [FIREBASE] Atividade removida: ${atividadeId}`);
    } catch (error) {
        console.error(`❌ [FIREBASE] Erro ao remover: ${error.message}`);
    }
};

/**
 * 📥 ESCUTAR Atividades EM ANDAMENTO (Sincronização em Tempo Real)
 * ISSO MOSTRA O QUE OUTROS COMPUTADORES ESTÃO FAZENDO!
 */
window.escutarAtividadesEmAndamento = function() {
    console.log("👂 [FIREBASE] Escutando atividades em andamento de TODOS os computadores...");
    
    // Nova atividade adicionada
    onChildAdded(emAndamentoRef, (snapshot) => {
        const dados = snapshot.val();
        const firebaseID = snapshot.key;
        
        console.log(`➕ [NOVA] Atividade detectada de OUTRO PC: ${dados.ticket} (${dados.nome})`);
        
        // Adicionar à lista se não existir
        if (!window.atividadesEmAndamento.find(a => a.id === dados.id)) {
            const novaAtividade = {
                ...dados,
                intervaloTimer: null
            };
            window.atividadesEmAndamento.push(novaAtividade);
            window.firebaseIDs.emAndamento[dados.id] = firebaseID;
        }

        // Atualizar UI
        if (typeof window.atualizarKanban === 'function') {
            window.atualizarKanban();
        }
        if (typeof window.atualizarTabela === 'function') {
            window.atualizarTabela();
        }
    });

    // Atividade foi modificada (pausada, etc)
    onChildChanged(emAndamentoRef, (snapshot) => {
        const dados = snapshot.val();
        const firebaseID = snapshot.key;
        
        console.log(`🔄 [UPDATE] Atividade modificada: ${dados.ticket}`);
        
        // Atualizar na lista
        const index = window.atividadesEmAndamento.findIndex(a => a.id === dados.id);
        if (index !== -1) {
            const timer = window.atividadesEmAndamento[index].intervaloTimer;
            window.atividadesEmAndamento[index] = {
                ...dados,
                intervaloTimer: timer  // Preservar timer
            };
        }

        // Atualizar UI
        if (typeof window.atualizarKanban === 'function') {
            window.atualizarKanban();
        }
    });

    // Atividade foi removida (finalizada ou cancelada)
    onChildRemoved(emAndamentoRef, (snapshot) => {
        const dados = snapshot.val();
        
        console.log(`➖ [REMOV] Atividade removida de em andamento: ${dados.ticket}`);
        
        // Remover da lista
        window.atividadesEmAndamento = window.atividadesEmAndamento.filter(a => a.id !== dados.id);
        
        // Limpar timer
        const index = window.atividadesEmAndamento.findIndex(a => a.id === dados.id);
        if (index !== -1 && window.atividadesEmAndamento[index].intervaloTimer) {
            clearInterval(window.atividadesEmAndamento[index].intervaloTimer);
        }

        // Atualizar UI
        if (typeof window.atualizarKanban === 'function') {
            window.atualizarKanban();
        }
    });
};

/**
 * 📥 ESCUTAR Atividades CONCLUÍDAS
 */
window.escutarAtividadesConcluidas = function() {
    console.log("👂 [FIREBASE] Escutando atividades concluídas...");
    
    onChildAdded(concluidasRef, (snapshot) => {
        const dados = snapshot.val();
        const firebaseID = snapshot.key;
        
        // Adicionar ao histórico
        if (!window.atividades.find(a => a.id === dados.id)) {
            window.atividades.push(dados);
            window.firebaseIDs.concluidas[dados.id] = firebaseID;
        }

        console.log(`✅ [CONC] Atividade concluída sincronizada: ${dados.ticket}`);
        
        // Atualizar UI
        if (typeof window.atualizarTabela === 'function') {
            window.atualizarTabela();
        }
        if (typeof window.atualizarKanban === 'function') {
            window.atualizarKanban();
        }
    });
};

/**
 * 🚀 INICIALIZAR SINCRONIZAÇÃO COMPLETA
 */
window.inicializarFirebaseParaMultiplosComputadores = function() {
    console.log("🚀 [FIREBASE] Iniciando sincronização para múltiplos computadores...");
    
    // Carregar dados existentes primeiro
    get(emAndamentoRef).then(snapshot => {
        if (snapshot.exists()) {
            console.log(`📥 [FIREBASE] Carregando ${Object.keys(snapshot.val()).length} atividades existentes...`);
        }
    });

    // Depois ativar listeners para mudanças em tempo real
    window.escutarAtividadesEmAndamento();
    window.escutarAtividadesConcluidas();

    console.log("✅ [FIREBASE] Sincronização ativa - Qualquer mudança será vista em tempo real!");
};

// Auto-inicializar após 500ms
setTimeout(() => {
    window.inicializarFirebaseParaMultiplosComputadores();
}, 500);

console.log("✅ [FIREBASE] Sistema de Sincronização para Múltiplos PCs Carregado!");
