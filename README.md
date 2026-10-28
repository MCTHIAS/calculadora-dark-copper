# Calculadora Industrial (Dark & Copper UI)

Uma calculadora de alta precisão inspirada no design industrial e no artesanato de instrumentos analógicos de luxo. O projeto foi concebido para unir o conforto visual do contraste entre o preto absoluto (`#000000`) e tons metálicos quentes de cobre (`#C87D55`, `#B87333`, `#D98A6C`), com botões estritamente circulares envolvidos por anéis cinzas (`#4A4A4A`).

Este repositório disponibiliza **duas implementações completas e sincronizadas**:
1. **Aplicação Web Interativa:** Desenvolvida em React 19, TypeScript e Tailwind CSS com áudio tátil sintetizado (Web Audio API) e fita de histórico.
2. **Aplicação Desktop Nativa em Python:** Implementada com a biblioteca moderna `CustomTkinter` no arquivo [`calculadora.py`](./calculadora.py), pronta para execução em qualquer sistema operacional.

---

## 1. Planejamento Inicial do Produto

### 1.1 Problema que o aplicativo resolve
As calculadoras digitais cotidianas costumam cometer dois erros fundamentais:
- **Fadiga Ocular e Desconexão Estética:** Interfaces brancas saturadas ou cinzentas genéricas cansam a visão durante o uso prolongado e destoam de estações de trabalho e ambientes com tema escuro (*dark mode*).
- **Falta de Ergonomia e Resposta Tátil:** Telas com botões retangulares confusos, ausência de suporte ágil ao teclado físico e perda imediata do histórico de operações.

A **Calculadora Copper & Black** soluciona essas deficiências ao entregar uma estética escura sofisticada de alto contraste, com botões circulares limpos e previsíveis, suporte instantâneo ao teclado e histórico de conferência.

### 1.2 Público principal
- **Profissionais criativos, arquitetos, designers e engenheiros:** Que buscam ferramentas de trabalho com rigor estético, acabamento refinado e presença elegante.
- **Desenvolvedores e entusiastas de tecnologia:** Usuários assíduos de ambientes escuros que necessitam de cálculos rápidos sem quebra visual no setup.
- **Estudantes e profissionais de finanças e gestão:** Que realizam somas, divisões e porcentagens frequentes e exigem conferência no visor secundário.
- **Público educacional e acadêmico:** Estudantes de programação que desejam compreender a lógica pura de um interpretador aritmético seguro sem atalhos como `eval()`.

### 1.3 Requisitos funcionais
- **Operações Fundamentais:** Adição (`+`), Subtração (`-`), Multiplicação (`×`) e Divisão (`÷`).
- **Funções Especiais:** Limpeza geral (`AC`), inversão de polaridade (`±`), cálculo de porcentagem (`%`), ponto flutuante com bloqueio de duplicidade (`.`) e correção de dígito (`⌫` Backspace).
- **Tratamento de Exceções:** Bloqueio e tratamento gracioso para divisão por zero com a mensagem `"Indefinido"`, além de formatação para evitar estouro visual do display.
- **Encadeamento de Operações:** O resultado de uma operação anterior é reaproveitado automaticamente como primeiro operando para o próximo cálculo.
- **Controle Total via Teclado e Mouse:** Mapeamento nativo de teclas `0-9`, `+`, `-`, `*`, `/`, `Enter`, `=`, `Backspace` e `Escape`.

### 1.4 Critérios utilizados para testar a primeira versão
- **Aritmética Básica e Ponto Flutuante:** `15.5 + 24.5 = 40`, `100 - 35.75 = 64.25`, `12.5 × 8 = 100`, `10 ÷ 4 = 2.5` e `1 ÷ 3 = 0.33333333`.
- **Tratamento de Divisão por Zero:** `50 ÷ 0` exibe `"Indefinido"` sem interromper a execução do programa nem congelar a interface.
- **Porcentagem e Sinal Negativo:** `200 × 15% = 30` e uso do botão `±` para inverter sinais sem conflitos com operadores.
- **Validação Geométrica e de Cores:** Inspeção visual para garantir que os botões mantenham proporção 1:1 rigorosamente circular (`corner_radius = tamanho / 2`), bordas cinzas nítidas de `2px` e dígitos exclusivamente na cor de cobre.

---

## 2. Identidade Visual e Paleta de Cores

A interface segue uma identidade visual estrita de estilo industrial minimalista:

| Elemento da Interface | Especificação Técnica | Código Hexadecimal | Função Visual |
| :--- | :--- | :--- | :--- |
| **Fundo da Janela (Canvas)** | Plano de fundo absoluto | `#000000` | Preto puro que elimina emissão de luz desnecessária |
| **Contêiner Principal** | Cantos arredondados (`corner_radius=28`) | `#0D0D0D` | Superfície ligeiramente elevada com borda sutil `#262626` |
| **Visor de Dados** | Display rebaixado (`corner_radius=18`) | `#050505` | Caixa de leitura embutida de alto contraste |
| **Dígitos Numéricos** | Tipografia monoespaçada em cobre | `#C87D55` | Tom de cobre escovado de fácil leitura |
| **Display do Resultado** | Destaque numérico luminoso | `#D98A6C` | Cobre brilhante para evidenciar o valor atual |
| **Operadores e Ações** | Cobre clássico polido | `#B87333` | Diferenciação semafórica para teclas de comando |
| **Bordas dos Botões** | Aro contínuo de `2px` | `#4A4A4A` | Geometria circular bem definida |
| **Borda em Foco/Hover** | Realce de passagem do cursor | `#808080` | Feedback tátil e visual ao usuário |
| **Formato dos Botões** | Estritamente circular (`58x58px`) | `corner_radius=29` | Geometria circular contínua (proporção 1:1) |

