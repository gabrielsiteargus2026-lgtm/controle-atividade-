/**
 * 🔥 SINCRONIZAÇÃO SUPABASE - Múltiplos PCs em Tempo Real
 * 
 * Funciona com qualquer número de computadores
 * Sincronização instantânea via Realtime Channels
 * 
 * Data: 29/04/2026
 */

console.log("✅ sync-supabase.js carregado");

// Aguardar Supabase carregar
async function inicializarSupabase() {
    let tentativas = 0;
    
    while (tentativas < 10 && typeof supabase === 'undefined') {
        console.log("⏳ Aguardando Supabase SDK... (" + tentativas + "s)");
        tentativas++;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (typeof supabase === 'undefined') {
        console.error("❌ Supabase SDK não carregou!");
        return false;
    }

    console.log("✅ Supabase SDK disponível!");

    // Credenciais Supabase
    const SUPABASE_URL = 'https://pkidnqsqxqqbcspklyxz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraWRucXNxeHFxYmNzcGtseXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NjMwNjksImV4cCI6MjAyMzMzOTA2OX0.Cm7R5aTN9LqSbSVfR5LgYdZEwpYcDXyTZGM2xtXuPFQ';

    try {
        // Inicializar Supabase
        const { createClient } = supabase;
        window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        
        console.log("✅ Supabase inicializado com sucesso!");

        // Carregar dados iniciais
        await carregarDados();

        // Configurar listeners em tempo real
        configurarRealtime();

        return true;

    } catch (error) {
        console.error("❌ Erro ao inicializar Supabase:", error);
        return false;
    }
}

// Carregar dados do Supabase
async function carregarDados() {
    try {
        const client = window.supabaseClient;

        // Carregar atividades em andamento
        const { data: emAndamento, error: erroEmAndamento } = await client
            .from('atividades_em_andamento')
            .select('*');

        if (erroEmAndamento) {
            console.error("❌ Erro ao carregar atividades_em_andamento:", erroEmAndamento);
        } else {
            window.atividadesEmAndamento = emAndamento || [];
            console.log("✅ Atividades em andamento carregadas:", window.atividadesEmAndamento.length);
        }

        // Carregar atividades concluídas
        const { data: atividades, error: erroAtividades } = await client
            .from('atividades')
            .select('*')
            .order('data_inicio', { ascending: false })
            .limit(1000);

        if (erroAtividades) {
            console.error("❌ Erro ao carregar atividades:", erroAtividades);
        } else {
            window.atividades = atividades || [];
            console.log("✅ Atividades concluídas carregadas:", window.atividades.length);
        }

        // Atualizar interface
        if (typeof window.atualizarTabela === 'function') {
            try { window.atualizarTabela(); } catch (e) {}
        }
        if (typeof window.atualizarKanban === 'function') {
            try { window.atualizarKanban(); } catch (e) {}
        }

        console.log("✅ Interface atualizada");

    } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
    }
}

// Configurar listeners em tempo real via Realtime Channels
function configurarRealtime() {
    const client = window.supabaseClient;

    // Listener para atividades em andamento
    console.log("👂 Configurando listener para atividades_em_andamento...");
    
    const canalEmAndamento = client
        .channel('atividades_em_andamento_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'atividades_em_andamento'
            },
            (payload) => {
                console.log("🔔 Mudança detectada em atividades_em_andamento:", payload.eventType);
                
                // Recarregar dados
                carregarDados();
            }
        )
        .subscribe();

    console.log("✅ Listener atividades_em_andamento ativo");

    // Listener para atividades concluídas
    console.log("👂 Configurando listener para atividades...");
    
    const canalAtividades = client
        .channel('atividades_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'atividades'
            },
            (payload) => {
                console.log("🔔 Mudança detectada em atividades:", payload.eventType);
                
                // Recarregar dados
                carregarDados();
            }
        )
        .subscribe();

    console.log("✅ Listener atividades ativo");
}

// Função para salvar no Supabase (chamada pelo index.html)
window.salvarNoFirebase = async function() {
    if (!window.supabaseClient) {
        console.warn("⚠️ Supabase não está inicializado");
        return;
    }

    try {
        const client = window.supabaseClient;

        // Salvar atividades em andamento
        if (window.atividadesEmAndamento && window.atividadesEmAndamento.length > 0) {
            console.log("📤 Sincronizando atividades em andamento...");
            
            // Para cada atividade, fazer upsert
            for (const atividade of window.atividadesEmAndamento) {
                const { error } = await client
                    .from('atividades_em_andamento')
                    .upsert({
                        ...atividade,
                        updated_at: new Date().toISOString()
                    });

                if (error) {
                    console.error("❌ Erro ao salvar atividade em andamento:", error);
                }
            }
            console.log("✅ Atividades em andamento sincronizadas");
        }

        // Salvar atividades concluídas
        if (window.atividades && window.atividades.length > 0) {
            console.log("📤 Sincronizando atividades concluídas...");
            
            // Para cada atividade, fazer upsert
            for (const atividade of window.atividades) {
                const { error } = await client
                    .from('atividades')
                    .upsert({
                        ...atividade,
                        updated_at: new Date().toISOString()
                    });

                if (error) {
                    console.error("❌ Erro ao salvar atividade concluída:", error);
                }
            }
            console.log("✅ Atividades concluídas sincronizadas");
        }

    } catch (error) {
        console.error("❌ Erro ao sincronizar:", error);
    }
};

// Iniciar
console.log("🚀 Iniciando sincronização Supabase...");
inicializarSupabase().then(sucesso => {
    if (sucesso) {
        console.log("✅ Sincronização Supabase ativa para múltiplos PCs!");
    } else {
        console.error("❌ Falha ao inicializar sincronização Supabase");
    }
});

console.log("✅ sync-supabase.js iniciado com sucesso");
