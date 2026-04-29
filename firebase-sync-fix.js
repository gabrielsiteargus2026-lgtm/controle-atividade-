/**
 * 🔥 CORREÇÃO DE SINCRONIZAÇÃO FIREBASE
 * Implementa sincronização em tempo real entre múltiplos computadores
 * Usa push() para IDs únicos em vez de arrays
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    push, 
    remove,
    update,
    onValue, 
    off,
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

// Referências para cada tipo de atividade
const emAndamentoRef = ref(db, "atividades_em_andamento");
const concluidasRef = ref(db, "atividades_concluidas");

// Objetos globais para rastrear IDs
window.firebaseIDs = {
    emAndamento: {},  // { localID: firebaseID }
    concluidas: {}    // { localID: firebaseID }
};

console.log("🔥 Sistema de Sincronização Firebase Carregado");

/**
 * 📤 Salvar Atividade EM ANDAMENTO no Firebase
 */
window.salvarAtividadeEmAndamento = function(atividade) {
    try {
        const novaAtividadeRef = push(emAndamentoRef);
        
        update(novaAtividadeRef, {
            id: atividade.id,
            nome: atividade.nome,
            ticket: atividade.ticket,
            dataInicio: atividade.dataInicio,
            horaInicio: atividade.horaInicio,
            observacao: atividade.observacao,
            tempoInicio: atividade.tempoInicio,
            descricao: atividade.descricao,
            status: atividade.status || "em_andamento",
            timestamp: new Date().toISOString(),
            computador: window.location.hostname
        });

        // Registrar ID local → Firebase
        window.firebaseIDs.emAndamento[atividade.id] = novaAtividadeRef.key;
        
        console.log(`✅ Atividade "${atividade.ticket}" enviada ao Firebase`);
        return novaAtividadeRef.key;
    } catch (error) {
        console.error("❌ Erro ao salvar atividade em andamento:", error);
    }
};

/**
 * 📤 Atualizar Atividade EM ANDAMENTO no Firebase
 */
window.atualizarAtividadeEmAndamento = function(atividade) {
    try {
        const firebaseID = window.firebaseIDs.emAndamento[atividade.id];
        if (!firebaseID) {
            console.warn(`⚠️ ID Firebase não encontrado para ${atividade.id}`);
            return;
        }

        const atividadeRef = ref(db, `atividades_em_andamento/${firebaseID}`);
        
        update(atividadeRef, {
            status: atividade.status,
            observacao: atividade.observacao,
            descricao: atividade.descricao,
            ultimaAtualizacao: new Date().toISOString()
        });

        console.log(`✅ Atividade "${atividade.ticket}" atualizada no Firebase`);
    } catch (error) {
        console.error("❌ Erro ao atualizar atividade em andamento:", error);
    }
};

/**
 * 📤 Finalizar Atividade (Move para concluídas e remove de em andamento)
 */
window.finalizarAtividadeNoFirebase = function(atividade) {
    try {
        const firebaseID = window.firebaseIDs.emAndamento[atividade.id];
        if (!firebaseID) {
            console.warn(`⚠️ ID Firebase não encontrado para ${atividade.id}`);
            return;
        }

        // 1. Salvar em concluídas
        const novaRef = push(concluidasRef);
        update(novaRef, {
            id: atividade.id,
            nome: atividade.nome,
            ticket: atividade.ticket,
            dataInicio: atividade.dataInicio,
            horaInicio: atividade.horaInicio,
            horaFim: new Date().toLocaleTimeString('pt-BR'),
            duracao: atividade.duracao,
            observacao: atividade.observacao,
            descricao: atividade.descricao,
            status: "concluida",
            dataFinalizacao: new Date().toISOString(),
            computador: window.location.hostname
        });

        window.firebaseIDs.concluidas[atividade.id] = novaRef.key;

        // 2. Remover de em andamento
        const emAndamentoRefItem = ref(db, `atividades_em_andamento/${firebaseID}`);
        remove(emAndamentoRefItem);

        console.log(`✅ Atividade "${atividade.ticket}" finalizada e sincronizada`);
    } catch (error) {
        console.error("❌ Erro ao finalizar atividade:", error);
    }
};

