/**
 * 🔥 SISTEMA DE SINCRONIZAÇÃO FIREBASE - SOLUÇÃO DEFINITIVA
 * 
 * Problema: Cada PC tem versão diferente dos dados
 * Solução: Um único ponto de verdade no Firebase
 * 
 * Arquitetura:
 * - firebase.com/controle-atividade/dados = ÚNICA SOURCE OF TRUTH
 * - localStorage = cache local (fallback)
 * - Todos os PCs sincronizam COM este ponto único
 * 
 * Data: 29/04/2026
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    get,
    set,
    update,
    remove,
    onValue
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

// ÚNICO ponto de verdade no Firebase
const dadosRef = ref(db, "controle-atividade/dados");

// Rastreamento de sincronização
window.firebaseSync = {
    conectado: false,
    ultimaSincronizacao: null,
    sincronizando: false
};

console.log("🔥 [SYNC] Iniciando sistema de sincronização centralizado...");

/**
 * 📥 CARREGAR dados do Firebase e sincronizar com localStorage
 */
async function carregarDoFirebase() {
    try {
        const snapshot = await get(dadosRef);
        const dados = snapshot.val();

        if (!dados) {
            console.log("⚠️ [SYNC] Firebase vazio - usando cache local");
            return null;
        }

        console.log("✅ [SYNC] Dados carregados do Firebase", {
            emAndamento: dados.atividadesEmAndamento?.length || 0,
            concluidas: dados.atividades?.length || 0
        });

        // Atualizar localStorage com dados do Firebase
        localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
        localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
        localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));

        // Atualizar estado global
        window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
        window.atividades = dados.atividades || [];
        window.kanbanState = dados.kanbanState || {};

        window.firebaseSync.ultimaSincronizacao = new Date().toISOString();

        return dados;
    } catch (error) {
        console.error("❌ [SYNC] Erro ao carregar Firebase:", error.message);
        return null;
    }
}

/**
 * 📤 SALVAR dados no Firebase (único ponto de escrita)
 */
async function salvarNoFirebase(emAndamento, concluidas, kanban) {
    if (window.firebaseSync.sincronizando) {
        console.log("⏳ [SYNC] Sincronização em progresso, aguardando...");
        return;
    }

    window.firebaseSync.sincronizando = true;

    try {
        await set(dadosRef, {
            atividadesEmAndamento: emAndamento || [],
            atividades: concluidas || [],
            kanbanState: kanban || {},
            ultimaAtualizacao: new Date().toISOString(),
            computador: window.location.hostname || 'desconhecido'
        });

        window.firebaseSync.ultimaSincronizacao = new Date().toISOString();
        console.log("✅ [SYNC] Dados salvos no Firebase");
    } catch (error) {
        console.error("❌ [SYNC] Erro ao salvar Firebase:", error.message);
    } finally {
        window.firebaseSync.sincronizando = false;
    }
}

/**
 * 🔄 SINCRONIZAÇÃO EM TEMPO REAL
 * Qualquer mudança no Firebase é propagada para TODOS os PCs
 */
