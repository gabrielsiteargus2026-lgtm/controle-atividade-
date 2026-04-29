/**
 * 🔥 SINCRONIZAÇÃO JSONBIN - Múltiplos PCs em Tempo Real (CORRIGIDO)
 * 
 * Usa JSONBin.io (serviço gratuito em nuvem)
 * Sincroniza REALMENTE entre qualquer número de PCs
 * localStorage como cache local
 * 
 * Data: 29/04/2026
 */

console.log("✅ sync-real.js carregado");

// Configuração JSONBin
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b/67425d71e41b4d34e4db40db';
const JSONBIN_API_KEY = '$2b$10$8P.2t1jPkZ2.zK7Y9qL8Vu';
const SYNC_INTERVAL = 3000; // 3 segundos

// Estado global
let ultimaAtualizacao = 0;
let sincronizandoAgora = false;

// ========== INICIALIZAÇÃO ==========
async function inicializarSincronizacao() {
    console.log("🚀 Iniciando sincronização JSONBin...");

    // 1. Carregar cache local
    carregarDoLocalStorage();

    // 2. Carregar dados do servidor (primeira vez)
    await sincronizarComServidor();

    // 3. Polling contínuo
    setInterval(sincronizarComServidor, SYNC_INTERVAL);

    // 4. BroadcastChannel para sincronizar entre abas do MESMO PC
    configurarBroadcastChannel();

    console.log("✅ Sincronização ativa!");
}

// ========== LOCALSTORAGE ==========
function carregarDoLocalStorage() {
    try {
        console.log("📱 Carregando cache local...");
        
        const cache = localStorage.getItem('controle_cache');
        if (cache) {
            const dados = JSON.parse(cache);
            window.atividadesEmAndamento = dados.em || [];
            window.atividades = dados.at || [];
            window.kanbanState = dados.ks || {};
            ultimaAtualizacao = dados.t || 0;
            
            console.log("✅ Cache local:", {
                em: window.atividadesEmAndamento.length,
                at: window.atividades.length
            });
        } else {
            console.log("⚠️ Sem cache local");
            window.atividadesEmAndamento = [];
            window.atividades = [];
            window.kanbanState = {};
        }
    } catch (e) {
        console.error("❌ Erro localStorage:", e);
        window.atividadesEmAndamento = [];
        window.atividades = [];
        window.kanbanState = {};
    }
}

function salvarNoLocalStorage() {
    try {
        const dados = {
            em: window.atividadesEmAndamento || [],
            at: window.atividades || [],
            ks: window.kanbanState || {},
            t: Date.now()
        };
        localStorage.setItem('controle_cache', JSON.stringify(dados));
        console.log("💾 Cache local atualizado");
    } catch (e) {
        console.error("❌ Erro ao salvar cache:", e);
    }
}

// ========== JSONBIN (NUVEM) ==========
async function sincronizarComServidor() {
    if (sincronizandoAgora) return; // Evitar requisições simultâneas
    
    try {
        console.log("🔄 Sincronizando com servidor...");
        sincronizandoAgora = true;

        // GET - Carregar dados do servidor
        const response = await fetch(JSONBIN_API_URL + '/latest', {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });

        if (!response.ok) {
            console.warn("⚠️ Servidor indisponível (status " + response.status + ")");
            sincronizandoAgora = false;
            return;
        }

        const result = await response.json();
        const dadosServidor = result.record || {};

        // Comparar timestamps
        if (dadosServidor.t && dadosServidor.t > ultimaAtualizacao) {
            console.log("🔔 Atualização detectada!");
            
            window.atividadesEmAndamento = dadosServidor.em || [];
            window.atividades = dadosServidor.at || [];
            window.kanbanState = dadosServidor.ks || {};
            ultimaAtualizacao = dadosServidor.t;

            // Atualizar cache local
            salvarNoLocalStorage();

            // Atualizar interface
            atualizarInterface();

            // Notificar outras abas
            notificarOutrasAbas();
        }

        sincronizandoAgora = false;

    } catch (error) {
        console.error("⚠️ Erro de sincronização:", error.message);
        sincronizandoAgora = false;
    }
}

async function enviarParaServidor() {
    if (sincronizandoAgora) return;
    
    try {
        console.log("📤 Enviando dados para servidor...");
        sincronizandoAgora = true;

        const dados = {
            em: window.atividadesEmAndamento || [],
            at: window.atividades || [],
            ks: window.kanbanState || {},
            t: Date.now()
        };

        const response = await fetch(JSONBIN_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            console.log("✅ Dados enviados ao servidor!");
            ultimaAtualizacao = dados.t;
            salvarNoLocalStorage();
        } else {
            console.warn("⚠️ Erro ao enviar (status " + response.status + ")");
        }

        sincronizandoAgora = false;

    } catch (error) {
        console.error("❌ Erro ao enviar:", error.message);
        sincronizandoAgora = false;
    }
}

// ========== INTERFACE ==========
function atualizarInterface() {
    if (typeof window.atualizarTabela === 'function') {
        try { window.atualizarTabela(); } catch (e) {}
    }
    if (typeof window.atualizarKanban === 'function') {
        try { window.atualizarKanban(); } catch (e) {}
    }
}

// ========== BROADCAST CHANNEL (Entre abas) ==========
function configurarBroadcastChannel() {
    try {
        if (typeof BroadcastChannel === 'undefined') {
            console.warn("⚠️ BroadcastChannel não suportado");
            return;
        }

        window.syncChannel = new BroadcastChannel('sync_control');
        window.syncChannel.onmessage = (event) => {
            console.log("📢 Mensagem de outra aba:", event.data.tipo);
            if (event.data.tipo === 'sync') {
                carregarDoLocalStorage();
                atualizarInterface();
            }
        };
        console.log("✅ BroadcastChannel ativo");
    } catch (e) {
        console.error("⚠️ Erro BroadcastChannel:", e);
    }
}

function notificarOutrasAbas() {
    if (window.syncChannel) {
        window.syncChannel.postMessage({ tipo: 'sync' });
    }
}

// ========== API PÚBLICA ==========
window.salvarNoFirebase = async function() {
    console.log("💾 Salvando dados...");
    
    // 1. Sempre salvar localmente PRIMEIRO
    salvarNoLocalStorage();
    
    // 2. Notificar outras abas
    notificarOutrasAbas();
    
    // 3. Enviar para servidor
    await enviarParaServidor();
};

// ========== INICIAR ==========
inicializarSincronizacao();

console.log("✅ sync-real.js iniciado com sucesso");
