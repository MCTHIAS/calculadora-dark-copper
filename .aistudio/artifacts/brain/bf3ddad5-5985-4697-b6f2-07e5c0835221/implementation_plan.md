# Plano de Implementação: Calculadora Copper & Black

Plano arquitetural e de design para a criação de uma calculadora elegante com acabamento premium em preto profundo, botões estritamente circulares com bordas cinzas e tipografia em tons quentes de cobre. O projeto contemplará tanto a aplicação Web interativa executada em tempo real no navegador quanto a disponibilização do script Python (CustomTkinter) completo pronto para execução desktop local.

---

## Decisões Confirmadas na Fase de Alinhamento

> [!IMPORTANT]
> As escolhas a seguir foram alinhadas e confirmadas com o usuário:
> - **Ambiente de Entrega**: Aplicação Web interativa no navegador (com live preview) + Módulo/botão de download do script Python Desktop (`calculadora_cobre.py`).
> - **Escopo Matemático**: Calculadora padrão robusta (4 operações fundamentais, porcentagem, inversão de sinal `+/-`, decimais), com histórico expansível de cálculos e suporte total a atalhos de teclado.
> - **Experiência Sensorial (Feedback)**: Animações sutis e refinadas de hover/clique nas teclas circulares, com feedback sonoro suave opcional (toggle de som com Web Audio API).

---

## 1. Problema que o Aplicativo Resolve

As calculadoras padrão de sistemas operacionais e ferramentas web corriqueiras frequentemente pecam em dois extremos opostos:
1. **Falta de conforto visual e elegância**: A maioria adota temas claros saturados ou interfaces monocromáticas cinzentas e frias que causam fadiga ocular após uso contínuo, além de parecerem utilitários impessoais e mecânicos.
2. **Desconexão entre estética e usabilidade ágil**: Aplicativos que tentam inovar visualmente muitas vezes sacrificam a ergonomia tátil, com botões retangulares confusos, ausência de atalhos de teclado rápidos e perda de histórico de operações.

**A Solução Copper & Black**:
Uma interface refinada e minimalista inspirada no luxo industrial e no artesanato de precisão. O contraste entre o preto absoluto (`#000000`) e os tons quentes de cobre metálico (`#C87D55` / `#B87333`) cria um ambiente de altíssimo conforto para os olhos, enquanto botões circulares bem espaçados com aros cinzas (`#4A4A4A`) oferecem clareza geométrica imediata e uma resposta tátil prazerosa a cada cálculo.

---

## 2. Público Principal

O aplicativo foi projetado especificamente para:
- **Profissionais criativos, arquitetos, designers e engenheiros**: Que prezam por instrumentos de trabalho com alto rigor estético, elegância e acabamento escuro sofisticado na mesa de trabalho.
- **Desenvolvedores e entusiastas de tecnologia**: Que utilizam temas escuros (*dark mode*) em suas estações de trabalho e desejam uma calculadora que se integre harmonicamente ao setup sem agredir a visão.
- **Estudantes e profissionais de finanças e negócios**: Que necessitam realizar checagens rápidas de somas, divisões e porcentagens com histórico auditável para conferência.
- **Usuários que valorizam estética tátil**: Aqueles que apreciam a sensação de instrumentos físicos analógicos de precisão traduzidos para o ambiente digital.

---

## 3. Requisitos Funcionais e Técnicos

### 3.1 Operações Matemáticas
- **Operações Básicas**: Adição (`+`), Subtração (`−`), Multiplicação (`×`) e Divisão (`÷`).
- **Funções Especiais de Apoio**:
  - Limpar entrada / Limpar tudo (`C` / `AC` com limpeza em cascata).
  - Inversão de sinal (`±`).
  - Cálculo de porcentagem (`%`), calculando variações proporcionais e percentuais diretos.
  - Ponto decimal flutuante com bloqueio de múltiplos pontos (`.`).
  - Exclusão do último caractere (`⌫` Backspace).
