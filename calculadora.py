"""
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

        # Janela e contêiner com cantos arredondados
        self.title("Calculadora Industrial - Copper & Black")
        self.geometry("380x600")
        self.resizable(False, False)
        self.configure(fg_color=COR_FUNDO)

        # -------------------------------------------------------------
        # VARIÁVEIS DE ESTADO DO MOTOR DE CÁLCULO (SEM eval)
        # -------------------------------------------------------------
        self.primeiro_numero = None            # Armazena o primeiro número digitado
        self.operador_escolhido = None         # Armazena a operação (+, -, ×, ÷)
        self.segundo_numero = None             # Armazena o segundo número digitado
        self.aguardando_segundo_numero = False # Indica se o próximo dígito limpa o visor

        # Inicialização da interface e eventos de teclado
        self._construir_interface()
        self._configurar_teclado()

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
        self.container.pack(padx=16, pady=20, fill="both", expand=True)

        # 1. VISOR DE DADOS (Caixa escura embutida com cantos arredondados)
        self.frame_visor = ctk.CTkFrame(
            self.container,
            fg_color=COR_VISOR,
            corner_radius=18,
            border_width=1,
            border_color="#1E1E1E",
            height=110
        )
        self.frame_visor.pack(padx=16, pady=(16, 12), fill="x")
        self.frame_visor.pack_propagate(False)

        # Rótulo da expressão anterior (ex: "15 + 4")
        self.label_expressao = ctk.CTkLabel(
            self.frame_visor,
            text="",
            font=("JetBrains Mono", 13),
            text_color="#7A5540",
            anchor="e"
        )
        self.label_expressao.pack(padx=14, pady=(10, 0), fill="x")

        # Rótulo do valor principal em cobre luminoso
        self.label_visor = ctk.CTkLabel(
            self.frame_visor,
            text="0",
            font=("JetBrains Mono", 34, "bold"),
            text_color=COR_COBRE_RESULTADO,
            anchor="e"
        )
        self.label_visor.pack(padx=14, pady=(4, 10), fill="x")

        # 2. TECLADO DE BOTÕES CIRCULARES
        # Matriz de botões no layout clássico
        botoes = [
            [("AC", "acao"), ("±", "acao"), ("%", "acao"), ("÷", "operador")],
            [("7", "numero"), ("8", "numero"), ("9", "numero"), ("×", "operador")],
            [("4", "numero"), ("5", "numero"), ("6", "numero"), ("-", "operador")],
            [("1", "numero"), ("2", "numero"), ("3", "numero"), ("+", "operador")],
            [("0", "numero"), (".", "numero"), ("⌫", "acao"), ("=", "igual")]
        ]

        frame_grade = ctk.CTkFrame(self.container, fg_color="transparent")
        frame_grade.pack(padx=16, pady=8, fill="both", expand=True)

        for col in range(4):
            frame_grade.grid_columnconfigure(col, weight=1)

        tamanho_botao = 58
        raio_circular = tamanho_botao // 2  # Raio igual à metade garante formato estritamente redondo

        for linha_idx, linha in enumerate(botoes):
            for col_idx, (rotulo, tipo) in enumerate(linha):
                # Definição de cores conforme o tipo do botão
                if tipo in ("operador", "igual"):
                    cor_texto = COR_COBRE_OPERADOR
                    cor_borda = COR_BORDA_CINZA
                elif tipo == "acao":
                    cor_texto = "#A07050"
                    cor_borda = COR_BORDA_CINZA
                else:  # Dígito numérico
                    cor_texto = COR_COBRE_DIGITO
                    cor_borda = COR_BORDA_CINZA

                btn = ctk.CTkButton(
                    frame_grade,
                    text=rotulo,
                    width=tamanho_botao,
                    height=tamanho_botao,
                    corner_radius=raio_circular,      # Formato estritamente redondo (58x58px, raio=29)
                    fg_color=COR_BOTAO_FUNDO,
                    hover_color=COR_BOTAO_HOVER,
                    border_color=cor_borda,
                    border_width=2,                   # Borda cinza suave de 2px
                    text_color=cor_texto,
                    font=("JetBrains Mono", 18, "bold"),
                    command=lambda r=rotulo: self._ao_pressionar_botao(r)
                )
                btn.grid(row=linha_idx, column=col_idx, padx=6, pady=6)

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
        try:
            valor = float(self.label_visor.cget("text"))
            if self.primeiro_numero is not None:
                resultado = (self.primeiro_numero * valor) / 100.0
            else:
                resultado = valor / 100.0
            self.label_visor.configure(text=self._formatar_numero(resultado))
        except ValueError:
            pass

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
