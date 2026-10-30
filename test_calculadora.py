"""
Bateria de Testes Automatizados para a Calculadora Industrial (Copper & Black)
Desafio 2 da Alura - Validação de Regressão e Nova Lógica de Porcentagem Contextual

Testes contemplados:
1. Operações Aritméticas Básicas (+, -, ×, ÷) com inteiros e ponto flutuante.
2. Tratamento gracioso de Divisão por Zero ("Indefinido").
3. Porcentagem Contextual (%):
   - Valor isolado (ex: 50% -> 0.5)
   - Acréscimo e Desconto com Adição e Subtração (ex: 200 + 15% = 230; 200 - 15% = 170)
   - Fator Direto com Multiplicação e Divisão (ex: 200 × 15% = 30; 200 ÷ 50% = 400)
4. Funções Especiais de Controle (AC, ±, ⌫, Encadeamento).
"""

import unittest
from calculadora import CalculadoraCopperBlack


class TestCalculadoraBase(unittest.TestCase):
    """Classe base que gerencia a instância da Calculadora em modo headless."""

    def setUp(self):
        self.app = CalculadoraCopperBlack()
        self.app.withdraw()  # Oculta a janela gráfica durante os testes

    def tearDown(self):
        try:
            # Cancela agendamentos pendentes internos do customtkinter
            for timer_id in self.app.tk.eval("after info").split():
                try:
                    self.app.after_cancel(timer_id)
                except Exception:
                    pass
            self.app.destroy()
        except Exception:
            pass

    def digitar(self, sequencia: str):
        """Simula a digitação de números ou símbolos caracter por caracter."""
        for char in sequencia:
            self.app._ao_pressionar_botao(char)

    def pressionar(self, botao: str):
        """Simula o clique em um botão específico."""
        self.app._ao_pressionar_botao(botao)

    def obter_visor(self) -> str:
        """Retorna o valor atual exibido no visor principal."""
        return self.app.label_visor.cget("text")

    def obter_expressao(self) -> str:
        """Retorna a expressão exibida no visor secundário de auditoria."""
        return self.app.label_expressao.cget("text")


class TestOperacoesBasicas(TestCalculadoraBase):
    """Valida as 4 operações aritméticas fundamentais."""

    def test_adicao_inteiros(self):
        self.digitar("15")
        self.pressionar("+")
        self.digitar("25")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "40")
        self.assertEqual(self.obter_expressao(), "15 + 25 =")

    def test_adicao_decimais(self):
        self.digitar("15.5")
        self.pressionar("+")
        self.digitar("24.5")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "40")

    def test_subtracao_inteiros(self):
        self.digitar("100")
        self.pressionar("-")
        self.digitar("35")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "65")
        self.assertEqual(self.obter_expressao(), "100 - 35 =")

    def test_subtracao_decimais(self):
        self.digitar("100")
        self.pressionar("-")
        self.digitar("35.75")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "64.25")

    def test_multiplicacao(self):
        self.digitar("12.5")
        self.pressionar("×")
        self.digitar("8")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "100")
        self.assertEqual(self.obter_expressao(), "12.5 × 8 =")

    def test_divisao_exata(self):
        self.digitar("10")
        self.pressionar("÷")
        self.digitar("4")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "2.5")
        self.assertEqual(self.obter_expressao(), "10 ÷ 4 =")

    def test_divisao_periodica(self):
        self.digitar("1")
        self.pressionar("÷")
        self.digitar("3")
        self.pressionar("=")
        self.assertTrue(self.obter_visor().startswith("0.333333"))

    def test_operacoes_encadeadas(self):
        # 10 + 5 + 2 = 17
        self.digitar("10")
        self.pressionar("+")
        self.digitar("5")
        self.pressionar("+")  # Calcula o acumulado parcial 15
        self.assertEqual(self.obter_visor(), "15")
        self.digitar("2")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "17")


class TestDivisaoPorZero(TestCalculadoraBase):
    """Valida o tratamento gracioso contra erro de divisão por zero."""

    def test_divisao_por_zero(self):
        self.digitar("50")
        self.pressionar("÷")
        self.digitar("0")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "Indefinido")
        self.assertIn("50 ÷ 0 =", self.obter_expressao())

    def test_recuperacao_apos_divisao_por_zero(self):
        self.digitar("50")
        self.pressionar("÷")
        self.digitar("0")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "Indefinido")

        # Ao digitar um novo número, o estado deve reiniciar sem falhas
        self.digitar("8")
        self.assertEqual(self.obter_visor(), "8")
        self.pressionar("+")
        self.digitar("2")
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "10")