function inicializarSincronizacaoTempoReal() {
    console.log("👂 [SYNC] Configurando listener em tempo real...");

    onValue(dadosRef, async (snapshot) => {
        const dados = snapshot.val();

        console.log("🔔 [SYNC] Listener ativado - dados do Firebase:", {
            emAndamento: dados?.atividadesEmAndamento?.length || 0,
            concluidas: dados?.atividades?.length || 0
        });

        if (!dados) {
            console.log("⚠️ [SYNC] Nenhum dado no Firebase");
            return;
        }

        // SEMPRE atualizar com dados do Firebase (força sincronização)
        console.log("🔄 [SYNC] Atualizando com dados do Firebase...");

        window.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(a => ({
            ...a,
            intervaloTimer: window.atividadesEmAndamento?.find(x => x.id === a.id)?.intervaloTimer || null
        }));
        window.atividades = dados.atividades || [];
        window.kanbanState = dados.kanbanState || {};

        // Atualizar localStorage imediatamente
        localStorage.setItem('atividadesEmAndamento', JSON.stringify(window.atividadesEmAndamento));
        localStorage.setItem('atividades', JSON.stringify(window.atividades));
        localStorage.setItem('kanbanState', JSON.stringify(window.kanbanState));

        window.firebaseSync.conectado = true;
        window.firebaseSync.ultimaSincronizacao = new Date().toISOString();

        console.log("✅ [SYNC] Dados sincronizados com sucesso");

        // Reiniciar timers das atividades
        window.atividadesEmAndamento.forEach(atividade => {
            if (!atividade.intervaloTimer && atividade.tempoInicio) {
                if (typeof window.iniciarCronometro === 'function') {
                    window.iniciarCronometro(atividade.id);
                }
            }
        });

        // Atualizar interface de FORMA SEGURA (sem recontratar)
        try {
            if (typeof window.atualizarTabela === 'function') {
                window.atualizarTabela();
            }
            if (typeof window.atualizarKanban === 'function') {
                window.atualizarKanban();
            }
        } catch (error) {
            console.error("⚠️ [SYNC] Erro ao atualizar UI:", error.message);
        }

    }, (error) => {
        console.error("❌ [SYNC] Erro no listener:", error.message);
        window.firebaseSync.conectado = false;
    });

    console.log("✅ [SYNC] Listener configurado e ativo");
}

/**
 * 🎯 INTERCEPTAR a função salvarDados() original
 * Agora salva tanto em localStorage quanto em Firebase
 */
let salvarDadosOriginal = null;

// Aguardar a definição de salvarDados no index.html
setTimeout(() => {
    if (typeof window.salvarDados === 'function') {
        salvarDadosOriginal = window.salvarDados;
        console.log("✅ [SYNC] Função salvarDados capturada");
        
        // Substituir pela versão que sincroniza com Firebase
        window.salvarDados = function() {
            // Chamar original (localStorage)
            if (salvarDadosOriginal) {
                salvarDadosOriginal.call(window);
            }

            // Adicionar: salvar também no Firebase (com delay para garantir que localStorage foi atualizado)
            setTimeout(() => {
                console.log("💾 [SYNC] Salvando em Firebase...");
                salvarNoFirebase(
                    window.atividadesEmAndamento || [],
                    window.atividades || [],
                    window.kanbanState || {}
                );
            }, 50);
        };
    } else {
        console.warn("⚠️ [SYNC] salvarDados não encontrada ainda");
    }
}, 1000);

/**
 * 🚀 INICIALIZAR
 */
window.inicializarSincronizacaoCentralizada = async function() {
    console.log("🚀 [SYNC] Inicializando sincronização centralizada...");

    // 1. Carregar dados do Firebase
    const dados = await carregarDoFirebase();

    // 2. Se não houver dados no Firebase, tentar usar localStorage
    if (!dados) {
        console.log("💾 [SYNC] Usando dados do localStorage");
        window.atividadesEmAndamento = JSON.parse(localStorage.getItem('atividadesEmAndamento') || '[]');
        window.atividades = JSON.parse(localStorage.getItem('atividades') || '[]');
        window.kanbanState = JSON.parse(localStorage.getItem('kanbanState') || '{}');

        // Depois enviar para Firebase para que outros vejam
        setTimeout(() => {
            salvarNoFirebase(
                window.atividadesEmAndamento,
                window.atividades,
                window.kanbanState
            );
        }, 500);
    }

    // 3. Ativar listener em tempo real
    setTimeout(() => {
        inicializarSincronizacaoTempoReal();
    }, 200);

    console.log("✅ [SYNC] Sincronização centralizada pronta!");
};

// Auto-inicializar
setTimeout(() => {
    window.inicializarSincronizacaoCentralizada();
}, 500);

console.log("✅ [SYNC] Sistema de Sincronização Centralizado Carregado!");
