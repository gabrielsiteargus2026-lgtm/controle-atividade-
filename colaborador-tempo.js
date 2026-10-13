(function(global) {
    const CHAVE_TEMPOS_COLABORADORES = 'tempoTotalPorColaboradorRastreabilidade';

    function obterNomeColaborador(nomes, email) {
        const nomeGenerico = /^(usu[aá]rio|user|desconhecido|n[aã]o informado)$/i;
        const nomeValido = nomes.find(valor =>
            typeof valor === 'string' &&
            valor.trim() &&
            !nomeGenerico.test(valor.trim()) &&
            !valor.includes('@')
        );
        if (nomeValido) return nomeValido.trim();

        const emailDisponivel = email || nomes.find(valor =>
            typeof valor === 'string' && valor.includes('@')
        );
        const primeiroNome = String(emailDisponivel || '').split('@')[0].split(/[._+-]/)[0].trim();
        if (!primeiroNome) return 'Não informado';
        return primeiroNome.charAt(0).toLocaleUpperCase('pt-BR') + primeiroNome.slice(1);
    }

    function agruparTempoAtivoPorColaborador(registros) {
        const tempos = new Map();
        registros.forEach(registro => {
            if (!registro || registro.ehAjudante) return;
            const nome = String(registro.nome || '').trim();
            const totalMs = Number(registro.totalMs);
            if (!nome || !Number.isFinite(totalMs) || totalMs <= 0) return;

            const chave = nome.toLocaleLowerCase('pt-BR');
            const resumo = tempos.get(chave) || { nome, totalMs: 0 };
            resumo.totalMs += totalMs;
            tempos.set(chave, resumo);
        });
        return [...tempos.values()].sort((a, b) =>
            b.totalMs - a.totalMs || a.nome.localeCompare(b.nome, 'pt-BR')
        );
    }

    function obterIntervalosAtivosDiarios({ data, eventos = [], pausas = [], inicio, fim, aberta, pausada, inicioPausa }) {
        const partesData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data || '');
        const inicioDia = partesData
            ? new Date(Number(partesData[1]), Number(partesData[2]) - 1, Number(partesData[3])).getTime()
            : null;
        const fimDia = partesData
            ? new Date(Number(partesData[1]), Number(partesData[2]) - 1, Number(partesData[3]) + 1).getTime()
            : null;
        const tiposValidos = new Set(['INICIO', 'REABRIU', 'REABRIU_DO_CONCLUIDO', 'PAUSA', 'RETOMOU', 'FIM']);
        const normalizarTimestamp = valor => {
            if (typeof valor === 'number') return valor;
            if (!valor) return NaN;
            return new Date(valor).getTime();
        };
        const movimentos = eventos
            .filter(evento => tiposValidos.has(evento.tipo))
            .map(evento => ({ tipo: evento.tipo, timestamp: normalizarTimestamp(evento.timestamp) }))
            .filter(evento => Number.isFinite(evento.timestamp));

        pausas.forEach(pausa => {
            const pausaMs = normalizarTimestamp(pausa.inicio);
            const retomadaMs = normalizarTimestamp(pausa.retomada);
            if (Number.isFinite(pausaMs)) movimentos.push({ tipo: 'PAUSA', timestamp: pausaMs });
            if (Number.isFinite(retomadaMs)) movimentos.push({ tipo: 'RETOMOU', timestamp: retomadaMs });
        });

        const tiposInicio = new Set(['INICIO', 'REABRIU', 'REABRIU_DO_CONCLUIDO']);
        if (!movimentos.some(evento => tiposInicio.has(evento.tipo))) {
            const inicioMs = normalizarTimestamp(inicio);
            if (Number.isFinite(inicioMs)) movimentos.push({ tipo: 'INICIO', timestamp: inicioMs });
        }
        if (!movimentos.some(evento => evento.tipo === 'FIM')) {
            const fimMs = normalizarTimestamp(fim);
            if (Number.isFinite(fimMs)) movimentos.push({ tipo: 'FIM', timestamp: fimMs });
        }

        const movimentosUnicos = new Map();
        movimentos.forEach(evento => {
            const chave = `${evento.tipo}:${Math.round(evento.timestamp / 1000)}`;
            if (!movimentosUnicos.has(chave)) movimentosUnicos.set(chave, evento);
        });
        const movimentosOrdenados = [...movimentosUnicos.values()]
            .sort((a, b) => a.timestamp - b.timestamp);
        let inicioAtivo = null;
        let atividadeAberta = false;
        let estaPausada = false;
        const intervalosAtivos = [];
        const acumularIntervalo = (inicioIntervalo, fimIntervalo) => {
            const inicioContabilizado = inicioDia === null ? inicioIntervalo : Math.max(inicioIntervalo, inicioDia);
            const fimContabilizado = fimDia === null ? fimIntervalo : Math.min(fimIntervalo, fimDia);
            if (fimContabilizado > inicioContabilizado) {
                intervalosAtivos.push({ inicio: inicioContabilizado, fim: fimContabilizado });
            }
        };

        movimentosOrdenados.forEach(evento => {
            if (tiposInicio.has(evento.tipo)) {
                if (!atividadeAberta) {
                    atividadeAberta = true;
                    estaPausada = false;
                    inicioAtivo = evento.timestamp;
                } else if (estaPausada) {
                    estaPausada = false;
                    inicioAtivo = evento.timestamp;
                }
            } else if (evento.tipo === 'PAUSA' && atividadeAberta && !estaPausada) {
                if (inicioAtivo !== null) acumularIntervalo(inicioAtivo, evento.timestamp);
                inicioAtivo = null;
                estaPausada = true;
            } else if (evento.tipo === 'RETOMOU' && atividadeAberta && estaPausada) {
                inicioAtivo = evento.timestamp;
                estaPausada = false;
            } else if (evento.tipo === 'FIM' && atividadeAberta) {
                if (!estaPausada && inicioAtivo !== null) acumularIntervalo(inicioAtivo, evento.timestamp);
                inicioAtivo = null;
                atividadeAberta = false;
                estaPausada = false;
            }
        });

        if (atividadeAberta && inicioAtivo !== null && aberta) {
            if (pausada) {
                const pausaAtualMs = normalizarTimestamp(inicioPausa);
                if (Number.isFinite(pausaAtualMs)) acumularIntervalo(inicioAtivo, pausaAtualMs);
            } else {
                acumularIntervalo(inicioAtivo, Date.now());
            }
        }
        return intervalosAtivos;
    }

    function calcularTempoAtivoDiarioMs(parametros) {
        return obterIntervalosAtivosDiarios(parametros).reduce(
            (total, intervalo) => total + intervalo.fim - intervalo.inicio,
            0
        );
    }

    function agruparTempoEfetivoPorColaborador(registros) {
        const intervalosPorColaborador = new Map();
        registros.forEach(registro => {
            if (!registro || registro.ehAjudante) return;
            const nome = String(registro.nome || '').trim();
            if (!nome || !Array.isArray(registro.intervalos)) return;

            const chave = String(registro.identificador || `nome:${nome}`).trim().toLocaleLowerCase('pt-BR');
            const resumo = intervalosPorColaborador.get(chave) || { nome, intervalos: [] };
            registro.intervalos.forEach(intervalo => {
                const inicio = Number(intervalo?.inicio);
                const fim = Number(intervalo?.fim);
                if (Number.isFinite(inicio) && Number.isFinite(fim) && fim > inicio) {
                    resumo.intervalos.push({ inicio, fim });
                }
            });
            intervalosPorColaborador.set(chave, resumo);
        });

        return [...intervalosPorColaborador.values()]
            .map(resumo => {
                const intervalosOrdenados = resumo.intervalos.sort((a, b) => a.inicio - b.inicio || a.fim - b.fim);
                let inicioAtual = null;
                let fimAtual = null;
                let totalMs = 0;
                intervalosOrdenados.forEach(intervalo => {
                    if (inicioAtual === null) {
                        inicioAtual = intervalo.inicio;
                        fimAtual = intervalo.fim;
                    } else if (intervalo.inicio <= fimAtual) {
                        fimAtual = Math.max(fimAtual, intervalo.fim);
                    } else {
                        totalMs += fimAtual - inicioAtual;
                        inicioAtual = intervalo.inicio;
                        fimAtual = intervalo.fim;
                    }
                });
                if (inicioAtual !== null) totalMs += fimAtual - inicioAtual;
                return { nome: resumo.nome, totalMs };
            })
            .filter(resumo => resumo.totalMs > 0)
            .sort((a, b) => b.totalMs - a.totalMs || a.nome.localeCompare(b.nome, 'pt-BR'));
    }

    function publicarTemposPorColaborador(data, colaboradores) {
        const snapshot = {
            data,
            atualizadoEm: Date.now(),
            colaboradores: colaboradores.map(({ nome, totalMs }) => ({
                nome: String(nome),
                totalMs: Number(totalMs)
            }))
        };
        try {
            global.localStorage.setItem(CHAVE_TEMPOS_COLABORADORES, JSON.stringify(snapshot));
        } catch (erro) {
            console.error('Não foi possível sincronizar os cards de tempo por colaborador.', erro);
        }
    }

    function obterTemposPorColaboradorPublicados(data) {
        try {
            const conteudo = global.localStorage.getItem(CHAVE_TEMPOS_COLABORADORES);
            if (!conteudo) return null;
            const snapshot = JSON.parse(conteudo);
            if (snapshot.data !== data || !Array.isArray(snapshot.colaboradores)) return null;
            if (snapshot.colaboradores.some(item =>
                !item || typeof item.nome !== 'string' || !Number.isFinite(Number(item.totalMs))
            )) return null;
            return snapshot.colaboradores.map(item => ({
                nome: item.nome,
                totalMs: Number(item.totalMs)
            }));
        } catch (erro) {
            console.error('Não foi possível ler os cards de tempo por colaborador sincronizados.', erro);
            return null;
        }
    }

    global.obterNomeColaboradorTempo = obterNomeColaborador;
    global.agruparTempoAtivoPorColaborador = agruparTempoAtivoPorColaborador;
    global.obterIntervalosAtivosDiarios = obterIntervalosAtivosDiarios;
    global.calcularTempoAtivoDiarioMs = calcularTempoAtivoDiarioMs;
    global.agruparTempoEfetivoPorColaborador = agruparTempoEfetivoPorColaborador;
    global.publicarTemposPorColaborador = publicarTemposPorColaborador;
    global.obterTemposPorColaboradorPublicados = obterTemposPorColaboradorPublicados;
})(window);
