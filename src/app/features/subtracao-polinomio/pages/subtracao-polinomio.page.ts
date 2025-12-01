import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DisplayComponent } from '../../../shared/components/display/display.component';

const EPSILON = 1e-10;

type Campo = 'p1' | 'p2';

@Component({
  selector: 'app-subtracao-polinomios',
  templateUrl: './subtracao-polinomio.page.html',
  styleUrls: ['./subtracao-polinomio.page.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DisplayComponent]
})
export class SubtracaoPolinomioPage {
  p1Str: string = '';
  p2Str: string = '';
  campoAtual: Campo = 'p1';
  resultado: string = '';

  private readonly MAX_LENGTH = 50;

  selecionarCampo(campo: Campo): void {
    this.campoAtual = campo;
  }

  getValorCampo(campo: Campo): string {
    return campo === 'p1' ? this.p1Str : this.p2Str;
  }

  private setValorCampo(campo: Campo, valor: string): void {
    if (campo === 'p1') this.p1Str = valor;
    else this.p2Str = valor;
  }

  adicionar(caractere: string): void {
    let atual = this.getValorCampo(this.campoAtual);

    if (atual.length >= this.MAX_LENGTH) return;

    if (['+', '-'].includes(caractere)) {

      if (['+', '-', '*', '^'].includes(atual.slice(-1))) {
        atual = atual.slice(0, -1);
      }

      if (atual.length > 0 && caractere === '+') {
        atual += ' + ';
      } else if (atual.length > 0 && caractere === '-') {
        if (!['+', '-', '*', '^'].includes(atual.slice(-1))) {
          atual += ' - ';
        } else {
          atual += '-';
        }
      } else {
        atual += caractere;
      }

    } else if (['*', '^', '.'].includes(caractere)) {
      if (['*', '^', '.'].includes(atual.slice(-1))) return;
      atual += caractere;

    } else {
      atual += caractere;
    }

    this.setValorCampo(this.campoAtual, atual);
  }

  apagarUltimo(): void {
    const atual = this.getValorCampo(this.campoAtual).trim();
    let novo = atual.slice(0, -1);

    if (novo.endsWith(' + ') || novo.endsWith(' - ')) {
      novo = novo.slice(0, -3);
    } else if (novo.endsWith('+') || novo.endsWith('-')) {
      novo = novo.slice(0, -1);
    }

    this.setValorCampo(this.campoAtual, novo.trim());
  }

  limpar(): void {
    this.p1Str = '';
    this.p2Str = '';
    this.resultado = '';
    this.campoAtual = 'p1';
  }

  subtrair() {
    if (!this.p1Str || !this.p2Str) {
      this.resultado = 'Erro: Preencha os dois polinômios.';
      return;
    }

    try {
      // 1. Parsear as strings para objetos de coeficiente/grau
      const p1 = this.parsePoly(this.p1Str);
      const p2 = this.parsePoly(this.p2Str);

      // 2. Realizar a subtração
      const res = this.realizarSubtracao(p1, p2);
      
      // 3. Formatar o resultado para string
      this.resultado = this.polyToString(res);

    } catch (e) {
      this.resultado = 'Erro: formato de polinômio inválido.';
      console.error("Erro no cálculo da subtração:", e);
    }
  }

  // ================================================
  // === LÓGICA DE SUBTRAÇÃO ========================
  // ================================================

  /**
   * Subtrai o Polinômio P2 de P1 (P1 - P2).
   * @param p1 Polinômio 1 (Grau: Coeficiente)
   * @param p2 Polinômio 2 (Grau: Coeficiente)
   * @returns O polinômio resultado (Grau: Coeficiente)
   */
  realizarSubtracao(
    p1: Record<number, number>,
    p2: Record<number, number>
  ): Record<number, number> {
      
    let resultado: Record<number, number> = {};

    // Combina todos os graus existentes em P1 e P2
    const graus = new Set([
      ...Object.keys(p1).map(Number),
      ...Object.keys(p2).map(Number)
    ]);

    graus.forEach(grau => {
      // Coeficiente de P1 ou 0 se não existir
      const a = p1[grau] || 0;
      // Coeficiente de P2 ou 0 se não existir
      const b = p2[grau] || 0;

      // O coração da lógica: Subtração
      resultado[grau] = a - b;
    });

    return resultado;
  }

  // ================================================
  // === PARSE E FORMATAR STRING (UTILITY) ==========
  // ================================================

  /**
   * Converte a string de um polinômio em um objeto {grau: coeficiente}.
   * Otimizado para robustez.
   */
  parsePoly(poly: string): Record<number, number> {
    // A única alteração aqui é que o * é removido no parser
    poly = poly.replace(/\s/g, '').replace(/\*/g, ''); 
    
    // Substitui '-' por '+-' para poder usar split('+') e isolar termos.
    poly = poly.replace(/-/g, "+-");

    // Lida com o caso de começar com coeficiente negativo ou positivo.
    if (poly.startsWith("+-")) poly = "-" + poly.substring(2);
    else if (poly.startsWith("+")) poly = poly.substring(1);

    let termos = poly.split("+").filter(t => t.trim() !== "");

    let obj: Record<number, number> = {};

    termos.forEach(t => {
      if (t === "") return;

      let coef: number;
      let grau: number;

      if (t.includes('x')) {
        // Lida com termos com expoente (e.g., -5x^3, x^2)
        let powerMatch = t.match(/([+-]?\d*\.?\d*)x\^(\d+)/);
        if (powerMatch) {
          grau = Number(powerMatch[2]);
          let coefStr = powerMatch[1];
          if (coefStr === '') coef = 1;
          else if (coefStr === '-') coef = -1;
          else if (coefStr === '+') coef = 1;
          else coef = Number(coefStr);

        } else {
          // Lida com termos lineares (e.g., 3x, -x)
          let linearMatch = t.match(/([+-]?\d*\.?\d*)x/);
          if (!linearMatch) return;
          grau = 1;
          let coefStr = linearMatch[1];
          if (coefStr === '') coef = 1;
          else if (coefStr === '-') coef = -1;
          else coef = Number(coefStr);
        }

      } else {
        // Lida com termos constantes (grau 0)
        grau = 0;
        coef = Number(t);
      }

      // Soma coeficientes para o mesmo grau
      obj[grau] = (obj[grau] || 0) + coef;
    });

    return obj;
  }

  /**
   * Converte o objeto {grau: coeficiente} do polinômio em uma string formatada.
   */
  polyToString(poly: Record<number, number>): string {
    let termos: string[] = [];

    // Filtra graus com coeficiente > EPSILON e ordena do maior para o menor grau
    let graus = Object.keys(poly)
      .map(Number)
      .filter(g => Math.abs(poly[g]) > EPSILON)
      .sort((a, b) => b - a);

    if (graus.length === 0) return "0";

    graus.forEach((g, index) => {
      let c = poly[g];
      let valor = Math.abs(c);
      // Arredonda para 4 casas decimais para evitar notação científica em números pequenos
      const val = Math.round(valor * 10000) / 10000;

      // Define o sinal: vazio para o primeiro termo positivo, ' - ' ou ' + ' para os seguintes
      let sinal = index === 0 ? (c < 0 ? "-" : "") : (c < 0 ? " - " : " + ");

      let termo = "";

      if (g === 0) {
        // Termo constante
        termo = sinal + val;
      } else if (g === 1) {
        // Termo linear (x^1)
        termo = sinal + (val === 1 ? "" : val) + "x";
      } else {
        // Termo com expoente (x^n)
        termo = sinal + (val === 1 ? "" : val) + "x^" + g;
      }
      
      termos.push(termo.trim());
    });

    let res = termos.join("");
    // Remove o sinal '+' inicial se houver, garantindo um resultado limpo
    return res.replace(/^\+/, "").trim();
  }
}