---

## 3. Seção Didática — Desafio Alura

Esta seção aborda a estrutura lógica, os componentes da solução e o uso de variáveis e estruturas condicionais puras para a resolução de cálculos matemáticos.

### 1. Quais são os principais componentes do código gerado?
O código está estruturado em três componentes fundamentais:

- **Janela e Contêineres de Interface:**
  - A janela principal define as dimensões e o fundo preto absoluto (`#000000`).
  - O contêiner interno (`self.container`) possui cantos arredondados (`corner_radius=28`) e tonalidade ligeiramente elevada (`#0D0D0D`) para dar profundidade industrial à peça.
  - O visor (`self.frame_visor`) é uma caixa rebaixada (`#050505`) contendo dois rótulos: um secundário para histórico/expressão em andamento e um principal de alta escala em cor de cobre (`#D98A6C`).
- **Matriz de Botões Circulares:**
  - Para garantir o formato estritamente circular, cada botão é instanciado com largura e altura iguais (`58x58px`) e raio de canto equivalente à metade da sua dimensão (`corner_radius=29`).
  - Todos os botões contam com borda cinza contínua de `2px` (`#4A4A4A`), que reage ao passar o mouse (`hover_color`), e tipografia em tons de cobre (`#C87D55` e `#B87333`).
- **Controlador de Eventos e Teclado Físico:**
  - Vincula os eventos do teclado do usuário (`bind("<Key>")`) aos mesmos métodos dos botões virtuais, garantindo agilidade na digitação numérica e nas operações.

---

### 2. Como a aplicação recebe os números e identifica a operação escolhida?
A aplicação utiliza um fluxo sequencial de estados:

- **Recepção dos Números:**
  - Quando o usuário clica em um botão numérico (ou digita no teclado), o caractere entra como `string`.
  - O sistema avalia: se a calculadora estiver com o valor inicial `"0"` ou com a flag `aguardando_segundo_numero = True`, o visor é limpo e recebe o novo dígito. Caso contrário, o dígito é concatenado ao número que já estava na tela, respeitando o limite de 12 caracteres.
- **Identificação e Registro da Operação:**
  - Ao clicar em um operador (`+`, `-`, `×`, `÷`), o valor textual do visor é convertido para número decimal (`float(texto_atual)`) e armazenado na variável `self.primeiro_numero`.
  - O símbolo da operação é guardado na variável `self.operador_escolhido`.
  - A flag `self.aguardando_segundo_numero` é ativada como `True`, sinalizando à interface que o próximo número digitado será o segundo operando.
  - O visor secundário atualiza imediatamente (ex.: `"25 ×"`), fornecendo confirmação visual da operação selecionada.

---

### 3. Como a lógica de programação (variáveis e condições) é utilizada para realizar os cálculos e apresentar os resultados?
A lógica de cálculo opera com variáveis de memória explícitas e estruturas condicionais (`if / elif / else`), eliminando qualquer risco de injeção ou comportamento imprevisível associado ao `eval()`:

```python
if self.operador_escolhido == "+":
    resultado = self.primeiro_numero + self.segundo_numero
elif self.operador_escolhido == "-":
    resultado = self.primeiro_numero - self.segundo_numero
elif self.operador_escolhido in ("×", "*"):
    resultado = self.primeiro_numero * self.segundo_numero
elif self.operador_escolhido in ("÷", "/"):
    if self.segundo_numero == 0:
        self.label_visor.configure(text="Indefinido")
        return
    else:
        resultado = self.primeiro_numero / self.segundo_numero
```

- **Variáveis de Controle:**
  - `self.primeiro_numero`: Guarda o primeiro valor inserido após a seleção do operador.
  - `self.operador_escolhido`: Armazena a operação pendente como texto (`"+"`, `"-"`, `"×"`, `"÷"`).
  - `self.segundo_numero`: Captura o valor presente no display no instante em que o usuário pressiona `=` ou `Enter`.
  - `self.aguardando_segundo_numero`: Flag lógica (`True`/`False`) que gerencia a transição de entrada entre o primeiro e o segundo operando.
- **Apresentação e Encadeamento:**
  O método de formatação converte decimais inteiros (ex.: `40.0` para `40`), previne estouros com notação científica e salva `resultado` em `self.primeiro_numero`, permitindo que cálculos posteriores continuem sem interrupção.

---

## 4. Como Executar o Projeto

### Versão Desktop (Python)
Requisitos: Python 3.10 ou superior.

1. Instale a biblioteca `customtkinter`:
   ```bash
   pip install customtkinter
   ```

2. Execute o arquivo principal da aplicação:
   ```bash
   python calculadora.py
   ```

### Versão Web Interativa (React + Vite)
Requisitos: Node.js 18 ou superior.

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Abra `http://localhost:3000` no seu navegador.
