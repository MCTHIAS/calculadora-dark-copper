/**
 * Código-fonte Python didático utilizando CustomTkinter
 * Sem uso de eval(), com estruturas condicionais explícitas (if/elif/else).
 */
export const PYTHON_CALCULATOR_CODE = `"""
Calculadora Industrial (Dark & Copper UI)
Desenvolvida com CustomTkinter para interface moderna em Dark Mode.
Identidade visual: Fundo preto (#000000), botões circulares com aro cinza (#4A4A4A) e tipografia em cobre.
Lógica didática: Variáveis explícitas e estruturas condicionais (if/elif/else), SEM eval().
"""

import customtkinter as ctk

# Configuração do modo escuro
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")

# Paleta de Cores Hexadecimais Exatas
COR_FUNDO = "#000000"           # Fundo preto absoluto predominante
COR_CONTAINER = "#0D0D0D"       # Superfície sutil da calculadora
COR_VISOR = "#050505"           # Caixa do display de dígitos
COR_COBRE_DIGITO = "#C87D55"    # Tom de cobre escovado para os números
COR_COBRE_RESULTADO = "#D98A6C" # Cobre luminoso para o visor principal
COR_COBRE_OPERADOR = "#B87333"  # Cobre clássico polido para operadores
COR_BORDA_CINZA = "#4A4A4A"     # Aro cinza neutro dos botões circulares
COR_BORDA_HOVER = "#808080"     # Realce do aro cinza ao passar o mouse
COR_BOTAO_FUNDO = "#141414"     # Fundo escuro do botão
COR_BOTAO_HOVER = "#222222"     # Fundo ao passar o mouse


class CalculadoraCopperBlack(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Janela e contêiner com cantos arredondados e geometria ampla
        self.title("Calculadora Industrial - Copper & Black")
        self.geometry("430x700")
        self.resizable(False, False)
        self.configure(fg_color=COR_FUNDO)

        # -------------------------------------------------------------
        # VARIÁVEIS DE ESTADO DO MOTOR DE CÁLCULO (SEM eval)
        # -------------------------------------------------------------
        self.primeiro_numero = None            # Armazena o primeiro número digitado
        self.operador_escolhido = None         # Armazena a operação (+, -, ×, ÷)
        self.segundo_numero = None             # Armazena o segundo número digitado
        self.aguardando_segundo_numero = False # Indica se o próximo dígito limpa o visor

        # Lista de referência para desobstrução pós-renderização dos botões
        self.lista_botoes = []

        # Inicialização da interface e eventos de teclado
        self._construir_interface()
        self._configurar_teclado()

        # Garante que o padding interno do texto seja desobstruído após o carregamento do CustomTkinter
        self.after(50, self._desobstruir_botoes)

    def _desobstruir_botoes(self):
        """Impede que o método interno _create_grid() do CTkButton esprema os textos dos botões."""
        for btn in self.lista_botoes:
            try:
                if hasattr(btn, "_text_label") and btn._text_label is not None:
                    btn._text_label.grid_configure(padx=0, pady=0)
            except Exception:
                pass

    def _construir_interface(self):
        """Cria e posiciona o contêiner, visor e os botões estritamente circulares."""
        # Contêiner central com cantos suaves
        self.container = ctk.CTkFrame(
            self,
            fg_color=COR_CONTAINER,
            corner_radius=28,
            border_width=1,
            border_color="#262626"
        )
        self.container.pack(padx=18, pady=20, fill="both", expand=True)

        # 1. VISOR DE DADOS (Caixa escura embutida via grid sem pack_propagate)
        self.frame_visor = ctk.CTkFrame(
            self.container,
            fg_color=COR_VISOR,
            corner_radius=20,
            border_width=1,
            border_color="#1E1E1E"
        )
        self.frame_visor.pack(padx=18, pady=(18, 14), fill="x")
        self.frame_visor.grid_columnconfigure(0, weight=1)

        # Rótulo da expressão anterior (ex: "15 + 4")
        self.label_expressao = ctk.CTkLabel(
            self.frame_visor,
            text="",
            font=("Consolas", 14),
            text_color="#8F644B",
            anchor="e",
            height=24
        )
        self.label_expressao.grid(row=0, column=0, padx=20, pady=(14, 2), sticky="ew")

        # Rótulo do valor principal em cobre luminoso com visibilidade garantida
        self.label_visor = ctk.CTkLabel(
            self.frame_visor,
            text="0",
            font=("Consolas", 40, "bold"),
            text_color=COR_COBRE_RESULTADO,
            anchor="e",
            height=50
        )
        self.label_visor.grid(row=1, column=0, padx=20, pady=(2, 16), sticky="ew")

        # 2. TECLADO DE BOTÕES RIGOROSAMENTE CIRCULARES
        # Matriz de botões no layout clássico
        botoes = [
            [("AC", "acao"), ("±", "acao"), ("%", "acao"), ("÷", "operador")],
            [("7", "numero"), ("8", "numero"), ("9", "numero"), ("×", "operador")],
            [("4", "numero"), ("5", "numero"), ("6", "numero"), ("-", "operador")],
            [("1", "numero"), ("2", "numero"), ("3", "numero"), ("+", "operador")],
            [("0", "numero"), (".", "numero"), ("⌫", "acao"), ("=", "igual")]
        ]

        frame_grade = ctk.CTkFrame(self.container, fg_color="transparent")
        frame_grade.pack(padx=16, pady=(4, 16), fill="both", expand=True)

        for col in range(4):
            frame_grade.grid_columnconfigure(col, weight=1, uniform="col")

        for linha in range(5):
            frame_grade.grid_rowconfigure(linha, weight=1, uniform="row")

        tamanho_botao = 72
        raio_circular = 32  # Proporção circular perfeita com folga interna

        for linha_idx, linha in enumerate(botoes):
            for col_idx, (rotulo, tipo) in enumerate(linha):
                # Definição de cores e tamanho de fonte conforme o tipo do botão
                if tipo in ("operador", "igual"):
                    cor_texto = COR_COBRE_OPERADOR
                    cor_borda = COR_BORDA_CINZA
                    tamanho_fonte = 22
                elif tipo == "acao":
                    cor_texto = "#A07050"
                    cor_borda = COR_BORDA_CINZA
                    tamanho_fonte = 18
                else:  # Dígito numérico
                    cor_texto = COR_COBRE_DIGITO
                    cor_borda = COR_BORDA_CINZA
                    tamanho_fonte = 21

                btn = ctk.CTkButton(
                    frame_grade,
                    text=rotulo,
                    width=tamanho_botao,
                    height=tamanho_botao,
                    corner_radius=raio_circular,
                    fg_color=COR_BOTAO_FUNDO,
                    hover_color=COR_BOTAO_HOVER,
                    border_color=cor_borda,
                    border_width=2,
                    text_color=cor_texto,
                    font=("Consolas", tamanho_fonte, "bold"),
                    command=lambda r=rotulo: self._ao_pressionar_botao(r)
                )

                # Posicionamento centralizado sem sticky para evitar formato oval
                btn.grid(row=linha_idx, column=col_idx, padx=6, pady=6)

                # Ajuste imediato do padding do _text_label logo após o .grid()
                if hasattr(btn, "_text_label") and btn._text_label is not None:
                    btn._text_label.grid_configure(padx=0, pady=0, sticky="nsew")

                self.lista_botoes.append(btn)

    def _ao_pressionar_botao(self, rotulo):
        """Encaminha o clique para o método específico."""
        if rotulo.isdigit():
            self._adicionar_digito(rotulo)
        elif rotulo == ".":
            self._adicionar_ponto()
        elif rotulo in ("+", "-", "×", "÷"):
            self._definir_operador(rotulo)
        elif rotulo == "=":
            self._calcular_resultado()
        elif rotulo == "AC":
            self._limpar_tudo()
        elif rotulo == "±":
            self._inverter_sinal()
        elif rotulo == "%":
            self._aplicar_porcentagem()
        elif rotulo == "⌫":
            self._apagar_ultimo()

    # -----------------------------------------------------------------
    # MÉTODOS DE MANIPULAÇÃO DE ENTRADA
    # -----------------------------------------------------------------
    def _adicionar_digito(self, digito):
        texto_atual = self.label_visor.cget("text")

        if self.aguardando_segundo_numero or texto_atual == "0" or texto_atual == "Indefinido":
            self.label_visor.configure(text=digito)
            self.aguardando_segundo_numero = False
        else:
            if len(texto_atual) < 12:  # Limite para não estourar o layout
                self.label_visor.configure(text=texto_atual + digito)

    def _adicionar_ponto(self):
        texto_atual = self.label_visor.cget("text")

        if self.aguardando_segundo_numero or texto_atual == "Indefinido":
            self.label_visor.configure(text="0.")
            self.aguardando_segundo_numero = False
            return

        if "." not in texto_atual:
            self.label_visor.configure(text=texto_atual + ".")

    def _definir_operador(self, operador):
        texto_atual = self.label_visor.cget("text")
        if texto_atual == "Indefinido":
            return

        # Se já havia um operador pendente e um novo número foi digitado, calcula o acumulado
        if self.primeiro_numero is not None and not self.aguardando_segundo_numero:
            self._calcular_resultado()
            texto_atual = self.label_visor.cget("text")

        try:
            self.primeiro_numero = float(texto_atual)
            self.operador_escolhido = operador
            self.aguardando_segundo_numero = True

            # Atualiza o visor secundário com o operando e o símbolo
            simbolo_tela = f"{self._formatar_numero(self.primeiro_numero)} {operador}"
            self.label_expressao.configure(text=simbolo_tela)
        except ValueError:
            self._limpar_tudo()

    # -----------------------------------------------------------------
    # LÓGICA DE CÁLCULO EXPLÍCITA (SEM eval())
    # -----------------------------------------------------------------
    def _calcular_resultado(self):
        """
        Executa o cálculo utilizando exclusivamente if / elif / else.
        Não utiliza a função eval(), garantindo segurança e clareza didática.
        """
        if self.operador_escolhido is None or self.primeiro_numero is None:
            return

        texto_atual = self.label_visor.cget("text")
        if texto_atual == "Indefinido":
            return

        try:
            self.segundo_numero = float(texto_atual)
        except ValueError:
            return

        resultado = 0.0

        # Estrutura condicional explícita para as 4 operações básicas
        if self.operador_escolhido == "+":
            resultado = self.primeiro_numero + self.segundo_numero

        elif self.operador_escolhido == "-":
            resultado = self.primeiro_numero - self.segundo_numero

        elif self.operador_escolhido in ("×", "*"):
            resultado = self.primeiro_numero * self.segundo_numero

        elif self.operador_escolhido in ("÷", "/"):
            # Tratamento de erro: Divisão por Zero
            if self.segundo_numero == 0:
                self.label_visor.configure(text="Indefinido")
                self.label_expressao.configure(
                    text=f"{self._formatar_numero(self.primeiro_numero)} ÷ 0 ="
                )
                self.primeiro_numero = None
                self.operador_escolhido = None
                self.aguardando_segundo_numero = True
                return
            else:
                resultado = self.primeiro_numero / self.segundo_numero
        else:
            resultado = self.segundo_numero

        # Atualiza a expressão no topo para auditoria visual
        expressao_completa = (
            f"{self._formatar_numero(self.primeiro_numero)} "
            f"{self.operador_escolhido} "
            f"{self._formatar_numero(self.segundo_numero)} ="
        )
        self.label_expressao.configure(text=expressao_completa)

        # Atualiza o visor principal com o resultado
        self.label_visor.configure(text=self._formatar_numero(resultado))

        # O resultado se torna o primeiro número para operações encadeadas
        self.primeiro_numero = resultado
        self.operador_escolhido = None
        self.aguardando_segundo_numero = True

    def _inverter_sinal(self):
        texto = self.label_visor.cget("text")
        if texto in ("0", "Indefinido"):
            return
        if texto.startswith("-"):
            self.label_visor.configure(text=texto[1:])
        else:
            self.label_visor.configure(text="-" + texto)

    def _aplicar_porcentagem(self):
        """
        Aplica o cálculo de porcentagem contextual sem eval(), utilizando if/elif/else:
        1. Isolado: Converte o número imediatamente em fração decimal (ex.: 50% -> 0.5).
        2. Soma (+) e Subtração (-): Acréscimo ou desconto percentual sobre o primeiro operando.
           Ex.: 200 + 15% -> converte os 15% em 30 (visor/expressão) e com '=' resulta em 230.
           Ex.: 200 - 15% -> converte os 15% em 30 (visor/expressão) e com '=' resulta em 170.
        3. Multiplicação (×, *) e Divisão (÷, /): Fator percentual direto.
           Ex.: 200 × 15% -> converte os 15% em 0.15 (visor/expressão) e com '=' resulta em 30.
           Ex.: 200 ÷ 50% -> converte os 50% em 0.5 (visor/expressão) e com '=' resulta em 400.
        """
        texto_atual = self.label_visor.cget("text")
        if texto_atual == "Indefinido":
            return

        try:
            valor = float(texto_atual)
        except ValueError:
            return

        # Caso 1: Valor percentual isolado (quando não há operador pendente)
        if self.operador_escolhido is None or self.primeiro_numero is None:
            resultado = valor / 100.0
            self.label_visor.configure(text=self._formatar_numero(resultado))
            self.label_expressao.configure(text=f"{self._formatar_numero(valor)}%")
            self.aguardando_segundo_numero = True

        # Caso 2: Acréscimo (+) ou Desconto (-) percentual sobre o primeiro operando
        elif self.operador_escolhido in ("+", "-"):
            valor_percentual = (self.primeiro_numero * valor) / 100.0
            self.label_visor.configure(text=self._formatar_numero(valor_percentual))
            self.label_expressao.configure(
                text=f"{self._formatar_numero(self.primeiro_numero)} {self.operador_escolhido} {self._formatar_numero(valor_percentual)}"
            )
            self.aguardando_segundo_numero = False

        # Caso 3: Multiplicação (×, *) ou Divisão (÷, /) com fator percentual direto
        elif self.operador_escolhido in ("×", "*", "÷", "/"):
            fator_percentual = valor / 100.0
            self.label_visor.configure(text=self._formatar_numero(fator_percentual))
            self.label_expressao.configure(
                text=f"{self._formatar_numero(self.primeiro_numero)} {self.operador_escolhido} {self._formatar_numero(fator_percentual)}"
            )
            self.aguardando_segundo_numero = False

    def _apagar_ultimo(self):
        texto = self.label_visor.cget("text")
        if texto == "Indefinido" or self.aguardando_segundo_numero:
            self.label_visor.configure(text="0")
            return
        if len(texto) > 1:
            self.label_visor.configure(text=texto[:-1])
        else:
            self.label_visor.configure(text="0")

    def _limpar_tudo(self):
        """Reinicia o estado da calculadora."""
        self.primeiro_numero = None
        self.operador_escolhido = None
        self.segundo_numero = None
        self.aguardando_segundo_numero = False
        self.label_visor.configure(text="0")
        self.label_expressao.configure(text="")

    def _formatar_numero(self, num):
        """Formata o número removendo decimais nulos e tratando números grandes."""
        if num is None:
            return "0"
        if num.is_integer():
            return str(int(num))
        texto = f"{num:.8f}".rstrip("0").rstrip(".")
        if len(texto) > 12:
            return f"{num:.4e}"
        return texto

    def _configurar_teclado(self):
        """Mapeia teclas do teclado físico aos comandos da calculadora."""
        def tratar_tecla(evento):
            char = evento.char
            tecla = evento.keysym

            if char in "0123456789":
                self._adicionar_digito(char)
            elif char in (".", ","):
                self._adicionar_ponto()
            elif char == "+":
                self._definir_operador("+")
            elif char == "-":
                self._definir_operador("-")
            elif char in ("*", "x", "X"):
                self._definir_operador("×")
            elif char == "/":
                self._definir_operador("÷")
            elif tecla in ("Return", "KP_Enter") or char == "=":
                self._calcular_resultado()
            elif tecla == "BackSpace":
                self._apagar_ultimo()
            elif tecla == "Escape" or char.lower() == "c":
                self._limpar_tudo()

        self.bind("<Key>", tratar_tecla)


if __name__ == "__main__":
    app = CalculadoraCopperBlack()
    app.mainloop()
\`;
