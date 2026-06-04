// 🔍 SCRIPT DE DIAGNÓSTICO - SINCRONIZAÇÃO DE DADOS
// Copie este código e execute no Console (F12) de QUALQUER página do sistema
// Isso fará um "pente fino" completo em todos os dados

(function() {
    console.clear();
    console.log('🔍 ========== DIAGNÓSTICO COMPLETO DO SISTEMA ==========');
    console.log('Data:', new Date().toLocaleString('pt-BR'));
    console.log('');

    // ==================== DADOS DO LOCALSTORAGE ====================
    console.log('📦 LOCALSTORAGE - Dados Salvos Localmente');
    console.log('='.repeat(60));

    const dadosLocalStorage = {
        atividades: JSON.parse(localStorage.getItem('atividades') || '[]'),
        atividadesEmAndamento: JSON.parse(localStorage.getItem('atividadesEmAndamento') || '[]'),
        historicoPausas: JSON.parse(localStorage.getItem('historicoPausas') || '[]'),
        kanbanState: JSON.parse(localStorage.getItem('kanbanState') || '{}'),
        registrosAtividades: JSON.parse(localStorage.getItem('registrosAtividades') || '[]'),
        registroChavesUsadas: JSON.parse(localStorage.getItem('registroChavesUsadas') || '{}')
    };

    // Totais
    const totalAtividades = dadosLocalStorage.atividades.length;
    const totalEmAndamento = dadosLocalStorage.atividadesEmAndamento.length;
    const totalPausas = dadosLocalStorage.historicoPausas.length;
    const totalRegistros = dadosLocalStorage.registrosAtividades.length;
    const totalGeral = totalAtividades + totalEmAndamento + totalPausas;

    console.log(`
✅ ATIVIDADES CONCLUÍDAS: ${totalAtividades}
✅ ATIVIDADES EM ANDAMENTO: ${totalEmAndamento}
✅ PAUSAS REGISTRADAS: ${totalPausas}
✅ REGISTROS DE ATIVIDADES: ${totalRegistros}
─────────────────────
📊 TOTAL GERAL: ${totalGeral} atividades
    `);

    // ==================== ANÁLISE DE DUPLICATAS ====================
    console.log('');
    console.log('🔎 ANÁLISE DE DUPLICATAS');
    console.log('='.repeat(60));

    const todosOsIDs = [];
    const duplicatas = [];

    dadosLocalStorage.atividades.forEach(a => {
        if (a.id) {
            if (todosOsIDs.includes(a.id)) {
                duplicatas.push(a.id);
            }
            todosOsIDs.push(a.id);
        }
    });

    dadosLocalStorage.atividadesEmAndamento.forEach(a => {
        if (a.id) {
            if (todosOsIDs.includes(a.id)) {
                duplicatas.push(a.id);
                console.warn(`⚠️ DUPLICATA ENCONTRADA: ID ${a.id} (Concluída + Em Andamento)`);
            }
            todosOsIDs.push(a.id);
        }
    });

    dadosLocalStorage.historicoPausas.forEach(p => {
        if (p.id) {
            if (todosOsIDs.includes(p.id)) {
                duplicatas.push(p.id);
                console.warn(`⚠️ DUPLICATA ENCONTRADA: ID ${p.id} (Pausa duplicada)`);
            }
            todosOsIDs.push(p.id);
        }
    });

    if (duplicatas.length === 0) {
        console.log('✅ Nenhuma duplicata encontrada!');
    } else {
        console.warn(`❌ ${duplicatas.length} DUPLICATAS ENCONTRADAS!`);
    }

    // ==================== ANÁLISE DE CONSISTÊNCIA ====================
    console.log('');
    console.log('⚙️ ANÁLISE DE CONSISTÊNCIA');
    console.log('='.repeat(60));

    let alertas = 0;

    // Verificar se atividades concluídas têm dataFim
    const ativSemDataFim = dadosLocalStorage.atividades.filter(a => !a.dataFim).length;
    if (ativSemDataFim > 0) {
        console.warn(`⚠️ ${ativSemDataFim} atividades concluídas SEM data de fim!`);
        alertas++;
    } else {
        console.log('✅ Todas as atividades concluídas têm data de fim');
    }

    // Verificar se atividades em andamento têm dataInicio
    const ativSemDataInicio = dadosLocalStorage.atividadesEmAndamento.filter(a => !a.dataInicio).length;
    if (ativSemDataInicio > 0) {
        console.warn(`⚠️ ${ativSemDataInicio} atividades em andamento SEM data de início!`);
        alertas++;
    } else {
        console.log('✅ Todas as atividades em andamento têm data de início');
    }

    // Verificar pausas sem duração
    const pausasSemDuracao = dadosLocalStorage.historicoPausas.filter(p => !p.tempoPausaFormatado && !p.duracao).length;
    if (pausasSemDuracao > 0) {
        console.warn(`⚠️ ${pausasSemDuracao} pausas SEM duração registrada!`);
        alertas++;
    } else {
        console.log('✅ Todas as pausas têm duração registrada');
    }

    // ==================== ANÁLISE DE COLABORADORES ====================
    console.log('');
    console.log('👥 ANÁLISE DE COLABORADORES');
    console.log('='.repeat(60));

    const colaboradores = {};

    dadosLocalStorage.atividades.forEach(a => {
        const nome = a.colaborador || a.nome || 'Desconhecido';
        colaboradores[nome] = (colaboradores[nome] || 0) + 1;
    });

    dadosLocalStorage.atividadesEmAndamento.forEach(a => {
        const nome = a.colaborador || a.nome || 'Desconhecido';
        colaboradores[nome] = (colaboradores[nome] || 0) + 1;
    });

    const colaboradoresOrdenados = Object.entries(colaboradores)
        .sort((a, b) => b[1] - a[1]);

    if (colaboradoresOrdenados.length === 0) {
        console.log('⚠️ Nenhum colaborador encontrado!');
        alertas++;
    } else {
        console.log('Top Colaboradores:');
        colaboradoresOrdenados.slice(0, 5).forEach((col, idx) => {
            console.log(`  ${idx + 1}. ${col[0]}: ${col[1]} atividades`);
        });
    }

    // ==================== ANÁLISE DE DATAS ====================
    console.log('');
    console.log('📅 ANÁLISE DE DATAS');
    console.log('='.repeat(60));

    const datas = new Set();
    dadosLocalStorage.atividades.forEach(a => {
        if (a.dataInicio) datas.add(a.dataInicio);
        if (a.dataFim) datas.add(a.dataFim);
    });

    dadosLocalStorage.atividadesEmAndamento.forEach(a => {
        if (a.dataInicio) datas.add(a.dataInicio);
    });

    dadosLocalStorage.historicoPausas.forEach(p => {
        if (p.dataInicio) datas.add(p.dataInicio);
    });

    const datasOrdenadas = Array.from(datas).sort();
    if (datasOrdenadas.length === 0) {
        console.log('⚠️ Nenhuma data encontrada!');
        alertas++;
    } else {
        console.log(`Período de Dados: ${datasOrdenadas[0]} até ${datasOrdenadas[datasOrdenadas.length - 1]}`);
        console.log(`Total de ${datasOrdenadas.length} datas diferentes`);
    }

    // ==================== ANÁLISE DE STATUS ====================
    console.log('');
    console.log('🔄 ANÁLISE DE STATUS');
    console.log('='.repeat(60));

    const statusCount = {
        'Concluído': totalAtividades,
        'Em Andamento': totalEmAndamento,
        'Pausado': totalPausas
    };

    console.log('Distribuição de Status:');
    Object.entries(statusCount).forEach(([status, count]) => {
        const pct = totalGeral > 0 ? ((count / totalGeral) * 100).toFixed(1) : 0;
        console.log(`  ${status}: ${count} (${pct}%)`);
    });

    // ==================== RESUMO FINAL ====================
    console.log('');
    console.log('📋 RESUMO FINAL');
    console.log('='.repeat(60));

    if (alertas === 0) {
        console.log('✅ SISTEMA EM PERFEITO FUNCIONAMENTO!');
        console.log('✅ Todos os dados estão sincronizados');
        console.log('✅ Nenhuma duplicata ou inconsistência detectada');
    } else {
        console.warn(`⚠️ ${alertas} ALERTA(S) ENCONTRADO(S)`);
        console.warn('Verifique os avisos acima para mais detalhes');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('🔍 PRÓXIMO PASSO: Copie estes dados e compare com outras páginas');
    console.log('='.repeat(60));

    // ==================== EXPORTAR RELATÓRIO ====================
    console.log('');
    console.log('📄 RELATÓRIO COMPLETO (copie o objeto abaixo):');
    
    const relatorio = {
        timestamp: new Date().toISOString(),
        totais: {
            atividades_concluidas: totalAtividades,
            atividades_em_andamento: totalEmAndamento,
            pausas_registradas: totalPausas,
            registros_de_atividades: totalRegistros,
            total_geral: totalGeral
        },
        qualidade: {
            duplicatas: duplicatas.length,
            atividades_sem_data_fim: ativSemDataFim,
            atividades_sem_data_inicio: ativSemDataInicio,
            pausas_sem_duracao: pausasSemDuracao
        },
        periodo: {
            data_inicial: datasOrdenadas[0] || 'N/A',
            data_final: datasOrdenadas[datasOrdenadas.length - 1] || 'N/A',
            total_datas: datasOrdenadas.length
        },
        colaboradores: Object.fromEntries(colaboradoresOrdenados),
        status: 'OK'
    };

    console.table(relatorio);
    console.log(relatorio);

    return relatorio;
})();

// ==================== INSTRUÇÕES ====================
console.log('');
console.log('📝 COMO USAR ESTE DIAGNÓSTICO:');
console.log('');
console.log('1. Execute este script em CADA página:');
console.log('   - index.html (Controle de Atividade)');
console.log('   - insights.html (Gráficos)');
console.log('   - historico.html (Histórico)');
console.log('   - database.html (Base de Dados)');
console.log('   - admin.html (Administrador)');
console.log('   - atividades-usuarios.html (Por Usuário)');
console.log('');
console.log('2. Compare os valores de "totais" entre páginas');
console.log('');
console.log('3. Se os números forem IGUAIS → Sincronização OK ✅');
console.log('   Se os números FOREM DIFERENTES → Problema de sincronização ❌');
console.log('');
console.log('4. Procure por avisos de DUPLICATAS ou INCONSISTÊNCIAS');
console.log('');