/**
 * 📥 Escutar Atividades EM ANDAMENTO (Sincronização em Tempo Real)
 */
window.escutarAtividadesEmAndamento = function(callback) {
    console.log("👂 Escutando atividades em andamento...");
    
    onChildAdded(emAndamentoRef, (snapshot) => {
        const dados = snapshot.val();
        const firebaseID = snapshot.key;
        
        console.log(`➕ Nova atividade detectada: ${dados.ticket} (${dados.nome})`);
        
        // Adicionar à lista local se não existir
        if (window.atividadesEmAndamento && Array.isArray(window.atividadesEmAndamento)) {
            const existe = window.atividadesEmAndamento.some(a => a.id === dados.id);
            if (!existe) {
                window.atividadesEmAndamento.push({
                    ...dados,
                    intervaloTimer: null
                });
                window.firebaseIDs.emAndamento[dados.id] = firebaseID;
            }
        }

        if (callback) callback("added", dados, firebaseID);
    });

    onChildChanged(emAndamentoRef, (snapshot) => {
        const dados = snapshot.val();
        const firebaseID = snapshot.key;
        
        console.log(`🔄 Atividade atualizada: ${dados.ticket}`);
        
        // Atualizar na lista local
        if (window.atividadesEmAndamento && Array.isArray(window.atividadesEmAndamento)) {
            const index = window.atividadesEmAndamento.findIndex(a => a.id === dados.id);
            if (index !== -1) {
                window.atividadesEmAndamento[index] = {
                    ...dados,
                    intervaloTimer: window.atividadesEmAndamento[index].intervaloTimer
                };
            }
        }

        if (callback) callback("changed", dados, firebaseID);
    });

    onChildRemoved(emAndamentoRef, (snapshot) => {
        const dados = snapshot.val();
        const firebaseID = snapshot.key;
        
        console.log(`➖ Atividade removida: ${dados.ticket}`);
        
        // Remover da lista local
        if (window.atividadesEmAndamento && Array.isArray(window.atividadesEmAndamento)) {
            window.atividadesEmAndamento = window.atividadesEmAndamento.filter(a => a.id !== dados.id);
            delete window.firebaseIDs.emAndamento[dados.id];
        }

        if (callback) callback("removed", dados, firebaseID);
    });
};

/**
 * 📥 Escutar Atividades CONCLUÍDAS (Sincronização em Tempo Real)
 */
window.escutarAtividadesConcluidas = function(callback) {
    console.log("👂 Escutando atividades concluídas...");
    
    onChildAdded(concluidasRef, (snapshot) => {
        const dados = snapshot.val();
        const firebaseID = snapshot.key;
        
        console.log(`✅ Atividade concluída: ${dados.ticket}`);
        
        // Adicionar ao histórico
        if (window.atividades && Array.isArray(window.atividades)) {
            const existe = window.atividades.some(a => a.id === dados.id);
            if (!existe) {
                window.atividades.push(dados);
                window.firebaseIDs.concluidas[dados.id] = firebaseID;
            }
        }

        if (callback) callback("added", dados, firebaseID);
    });
};

/**
 * 🔄 Inicializar Sincronização Completa
 */
window.inicializarSincronizacaoFirebase = function() {
    console.log("🚀 Iniciando sincronização firebase...");
    
    // Sincronizar em andamento
    window.escutarAtividadesEmAndamento((tipo, dados, firebaseID) => {
        if (typeof window.atualizarTabela === 'function') {
            window.atualizarTabela();
        }
        if (typeof window.atualizarKanban === 'function') {
            window.atualizarKanban();
        }
    });
    
    // Sincronizar concluídas
    window.escutarAtividadesConcluidas((tipo, dados, firebaseID) => {
        if (typeof window.atualizarTabela === 'function') {
            window.atualizarTabela();
        }
    });
};

// Auto-inicializar
setTimeout(() => {
    window.inicializarSincronizacaoFirebase();
}, 1000);

console.log("✅ Sistema de Sincronização Firebase Pronto!");