- **Encadeamento Fluido**: Capacidade de encadear cálculos sucessivos mantendo precisão de ponto flutuante (ex.: `12 + 8 × 2` com atualização de operador pendente ou cálculo progressivo com visualização da expressão completa).
- **Fita de Histórico**: Painel lateral/gaveta colapsável que armazena os últimos cálculos com opção de reusar o resultado com um clique e limpar o histórico.

### 3.2 Interações de Teclado e Mouse
- **Controle por Mouse/Touch**: Clique em cada botão circular com animação de pressão (`scale-95`), iluminação suave da borda e feedback sonoro opcional.
- **Mapeamento de Teclado Físico**:
  - Teclas numéricas `0` a `9` e `.`.
  - Operadores `+`, `-`, `*` ou `x`, `/`.
  - Confirmação de cálculo com `Enter` ou `=`.
  - Cancelamento com `Escape` ou `c`/`C`.
  - Correção com `Backspace`.
  - Indicação visual correspondente no botão virtual quando pressionado via teclado.

### 3.3 Tratamento de Erros e Casos de Borda
- **Divisão por Zero**: Exibição clara e amigável da mensagem `"Indefinido"` no visor, desabilitando operadores até nova entrada ou `C`, sem travar a aplicação.
- **Overflow Numérico**: Formatação automática para notação científica quando o número ultrapassar 12 dígitos para preservar o layout sem transbordar.
- **Entrada Segura de Ponto Decimal**: Se o visor estiver em `0` e o usuário digitar `.`, converte para `0.`; impede inserção de múltiplos pontos no mesmo operando.

### 3.4 Arquitetura Visual e Paleta de Cores Hexadecimais Exatas

| Elemento Visual | Código Hexadecimal | Descrição e Aplicação |
| :--- | :--- | :--- |
| **Fundo Principal (Canvas & Janela)** | `#000000` | Preto absoluto predominante, criando contraste de luxo e economia visual |
| **Superfície do Container da Calculadora** | `#0D0D0D` | Preto profundo ligeiramente elevado para destacar a silhueta da calculadora |
| **Visor / Display de Dígitos** | `#050505` | Caixa de leitura embutida com reflexo sutil e cantos arredondados |
| **Números nos Botões e Visor (Cobre Primário)** | `#C87D55` | Tom de cobre escovado caloroso, proporcionando legibilidade perfeita no preto |
| **Destaque do Resultado no Visor (Cobre Intenso)** | `#D98A6C` | Cobre luminoso para o número principal em evidência |
| **Operadores e Ações Especiais (Cobre Nobre)** | `#B87333` | Cobre clássico polido para os botões de ação (`+`, `-`, `×`, `÷`, `=`) |
| **Bordas dos Botões (Cinza Neutro)** | `#4A4A4A` | Aro cinza refinado em torno de cada botão circular |
| **Bordas em Hover/Foco (Cinza Claro)** | `#808080` | Realce visual sutil ao aproximar o cursor do mouse |
| **Borda do Container Geral** | `#262626` | Delimitação sutil e elegante dos cantos arredondados da janela |

### 3.5 Geometria e Estilo dos Componentes
- **Formato dos Botões**: Estritamente circulares (`border-radius: 9999px` / `aspect-ratio: 1/1`).
- **Bordas**: Traço contínuo com espessura fina (1.5px a 2px) na cor cinza `#4A4A4A`.
- **Efeitos de Hover e Clique**: Transição suave de 150ms a 200ms com leve elevação de luminosidade no aro cinza (`#808080`) e compressão mecânica tátil (`transform: scale(0.96)`).
- **Tipografia**: Fonte monoespaçada de precisão e números sem serifa elegantes com kerning equilibrado.

