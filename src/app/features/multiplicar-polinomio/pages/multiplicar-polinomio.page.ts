import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

const EPSILON = 1e-10;

type Campo = 'p1' | 'p2';

@Component({
  selector: 'app-multiplicar-polinomios',
  templateUrl: './multiplicar-polinomio.page.html',
  styleUrls: ['./multiplicar-polinomio.page.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class MultiplicarPolinomiosPage {
  p1Str: string = '';
  p2Str: string = '';
  campoAtual: Campo = 'p1';
  resultado: string = '';

  // === LÓGICA DO CÁLCULO ===
  private readonly MAX_LENGTH = 50;

  selecionarCampo(campo: Campo): void {
    this.campoAtual = campo;
  }

  // Obtém o valor do campo selecionado
  getValorCampo(campo: Campo): string {
    return campo === 'p1' ? this.p1Str : this.p2Str;
  }

  // Define o valor do campo selecionado
  private setValorCampo(campo: Campo, valor: string): void {
    if (campo === 'p1') this.p1Str = valor;
    else this.p2Str = valor;
  }

  adicionar(caractere: string): void {
    let atual = this.getValorCampo(this.campoAtual);

    if (atual.length >= this.MAX_LENGTH) return;

    // Lógica para garantir sintaxe limpa
    if (['+', '-'].includes(caractere)) {
      // Evita múltiplos operadores seguidos no final (ex: x++ ou x+-)
      if (['+', '-', '*', '^'].includes(atual.slice(-1))) {
        // Substitui o último caractere pelo novo operador
        atual = atual.slice(0, -1); 
      }
      // Adiciona espaço antes do + ou - se não estiver no início, para facilitar a leitura.
      if (atual.length > 0 && caractere === '+') {
         atual += ' + ';
      } else if (atual.length > 0 && caractere === '-') {
         // Adiciona espaço antes do - apenas se o último não for um operador (para não quebrar a notação do número negativo)
         if (!['+', '-', '*', '^'].includes(atual.slice(-1))) {
           atual += ' - ';
         } else {
           atual += '-';
         }
      } else {
        atual += caractere;
      }

    } else if (['*', '^', '.'].includes(caractere)) {
       // Evita múltiplos operadores seguidos (ex: x**)
      if (['*', '^', '.'].includes(atual.slice(-1))) {
        return; 
      }
      atual += caractere;

    } else {
      // Números e 'x'
      atual += caractere;
    }

    this.setValorCampo(this.campoAtual, atual);
  }

  apagarUltimo(): void {
    const atual = this.getValorCampo(this.campoAtual).trim();
    let novo = atual.slice(0, -1);
    
    // Se apagar um espaço de um operador, apaga o operador também (ex: ' + ' vira vazio)
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

  multiplicar() {
    if (!this.p1Str || !this.p2Str) {
      this.resultado = 'Erro: Preencha os dois polinômios.';
      return;
    }

    try {
      const p1 = this.parsePoly(this.p1Str);
      const p2 = this.parsePoly(this.p2Str);

      const res = this.realizarMultiplicacao(p1, p2);
      this.resultado = this.polyToString(res);

    } catch (e) {
      this.resultado = 'Erro: formato inválido.';
      console.error("Erro no cálculo:", e);
    }
  }

  // ====================================================================
  // === LÓGICA MATEMÁTICA DE MULTIPLICAÇÃO =============================
  // ====================================================================

  realizarMultiplicacao(p1: Record<number, number>, p2: Record<number, number>): Record<number, number> {
    let resultado: Record<number, number> = {};

    // Itera sobre cada termo do primeiro polinômio
    for (const g1 in p1) {
      const grau1 = Number(g1);
      const coef1 = p1[grau1];

      // Itera sobre cada termo do segundo polinômio
      for (const g2 in p2) {
        const grau2 = Number(g2);
        const coef2 = p2[grau2];

        // Regra da multiplicação: (a*x^n) * (b*x^m) = (a*b) * x^(n+m)
        const novoGrau = grau1 + grau2;
        const novoCoef = coef1 * coef2;

        // Soma o novo coeficiente ao grau correspondente no resultado
        resultado[novoGrau] = (resultado[novoGrau] || 0) + novoCoef;
      }
    }

    return resultado;
  }
  
  // === FUNÇÕES DE UTILIDADE (PARSING E TOSTRING) ===

  // Polinômio é um Record<grau, coeficiente>
  parsePoly(poly: string): Record<number, number> {
    poly = poly.replace(/\s/g, ''); // Remove todos os espaços
    poly = poly.replace(/\*/g, ''); // Remove *
    
    // Normaliza sinais para o split
    poly = poly.replace(/-/g, "+-");
    
    if (poly.startsWith("+-")) poly = "-" + poly.substring(2);
    else if (poly.startsWith("+")) poly = poly.substring(1);

    let termos = poly.split("+").filter(t => t.trim() !== "");

    let obj: Record<number, number> = {};

    termos.forEach(t => {
      if (t === "") return;

      let coef: number;
      let grau: number;

      // Novo regex para lidar com coeficientes implícitos em x e x^n
      if (t.includes('x')) {
        // Tenta encontrar x^n (n>1)
        let powerMatch = t.match(/([+-]?\d*\.?\d*)x\^(\d+)/);
        if (powerMatch) {
          grau = Number(powerMatch[2]);
          let coefStr = powerMatch[1];
          // Trata coeficientes implícitos (e.g., 'x^2' ou '-x^2')
          if (coefStr === '') coef = 1;
          else if (coefStr === '-') coef = -1;
          else if (coefStr === '+') coef = 1; // Deve ser removido pelo replace inicial, mas por segurança
          else coef = Number(coefStr);
        } else {
          // Tenta encontrar x^1 (e.g., 'x' ou '-x' ou '5x')
          let linearMatch = t.match(/([+-]?\d*\.?\d*)x/);
          if (!linearMatch) return;
          grau = 1;
          let coefStr = linearMatch[1];
          // Trata coeficientes implícitos (e.g., 'x' ou '-x')
          if (coefStr === '') coef = 1;
          else if (coefStr === '-') coef = -1;
          else if (coefStr === '+') coef = 1;
          else coef = Number(coefStr);
        }
      } else {
        // Constante
        grau = 0;
        coef = Number(t);
      }
      
      obj[grau] = (obj[grau] || 0) + coef;
    });

    return obj;
  }

  polyToString(poly: Record<number, number>): string {
    let termos: string[] = [];
    let graus = Object.keys(poly)
      .map(Number)
      .filter(g => Math.abs(poly[g]) > EPSILON) 
      .sort((a,b) => b-a);

    if (graus.length === 0) return '0';

    graus.forEach((g, index) => {
      let c = poly[g];
      let sinal: string;
      let valor = Math.abs(c);
      
      const valorFormatado = Math.round(valor * 10000) / 10000; // Arredonda para 4 casas

      if (index === 0) {
        sinal = c > 0 ? '' : '-';
      } else {
        sinal = c > 0 ? ' + ' : ' - ';
      }

      let termo = '';
      if (g === 0) {
        termo = sinal + valorFormatado;
      } else if (g === 1) {
        let coefStr = valorFormatado === 1 ? '' : String(valorFormatado);
        termo = sinal + coefStr + 'x';
      } else {
        let coefStr = valorFormatado === 1 ? '' : String(valorFormatado);
        termo = sinal + coefStr + 'x^' + g;
      }
      
      termos.push(termo.trim());
    });

    let res = termos.join("");
    return res.replace(/^\s*\+\s*/, "").trim();
  }
}