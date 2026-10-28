/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  History,
  Download,
  Copy,
  Check,
  Code2,
  BookOpen,
  Trash2,
  Calculator,
  Info,
  X
} from 'lucide-react';
import { PYTHON_CALCULATOR_CODE } from './pythonCode.ts';

// Interface do histórico de cálculos
interface ItemHistorico {
  id: string;
  expressao: string;
  resultado: string;
  hora: string;
}

export default function App() {
  // -------------------------------------------------------------
  // ESTADOS DO MOTOR DE CÁLCULO (SEM USO DE eval())
  // -------------------------------------------------------------
  const [display, setDisplay] = useState<string>('0');
  const [expressaoAnterior, setExpressaoAnterior] = useState<string>('');
  const [primeiroNumero, setPrimeiroNumero] = useState<number | null>(null);
  const [operadorEscolhido, setOperadorEscolhido] = useState<string | null>(null);
  const [aguardandoSegundoNumero, setAguardandoSegundoNumero] = useState<boolean>(false);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);

  // Estados de Interface e Modais
  const [somHabilitado, setSomHabilitado] = useState<boolean>(false);
  const [abaAtiva, setAbaAtiva] = useState<'calculadora' | 'python' | 'didatica'>('calculadora');
  const [historicoAberto, setHistoricoAberto] = useState<boolean>(false);
  const [teclaAtiva, setTeclaAtiva] = useState<string | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState<boolean>(false);

  // Áudio sintético suave com Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);

  const tocarSomClique = useCallback((frequencia = 320) => {
    if (!somHabilitado) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequencia, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignora silenciosamente em navegadores sem suporte
    }
  }, [somHabilitado]);

  // Formatação segura de números para exibição
  const formatarNumero = (num: number): string => {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    // Arredonda para até 8 casas decimais evitando ruídos binários (ex: 0.1 + 0.2)
    const arredondado = parseFloat(num.toFixed(8));
    const str = arredondado.toString();
    if (str.length > 12) {
      return num.toExponential(4);
    }
    return str;
  };

  // -------------------------------------------------------------
  // FUNÇÕES DE MANIPULAÇÃO DE ENTRADA
  // -------------------------------------------------------------
  const adicionarDigito = useCallback((digito: string) => {
    tocarSomClique(380);
    setDisplay((prev) => {
      if (aguardandoSegundoNumero || prev === '0' || prev === 'Indefinido') {
        setAguardandoSegundoNumero(false);
        return digito;
      }
      if (prev.length >= 12) return prev;
      return prev + digito;
    });
  }, [aguardandoSegundoNumero, tocarSomClique]);

  const adicionarPonto = useCallback(() => {
    tocarSomClique(340);
    setDisplay((prev) => {
      if (aguardandoSegundoNumero || prev === 'Indefinido') {
        setAguardandoSegundoNumero(false);
        return '0.';
      }
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [aguardandoSegundoNumero, tocarSomClique]);

  const inverterSinal = useCallback(() => {
    tocarSomClique(300);
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Indefinido') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, [tocarSomClique]);

  const aplicarPorcentagem = useCallback(() => {
    tocarSomClique(320);
    setDisplay((prev) => {
      const valor = parseFloat(prev);
      if (isNaN(valor)) return prev;

      let resultado: number;
      if (primeiroNumero !== null) {
        resultado = (primeiroNumero * valor) / 100;
      } else {
        resultado = valor / 100;
      }
      return formatarNumero(resultado);
    });
  }, [primeiroNumero, tocarSomClique]);

  const apagarUltimo = useCallback(() => {
    tocarSomClique(260);
    setDisplay((prev) => {
      if (prev === 'Indefinido' || aguardandoSegundoNumero) {
        return '0';
      }
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return '0';
    });
  }, [aguardandoSegundoNumero, tocarSomClique]);

  const limparTudo = useCallback(() => {
    tocarSomClique(220);
    setDisplay('0');
    setExpressaoAnterior('');
    setPrimeiroNumero(null);
    setOperadorEscolhido(null);
    setAguardandoSegundoNumero(false);
  }, [tocarSomClique]);

  // -------------------------------------------------------------
  // MOTOR DE CÁLCULO EXPLÍCITO (SEM eval())
  // Estruturas condicionais explícitas (if / else if / else)
  // -------------------------------------------------------------
  const calcularResultado = useCallback(() => {
    if (operadorEscolhido === null || primeiroNumero === null) return;
    if (display === 'Indefinido') return;

    tocarSomClique(440);
    const segundoNumero = parseFloat(display);
    if (isNaN(segundoNumero)) return;

    let resultadoCalculado = 0;

    // Regra 1: Estruturas condicionais explícitas para as 4 operações básicas
    if (operadorEscolhido === '+') {
      resultadoCalculado = primeiroNumero + segundoNumero;
    } else if (operadorEscolhido === '-' || operadorEscolhido === '−') {
      resultadoCalculado = primeiroNumero - segundoNumero;
    } else if (operadorEscolhido === '×' || operadorEscolhido === '*') {
      resultadoCalculado = primeiroNumero * segundoNumero;
    } else if (operadorEscolhido === '÷' || operadorEscolhido === '/') {
      // Tratamento de Erro: Divisão por Zero
      if (segundoNumero === 0) {
        setDisplay('Indefinido');
        setExpressaoAnterior(`${formatarNumero(primeiroNumero)} ÷ 0 =`);
        setPrimeiroNumero(null);
        setOperadorEscolhido(null);
        setAguardandoSegundoNumero(true);
        return;
      }
      resultadoCalculado = primeiroNumero / segundoNumero;
    } else {
      resultadoCalculado = segundoNumero;
    }

    const expressaoFinal = `${formatarNumero(primeiroNumero)} ${operadorEscolhido} ${formatarNumero(segundoNumero)} =`;
    const resultadoFormatado = formatarNumero(resultadoCalculado);

    setExpressaoAnterior(expressaoFinal);
    setDisplay(resultadoFormatado);

    // Registra na fita de histórico
    const novoItem: ItemHistorico = {
      id: Date.now().toString(),
      expressao: expressaoFinal,
      resultado: resultadoFormatado,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setHistorico((prev) => [novoItem, ...prev.slice(0, 19)]);

    // Prepara para operações subsequentes encadeadas
    setPrimeiroNumero(resultadoCalculado);
    setOperadorEscolhido(null);
    setAguardandoSegundoNumero(true);
  }, [operadorEscolhido, primeiroNumero, display, tocarSomClique]);

  const definirOperador = useCallback((operador: string) => {
    tocarSomClique(360);
    if (display === 'Indefinido') return;

    const valorAtual = parseFloat(display);
    if (isNaN(valorAtual)) return;

    // Se já havia um operador pendente e o usuário digitou outro operando, executa primeiro
    if (primeiroNumero !== null && !aguardandoSegundoNumero && operadorEscolhido !== null) {
      let resultadoParcial = 0;
      if (operadorEscolhido === '+') {
        resultadoParcial = primeiroNumero + valorAtual;
      } else if (operadorEscolhido === '-' || operadorEscolhido === '−') {
        resultadoParcial = primeiroNumero - valorAtual;
      } else if (operadorEscolhido === '×' || operadorEscolhido === '*') {
        resultadoParcial = primeiroNumero * valorAtual;
      } else if (operadorEscolhido === '÷' || operadorEscolhido === '/') {
        if (valorAtual === 0) {
          setDisplay('Indefinido');
          setExpressaoAnterior(`${formatarNumero(primeiroNumero)} ÷ 0 =`);
          setPrimeiroNumero(null);
          setOperadorEscolhido(null);
          setAguardandoSegundoNumero(true);
          return;
        }
        resultadoParcial = primeiroNumero / valorAtual;
      }

      setPrimeiroNumero(resultadoParcial);
      setDisplay(formatarNumero(resultadoParcial));
      setExpressaoAnterior(`${formatarNumero(resultadoParcial)} ${operador}`);
    } else {
      setPrimeiroNumero(valorAtual);
      setExpressaoAnterior(`${formatarNumero(valorAtual)} ${operador}`);
    }

    setOperadorEscolhido(operador);
    setAguardandoSegundoNumero(true);
  }, [display, primeiroNumero, aguardandoSegundoNumero, operadorEscolhido, tocarSomClique]);

  // -------------------------------------------------------------
  // INTEGRAÇÃO COM TECLADO FÍSICO
  // -------------------------------------------------------------
  useEffect(() => {
    const tratarTeclado = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em outros campos caso existam
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      const tecla = e.key;

      if (/^[0-9]$/.test(tecla)) {
        e.preventDefault();
        setTeclaAtiva(tecla);
        adicionarDigito(tecla);
      } else if (tecla === '.' || tecla === ',') {
        e.preventDefault();
        setTeclaAtiva('.');
        adicionarPonto();
      } else if (tecla === '+') {
        e.preventDefault();
        setTeclaAtiva('+');
        definirOperador('+');
      } else if (tecla === '-') {
        e.preventDefault();
        setTeclaAtiva('-');
        definirOperador('-');
      } else if (tecla === '*' || tecla.toLowerCase() === 'x') {
        e.preventDefault();
        setTeclaAtiva('×');
        definirOperador('×');
      } else if (tecla === '/') {
        e.preventDefault();
        setTeclaAtiva('÷');
        definirOperador('÷');
      } else if (tecla === 'Enter' || tecla === '=') {
        e.preventDefault();
        setTeclaAtiva('=');
        calcularResultado();
      } else if (tecla === 'Backspace') {
        e.preventDefault();
        setTeclaAtiva('⌫');
        apagarUltimo();
      } else if (tecla === 'Escape' || tecla.toLowerCase() === 'c') {
        e.preventDefault();
        setTeclaAtiva('AC');
        limparTudo();
      } else if (tecla === '%') {
        e.preventDefault();
        setTeclaAtiva('%');
        aplicarPorcentagem();
      }

      setTimeout(() => setTeclaAtiva(null), 150);
    };

    window.addEventListener('keydown', tratarTeclado);
    return () => window.removeEventListener('keydown', tratarTeclado);
  }, [
    adicionarDigito,
    adicionarPonto,
    definirOperador,
    calcularResultado,
    apagarUltimo,
    limparTudo,
    aplicarPorcentagem,
  ]);

  // Função para baixar o arquivo Python diretamente no computador
  const baixarScriptPython = () => {
    const blob = new Blob([PYTHON_CALCULATOR_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calculadora_cobre.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_CALCULATOR_CODE);
      setCodigoCopiado(true);
      setTimeout(() => setCodigoCopiado(false), 2000);
    } catch {
      // Fallback simples
    }
  };

  // Reusar resultado do histórico
  const usarItemHistorico = (resultado: string) => {
    setDisplay(resultado);
    setAguardandoSegundoNumero(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e5e5] flex flex-col items-center justify-start p-4 md:p-8 selection:bg-[#B87333]/30 selection:text-[#D98A6C]">
      {/* BARRA SUPERIOR DE NAVEGAÇÃO & CONTROLE */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-[#1E1E1E] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#141414] border border-[#4A4A4A] flex items-center justify-center text-[#C87D55] shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#f0f0f0] flex items-center gap-2">
              Calculadora Copper & Black
            </h1>
            <p className="text-xs text-[#808080]">
              Design Dark de Alta Precisão · Sem eval() · Estrutura Didática
            </p>
          </div>
        </div>

        {/* Abas e Controles de Apoio */}
        <div className="flex items-center gap-2">
          {/* Alternador de Som */}
          <button
            onClick={() => setSomHabilitado(!somHabilitado)}
            title={somHabilitado ? 'Desativar som de clique' : 'Ativar som de clique suave'}
            className={`p-2 rounded-full border transition-all ${
              somHabilitado
                ? 'bg-[#1a1410] border-[#B87333] text-[#D98A6C]'
                : 'bg-[#0D0D0D] border-[#333333] text-[#666666] hover:text-[#C87D55] hover:border-[#4A4A4A]'
            }`}
          >
            {somHabilitado ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Abas de Navegação */}
          <div className="flex items-center bg-[#0D0D0D] border border-[#262626] rounded-xl p-1 text-xs">
            <button
              onClick={() => setAbaAtiva('calculadora')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                abaAtiva === 'calculadora'
                  ? 'bg-[#1C1815] text-[#D98A6C] font-medium border border-[#B87333]/40'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calculadora</span>
            </button>

            <button
              onClick={() => setAbaAtiva('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                abaAtiva === 'python'
                  ? 'bg-[#1C1815] text-[#D98A6C] font-medium border border-[#B87333]/40'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código Python</span>
            </button>

            <button
              onClick={() => setAbaAtiva('didatica')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                abaAtiva === 'didatica'
                  ? 'bg-[#1C1815] text-[#D98A6C] font-medium border border-[#B87333]/40'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Explicação Didática</span>
              <span className="sm:hidden">Didática</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL: BASEADO NA ABA ATIVA */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center">
        {/* ========================================================= */}
        {/* ABA 1: CALCULADORA VISUAL INTERATIVA                       */}
        {/* ========================================================= */}
        {abaAtiva === 'calculadora' && (
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
            {/* CONTAINER DA CALCULADORA (Bordas arredondadas e acabamento preto profundo) */}
            <div className="w-full max-w-[360px] sm:max-w-[380px] bg-[#0D0D0D] border border-[#262626] rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col">
              {/* Barra superior de status interno da calculadora */}
              <div className="flex items-center justify-between mb-3 text-xs text-[#808080] px-1">
                <span className="text-[11px] uppercase tracking-wider text-[#996b52] font-semibold">
                  Precision Industrial
                </span>
                <button
                  onClick={() => setHistoricoAberto(!historicoAberto)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all border ${
                    historicoAberto
                      ? 'bg-[#201814] text-[#D98A6C] border-[#B87333]'
                      : 'bg-[#141414] text-[#808080] border-[#333333] hover:text-[#C87D55] hover:border-[#4A4A4A]'
                  }`}
                  title="Abrir/Fechar fita de histórico"
                >
                  <History className="w-3 h-3" />
                  <span>Histórico ({historico.length})</span>
                </button>
              </div>

              {/* VISOR / DISPLAY DE DÍGITOS (Cor de Cobre no Preto #050505) */}
              <div className="w-full bg-[#050505] border border-[#1E1E1E] rounded-2xl p-4 mb-5 flex flex-col justify-end min-h-[105px] shadow-inner relative overflow-hidden">
                {/* Linha superior: Expressão secundária (ex: 25 × 4) */}
                <div className="text-right text-xs sm:text-sm text-[#8f644b] font-mono-numbers h-5 truncate select-none">
                  {expressaoAnterior || '\u00A0'}
                </div>

                {/* Linha principal: Dígitos em Cobre Luminoso */}
                <div
                  className={`text-right font-mono-numbers font-bold text-[#D98A6C] tracking-tight transition-all truncate select-all ${
                    display.length > 10
                      ? 'text-2xl sm:text-3xl'
                      : display.length > 7
                      ? 'text-3xl sm:text-4xl'
                      : 'text-4xl sm:text-5xl'
                  }`}
                >
                  {display}
                </div>
              </div>

              {/* GRADE DE BOTÕES (Estritamente Circulares com Borda Cinza #4A4A4A) */}
              <div className="grid grid-cols-4 gap-3 sm:gap-3.5 place-items-center">
                {/* LINHA 1: Funções de Apoio e Divisão */}
                <BotaoCircular
                  rotulo="AC"
                  tipo="acao"
                  ativo={teclaAtiva === 'AC'}
                  onClick={limparTudo}
                  title="Limpar tudo (Escape ou C)"
                />
                <BotaoCircular
                  rotulo="±"
                  tipo="acao"
                  ativo={teclaAtiva === '±'}
                  onClick={inverterSinal}
                  title="Inverter sinal positivo/negativo"
                />
                <BotaoCircular
                  rotulo="%"
                  tipo="acao"
                  ativo={teclaAtiva === '%'}
                  onClick={aplicarPorcentagem}
                  title="Porcentagem (%)"
                />
                <BotaoCircular
                  rotulo="÷"
                  tipo="operador"
                  ativo={teclaAtiva === '÷' || operadorEscolhido === '÷'}
                  onClick={() => definirOperador('÷')}
                  title="Divisão (/)"
                />

                {/* LINHA 2: 7, 8, 9, Multiplicação */}
                <BotaoCircular
                  rotulo="7"
                  tipo="numero"
                  ativo={teclaAtiva === '7'}
                  onClick={() => adicionarDigito('7')}
                />
                <BotaoCircular
                  rotulo="8"
                  tipo="numero"
                  ativo={teclaAtiva === '8'}
                  onClick={() => adicionarDigito('8')}
                />
                <BotaoCircular
                  rotulo="9"
                  tipo="numero"
                  ativo={teclaAtiva === '9'}
                  onClick={() => adicionarDigito('9')}
                />
                <BotaoCircular
                  rotulo="×"
                  tipo="operador"
                  ativo={teclaAtiva === '×' || operadorEscolhido === '×'}
                  onClick={() => definirOperador('×')}
                  title="Multiplicação (*)"
                />

                {/* LINHA 3: 4, 5, 6, Subtração */}
                <BotaoCircular
                  rotulo="4"
                  tipo="numero"
                  ativo={teclaAtiva === '4'}
                  onClick={() => adicionarDigito('4')}
                />
                <BotaoCircular
                  rotulo="5"
                  tipo="numero"
                  ativo={teclaAtiva === '5'}
                  onClick={() => adicionarDigito('5')}
                />
                <BotaoCircular
                  rotulo="6"
                  tipo="numero"
                  ativo={teclaAtiva === '6'}
                  onClick={() => adicionarDigito('6')}
                />
                <BotaoCircular
                  rotulo="-"
                  tipo="operador"
                  ativo={teclaAtiva === '-' || operadorEscolhido === '-'}
                  onClick={() => definirOperador('-')}
                  title="Subtração (-)"
                />

                {/* LINHA 4: 1, 2, 3, Adição */}
                <BotaoCircular
                  rotulo="1"
                  tipo="numero"
                  ativo={teclaAtiva === '1'}
                  onClick={() => adicionarDigito('1')}
                />
                <BotaoCircular
                  rotulo="2"
                  tipo="numero"
                  ativo={teclaAtiva === '2'}
                  onClick={() => adicionarDigito('2')}
                />
                <BotaoCircular
                  rotulo="3"
                  tipo="numero"
                  ativo={teclaAtiva === '3'}
                  onClick={() => adicionarDigito('3')}
                />
                <BotaoCircular
                  rotulo="+"
                  tipo="operador"
                  ativo={teclaAtiva === '+' || operadorEscolhido === '+'}
                  onClick={() => definirOperador('+')}
                  title="Adição (+)"
                />

                {/* LINHA 5: 0, Ponto, Backspace, Igual */}
                <BotaoCircular
                  rotulo="0"
                  tipo="numero"
                  ativo={teclaAtiva === '0'}
                  onClick={() => adicionarDigito('0')}
                />
                <BotaoCircular
                  rotulo="."
                  tipo="numero"
                  ativo={teclaAtiva === '.'}
                  onClick={adicionarPonto}
                  title="Ponto decimal (.)"
                />
                <BotaoCircular
                  rotulo="⌫"
                  tipo="acao"
                  ativo={teclaAtiva === '⌫'}
                  onClick={apagarUltimo}
                  title="Apagar dígito (Backspace)"
                />
                <BotaoCircular
                  rotulo="="
                  tipo="igual"
                  ativo={teclaAtiva === '='}
                  onClick={calcularResultado}
                  title="Calcular resultado (Enter ou =)"
                />
              </div>

              {/* Dica de usabilidade do teclado */}
              <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] text-[#666666]">
                <span>Suporte a teclado numérico ativo</span>
                <span className="font-mono text-[#8f644b]">Enter = Calcular</span>
              </div>
            </div>

            {/* PAINEL LATERAL: HISTÓRICO DE CÁLCULOS (Exibição responsiva) */}
            <div
              className={`w-full max-w-[360px] lg:max-w-[320px] bg-[#0D0D0D] border border-[#262626] rounded-3xl p-5 shadow-xl flex flex-col min-h-[380px] lg:min-h-[500px] transition-all ${
                historicoAberto ? 'block' : 'hidden lg:flex'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E] mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#C87D55]" />
                  <h2 className="text-sm font-semibold text-[#f0f0f0]">Fita de Histórico</h2>
                </div>
                {historico.length > 0 && (
                  <button
                    onClick={() => setHistorico([])}
                    className="text-xs text-[#808080] hover:text-[#D98A6C] flex items-center gap-1 transition-colors"
                    title="Limpar histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {historico.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-[#555555] py-8">
                  <div className="w-12 h-12 rounded-full border border-[#222222] flex items-center justify-center mb-3">
                    <History className="w-6 h-6 text-[#333333]" />
                  </div>
                  <p className="text-xs">Nenhum cálculo registrado ainda.</p>
                  <p className="text-[11px] text-[#444444] mt-1">
                    Suas operações finalizadas aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[420px]">
                  {historico.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => usarItemHistorico(item.resultado)}
                      className="group p-3 rounded-2xl bg-[#080808] border border-[#1C1C1C] hover:border-[#4A4A4A] transition-all cursor-pointer flex flex-col"
                      title="Clique para carregar este valor no visor"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#777777]">
                        <span>{item.hora}</span>
                        <span className="text-[#8f644b] font-mono-numbers">{item.expressao}</span>
                      </div>
                      <div className="text-right text-lg font-bold font-mono-numbers text-[#D98A6C] group-hover:text-[#e4a187] transition-colors mt-0.5">
                        {item.resultado}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-[#1C1C1C] mt-auto text-[11px] text-[#666666] flex items-center justify-between">
                <span>Clique em um item para reutilizá-lo</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: VISUALIZADOR & DOWNLOAD DO CÓDIGO PYTHON           */}
        {/* ========================================================= */}
        {abaAtiva === 'python' && (
          <div className="w-full bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E] mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#f0f0f0] flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#C87D55]" />
                  Código Python Desktop (CustomTkinter)
                </h2>
                <p className="text-xs text-[#808080] mt-0.5">
                  Fundo preto (#000000), botões circulares com aro cinza (#4A4A4A), números em cobre e lógica explícita sem eval().
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copiarCodigo}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141414] border border-[#4A4A4A] hover:border-[#808080] text-xs font-medium text-[#C87D55] hover:text-[#D98A6C] transition-all"
                >
                  {codigoCopiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{codigoCopiado ? 'Copiado!' : 'Copiar Código'}</span>
                </button>

                <button
                  onClick={baixarScriptPython}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#B87333] hover:bg-[#C87D55] text-xs font-semibold text-black transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar .py</span>
                </button>
              </div>
            </div>

            {/* Como executar localmente */}
            <div className="bg-[#050505] border border-[#222222] rounded-2xl p-4 mb-4 text-xs">
              <span className="font-semibold text-[#D98A6C] block mb-1">
                Instruções de execução no seu computador (Python 3.10+):
              </span>
              <div className="font-mono bg-[#0D0D0D] p-2.5 rounded-lg border border-[#1A1A1A] text-[#C87D55] mb-2 flex items-center justify-between">
                <span>pip install customtkinter</span>
                <span className="text-[#666666]"># Instalar biblioteca gráfica</span>
              </div>
              <div className="font-mono bg-[#0D0D0D] p-2.5 rounded-lg border border-[#1A1A1A] text-[#C87D55] flex items-center justify-between">
                <span>python calculadora_cobre.py</span>
                <span className="text-[#666666]"># Executar aplicação</span>
              </div>
            </div>

            {/* Bloco de Código com Scroll */}
            <div className="bg-[#050505] border border-[#1E1E1E] rounded-2xl p-4 font-mono text-xs text-[#d4b5a3] overflow-x-auto max-h-[500px]">
              <pre className="leading-relaxed whitespace-pre font-mono-numbers">
                {PYTHON_CALCULATOR_CODE}
              </pre>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: SEÇÃO DIDÁTICA COMPLETA                             */}
        {/* ========================================================= */}
        {abaAtiva === 'didatica' && (
          <div className="w-full bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col space-y-6">
            <div className="pb-4 border-b border-[#1E1E1E]">
              <span className="text-xs uppercase tracking-wider text-[#996b52] font-semibold">
                Guia Pedagógico do Desafio
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#f0f0f0] mt-1 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#C87D55]" />
                Funcionamento da Solução e Análise Técnica
              </h2>
              <p className="text-sm text-[#888888] mt-1">
                Respostas fundamentadas às 3 questões do projeto sobre arquitetura, captura de operações e lógica condicional.
              </p>
            </div>

            {/* PERGUNTA 1 */}
            <div className="bg-[#080808] border border-[#222222] rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-[#D98A6C] font-semibold text-base">
                <span className="w-7 h-7 rounded-full bg-[#1C1410] border border-[#B87333]/50 flex items-center justify-center text-xs font-mono">
                  1
                </span>
                <h3>Quais são os principais componentes do código gerado?</h3>
              </div>
              <div className="text-sm text-[#cccccc] leading-relaxed pl-9 space-y-2">
                <p>
                  O código gerado foi dividido em três camadas bem definidas e complementares:
                </p>
                <ul className="list-disc list-inside space-y-2 text-[#b0b0b0] pl-2">
                  <li>
                    <strong className="text-[#C87D55]">Camada de Interface Gráfica (View):</strong>{' '}
                    Composta pela janela principal com bordas arredondadas (28px no desktop e 24px no web), o contêiner central elevado (<code className="text-[#D98A6C]">#0D0D0D</code>), a caixa embutida do visor (<code className="text-[#D98A6C]">#050505</code>) contendo o rótulo da expressão anterior e o rótulo principal dos dígitos, além da matriz de botões estritamente circulares (<code className="text-[#D98A6C]">aspect-ratio 1:1</code> com raio igual à metade da dimensão).
                  </li>
                  <li>
                    <strong className="text-[#C87D55]">Camada de Estado e Captura (Controller):</strong>{' '}
                    Controladores de eventos que escutam tanto os cliques do mouse nos botões virtuais quanto os eventos de digitação do teclado físico (<code className="text-[#D98A6C]">keydown</code> / <code className="text-[#D98A6C]">bind("&lt;Key&gt;")</code>), direcionando cada entrada para o manipulador correspondente.
                  </li>
                  <li>
                    <strong className="text-[#C87D55]">Camada de Processamento Aritmético (Model/Engine):</strong>{' '}
                    O motor que gerencia o ciclo de vida dos operandos (<code className="text-[#D98A6C]">primeiro_numero</code>, <code className="text-[#D98A6C]">segundo_numero</code>, <code className="text-[#D98A6C]">operador_escolhido</code>), as regras de ponto flutuante, a fita de histórico e a formatação sem estouro visual.
                  </li>
                </ul>
              </div>
            </div>

            {/* PERGUNTA 2 */}
            <div className="bg-[#080808] border border-[#222222] rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-[#D98A6C] font-semibold text-base">
                <span className="w-7 h-7 rounded-full bg-[#1C1410] border border-[#B87333]/50 flex items-center justify-center text-xs font-mono">
                  2
                </span>
                <h3>Como a aplicação recebe os números e identifica a operação escolhida?</h3>
              </div>
              <div className="text-sm text-[#cccccc] leading-relaxed pl-9 space-y-2">
                <p>
                  A aplicação emprega um fluxo de recepção sequencial e determinístico:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-[#b0b0b0] pl-2">
                  <li>
                    <strong className="text-[#C87D55]">Entrada dos Dígitos:</strong> Ao clicar em um botão numérico (0 a 9) ou teclar no teclado, a função <code className="text-[#D98A6C]">adicionarDigito(digito)</code> é invocada. Se a calculadora estiver aguardando o segundo número ou o visor estiver exibindo apenas <code className="text-[#D98A6C]">"0"</code>, o novo dígito substitui o display; caso contrário, ele é concatenado à direita da string atual até o limite de legibilidade (12 dígitos).
                  </li>
                  <li>
                    <strong className="text-[#C87D55]">Seleção do Operador:</strong> Ao acionar um operador (<code className="text-[#D98A6C]">+</code>, <code className="text-[#D98A6C]">-</code>, <code className="text-[#D98A6C]">×</code>, <code className="text-[#D98A6C]">÷</code>), a função <code className="text-[#D98A6C]">definirOperador(operador)</code> converte a string atual do visor para número decimal flutuante (<code className="text-[#D98A6C]">float</code>), armazena esse valor na variável de memória <code className="text-[#D98A6C]">primeiro_numero</code>, salva o símbolo na variável <code className="text-[#D98A6C]">operador_escolhido</code> e ativa a flag booleana <code className="text-[#D98A6C]">aguardando_segundo_numero = True</code>.
                  </li>
                  <li>
                    <strong className="text-[#C87D55]">Atualização Visual:</strong> O visor superior registra a expressão pendente (ex.: <code className="text-[#D98A6C]">"45 ×"</code>), permitindo ao usuário auditar claramente qual cálculo está em andamento antes de digitar o próximo número.
                  </li>
                </ol>
              </div>
            </div>

            {/* PERGUNTA 3 */}
            <div className="bg-[#080808] border border-[#222222] rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-[#D98A6C] font-semibold text-base">
                <span className="w-7 h-7 rounded-full bg-[#1C1410] border border-[#B87333]/50 flex items-center justify-center text-xs font-mono">
                  3
                </span>
                <h3>Como a lógica de programação (variáveis e condições) é utilizada para realizar os cálculos e apresentar os resultados?</h3>
              </div>
              <div className="text-sm text-[#cccccc] leading-relaxed pl-9 space-y-3">
                <p>
                  Para atender com excelência ao rigor didático e à segurança da aplicação, <strong className="text-emerald-400">eliminamos totalmente a função perigosa <code>eval()</code></strong>. Em seu lugar, a função <code className="text-[#D98A6C]">calcularResultado()</code> adota a seguinte arquitetura de variáveis e estruturas de decisão:
                </p>

                <div className="bg-[#050505] p-3.5 rounded-xl border border-[#202020] font-mono text-xs text-[#C87D55] space-y-1">
                  <div className="text-[#777777]"># Exemplo didático da estrutura condicional em execução:</div>
                  <div>if operador_escolhido == "+":</div>
                  <div className="pl-4 text-[#e5e5e5]">resultado = primeiro_numero + segundo_numero</div>
                  <div>elif operador_escolhido == "-":</div>
                  <div className="pl-4 text-[#e5e5e5]">resultado = primeiro_numero - segundo_numero</div>
                  <div>elif operador_escolhido in ("×", "*"):</div>
                  <div className="pl-4 text-[#e5e5e5]">resultado = primeiro_numero * segundo_numero</div>
                  <div>elif operador_escolhido in ("÷", "/"):</div>
                  <div className="pl-4 text-[#e5e5e5]">if segundo_numero == 0:</div>
                  <div className="pl-8 text-rose-400">exibir_erro("Indefinido")  # Proteção contra Divisão por Zero!</div>
                  <div className="pl-4 text-[#e5e5e5]">else:</div>
                  <div className="pl-8 text-[#e5e5e5]">resultado = primeiro_numero / segundo_numero</div>
                </div>

                <p className="text-[#b0b0b0]">
                  <strong>Apresentação e Encadeamento:</strong>
                  Após o cálculo, a função formata o resultado numérico eliminando casas decimais desnecessárias (ex.: <code className="text-[#D98A6C]">42.0</code> torna-se <code className="text-[#D98A6C]">"42"</code>), atualiza a fita de histórico para consulta e transfere o resultado para a variável <code className="text-[#D98A6C]">primeiro_numero</code>. Isso possibilita realizar cálculos encadeados contínuos com absoluta precisão e sem necessidade de reiniciar a calculadora.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RODAPÉ ELEGANTE E MINIMALISTA */}
      <footer className="w-full max-w-4xl pt-6 mt-8 border-t border-[#161616] flex flex-col sm:flex-row items-center justify-between text-xs text-[#555555] gap-2">
        <span>Calculadora Copper & Black · Padrão de Design Industrial</span>
        <div className="flex items-center gap-4 text-[#777777]">
          <span>Preto: #000000</span>
          <span>·</span>
          <span>Bordas: #4A4A4A</span>
          <span>·</span>
          <span className="text-[#C87D55]">Cobre: #C87D55</span>
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------------
// COMPONENTE: BOTÃO ESTREITAMENTE CIRCULAR
// Cumpre a especificação: formato redondo, borda cinza, cor de cobre
// -----------------------------------------------------------------
interface BotaoCircularProps {
  rotulo: string;
  tipo: 'numero' | 'operador' | 'acao' | 'igual';
  ativo?: boolean;
  onClick: () => void;
  title?: string;
}

function BotaoCircular({ rotulo, tipo, ativo = false, onClick, title }: BotaoCircularProps) {
  // Configuração das cores de cobre e estados de acordo com o tipo
  let estiloTexto = 'text-[#C87D55]';
  let estiloFundo = 'bg-[#121212]';

  if (tipo === 'operador') {
    estiloTexto = 'text-[#B87333] font-bold text-xl';
    estiloFundo = 'bg-[#161616]';
  } else if (tipo === 'igual') {
    estiloTexto = 'text-[#000000] font-bold text-xl';
    estiloFundo = 'bg-[#C87D55]';
  } else if (tipo === 'acao') {
    estiloTexto = 'text-[#a37254] font-medium text-sm sm:text-base';
    estiloFundo = 'bg-[#141414]';
  } else {
    // Número
    estiloTexto = 'text-[#C87D55] font-semibold text-lg sm:text-xl font-mono-numbers';
    estiloFundo = 'bg-[#111111]';
  }

  return (
    <button
      onClick={onClick}
      title={title || rotulo}
      className={`
        w-14 sm:w-16 h-14 sm:h-16
        rounded-full aspect-square
        flex items-center justify-center
        transition-all duration-150 ease-out
        select-none cursor-pointer
        ${tipo === 'igual' ? 'border-2 border-[#D98A6C] hover:bg-[#D98A6C]' : 'border-2 border-[#4A4A4A] hover:border-[#808080] hover:bg-[#1f1f1f]'}
        ${ativo ? 'scale-90 border-[#D98A6C] brightness-125 ring-2 ring-[#B87333]/40' : 'active:scale-95'}
        ${estiloFundo}
        ${estiloTexto}
        shadow-md
      `}
    >
      <span className="leading-none">{rotulo}</span>
    </button>
  );
}