### 3.6 Arquitetura de Software e Tecnologias

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CALCULADORA COPPER & BLACK                           │
│                                                                        │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │   AMBIENTE WEB (REACT)  │          │   SCRIPT PYTHON DESKTOP     │  │
│  │   - React 19 + Vite     │          │   - Biblioteca: CustomTkinter│  │
│  │   - Tailwind CSS 4      │          │   - Fundo nativo: #000000   │  │
│  │   - Lucide Icons        │          │   - Botões circulares       │  │
│  │   - Web Audio FX        │          │   - Exportável em 1 clique  │  │
│  └────────────┬────────────┘          └──────────────┬──────────────┘  │
│               │                                      │                 │
│               ▼                                      ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               NÚCLEO DO MOTOR DE CÁLCULO                         │  │
│  │  - Estado: Operando A, Operador, Operando B, Display             │  │
│  │  - Fita de Histórico: [ { exp: "25 × 4", res: "100" } ]          │  │
│  │  - Validação e Proteção contra Divisão por Zero                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Biblioteca Gráfica Python Selecionada**: **CustomTkinter** (com suporte e instruções de execução para Python 3.10+).
  - *Motivo da escolha*: CustomTkinter permite definir cantos arredondados em janelas, suporta temas escuros puros (`#000000`), renderiza botões perfeitamente circulares definindo `corner_radius = tamanho / 2`, e não exige dependências pesadas de sistema como o PyQt6.
  - *Disponibilização*: A interface Web conterá um botão discreto e elegante com ícone de código (`Python .py`), permitindo ao usuário visualizar o código-fonte Python e baixá-lo como `calculadora_cobre.py` diretamente do navegador.

---

## 4. Critérios de Teste e Aceitação da Primeira Versão

Para garantir que a primeira versão cumpra rigorosamente todas as especificações, os seguintes testes serão executados:

### 4.1 Testes de Cálculo
1. **Adição e Subtração**:
   - `15.5 + 24.5 = 40`
   - `100 - 35.75 = 64.25`
   - `-5 + 12 = 7` (usando botão `±`)
2. **Multiplicação e Divisão**:
   - `12.5 × 8 = 100`
   - `10 ÷ 4 = 2.5`
   - `1 ÷ 3 = 0.3333333333` (teste de dízima periódica e arredondamento limpo)
3. **Porcentagem**:
   - `200 × 15% = 30`
   - `50 + 10% = 55`
4. **Operações Encadeadas**:
   - `10 + 5 × 2 =` (verificar se a execução progressiva atualiza visualmente a memória do cálculo anterior).

### 4.2 Testes de Tratamento de Erros
1. **Divisão por Zero**:
   - Inserir `50 ÷ 0 =`. O visor deve mostrar `"Indefinido"` de forma elegante, sem crash e permitindo reset imediato ao clicar em `C` ou digitar um novo número.
2. **Prevenção de Múltiplos Pontos Decimais**:
   - Inserir `3.1.4.15` -> o sistema deve aceitar apenas o primeiro ponto (`3.1415`).
3. **Estouro de Dígitos (Overflow)**:
   - Multiplicações de números de grande escala (ex.: `99999999 × 99999999`) não devem romper a borda do visor e sim exibir a notação científica ou limite ajustado com precisão.

### 4.3 Critérios de Aceitação Visual (Design & UI/UX)
1. **Fundo Preto Absoluto**: Fundo predominante testado exatamente em `#000000` e janela com cantos suaves (`rounded-3xl`).
2. **Circularidade Estrita dos Botões**: Todos os botões do teclado numérico e de operações devem ter proporção 1:1 e formato circular contínuo (`rounded-full`), sem achatamento oval.
3. **Bordas Cinzas**: Aros contínuos na cor `#4A4A4A` com feedback em hover clareando para `#808080`.
4. **Cores de Cobre**: Todos os dígitos, símbolos e o texto principal do visor devem exibir as tonalidades `#C87D55`, `#B87333` e `#D98A6C`.
5. **Acessibilidade e Ergonomia**: Tamanho mínimo dos botões respeitando o padrão ergonômico (mínimo de 52px a 64px de diâmetro), com suporte tátil e teclado completo.
6. **Código Python Disponível**: Modal de visualização e download do script `calculadora_cobre.py` em CustomTkinter funcionando perfeitamente.