class TestPorcentagemContextual(TestCalculadoraBase):
    """Valida a nova funcionalidade de porcentagem contextual nos 3 cenários."""

    def test_cenario_1_porcentagem_isolada(self):
        # Exemplo: 50 % -> 0.5
        self.digitar("50")
        self.pressionar("%")
        self.assertEqual(self.obter_visor(), "0.5")
        self.assertEqual(self.obter_expressao(), "50%")

    def test_cenario_2_acrescimo_soma(self):
        # Exemplo: 200 + 15 % -> converte 15% em 30 e com '=' resulta em 230
        self.digitar("200")
        self.pressionar("+")
        self.digitar("15")
        self.pressionar("%")

        # No acionamento da tecla %, o visor exibe o valor percentual (15% de 200 = 30)
        self.assertEqual(self.obter_visor(), "30")
        self.assertEqual(self.obter_expressao(), "200 + 30")

        # Ao pressionar '=', calcula a soma final: 200 + 30 = 230
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "230")
        self.assertEqual(self.obter_expressao(), "200 + 30 =")

    def test_cenario_2_desconto_subtracao(self):
        # Exemplo: 200 - 15 % -> converte 15% em 30 e com '=' resulta em 170
        self.digitar("200")
        self.pressionar("-")
        self.digitar("15")
        self.pressionar("%")

        # No acionamento da tecla %, o visor exibe o valor percentual (15% de 200 = 30)
        self.assertEqual(self.obter_visor(), "30")
        self.assertEqual(self.obter_expressao(), "200 - 30")

        # Ao pressionar '=', calcula a subtração final: 200 - 30 = 170
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "170")
        self.assertEqual(self.obter_expressao(), "200 - 30 =")

    def test_cenario_3_multiplicacao_fator_direto(self):
        # Exemplo: 200 × 15 % -> converte 15% em 0.15 e com '=' resulta em 30
        self.digitar("200")
        self.pressionar("×")
        self.digitar("15")
        self.pressionar("%")

        # No acionamento da tecla %, o visor exibe o fator percentual direto (0.15)
        self.assertEqual(self.obter_visor(), "0.15")
        self.assertEqual(self.obter_expressao(), "200 × 0.15")

        # Ao pressionar '=', calcula 200 × 0.15 = 30
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "30")
        self.assertEqual(self.obter_expressao(), "200 × 0.15 =")

    def test_cenario_3_divisao_fator_direto(self):
        # Exemplo: 200 ÷ 50 % -> converte 50% em 0.5 e com '=' resulta em 400
        self.digitar("200")
        self.pressionar("÷")
        self.digitar("50")
        self.pressionar("%")

        # No acionamento da tecla %, o visor exibe o fator percentual direto (0.5)
        self.assertEqual(self.obter_visor(), "0.5")
        self.assertEqual(self.obter_expressao(), "200 ÷ 0.5")

        # Ao pressionar '=', calcula 200 ÷ 0.5 = 400
        self.pressionar("=")
        self.assertEqual(self.obter_visor(), "400")
        self.assertEqual(self.obter_expressao(), "200 ÷ 0.5 =")


class TestFuncoesEspeciais(TestCalculadoraBase):
    """Valida botões auxiliares (AC, ±, ⌫)."""

    def test_limpar_tudo_ac(self):
        self.digitar("123")
        self.pressionar("+")
        self.digitar("45")
        self.pressionar("AC")
        self.assertEqual(self.obter_visor(), "0")
        self.assertEqual(self.obter_expressao(), "")

    def test_inverter_sinal(self):
        self.digitar("42")
        self.pressionar("±")
        self.assertEqual(self.obter_visor(), "-42")
        self.pressionar("±")
        self.assertEqual(self.obter_visor(), "42")

    def test_apagar_ultimo(self):
        self.digitar("1234")
        self.pressionar("⌫")
        self.assertEqual(self.obter_visor(), "123")
        self.pressionar("⌫")
        self.assertEqual(self.obter_visor(), "12")


if __name__ == "__main__":
    unittest.main(verbosity=2)
