import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DisplayComponent } from '../../../shared/components/display/display.component';

const EPSILON = 1e-10;

type Campo = 'p1' | 'p2';

@Component({
  selector: 'app-soma-polinomios',
  templateUrl: './soma-polinomio.page.html',
  styleUrls: ['./soma-polinomio.page.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DisplayComponent]
})
export class SomaPolinomioPage {
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

  // ================================================
  // === SOMAR ======================================
  // ================================================
  somar() {
    if (!this.p1Str || !this.p2Str) {
      this.resultado = 'Erro: Preencha os dois polinômios.';
      return;
    }

    try {
      const p1 = this.parsePoly(this.p1Str);
      const p2 = this.parsePoly(this.p2Str);

      const res = this.realizarAdicao(p1, p2);
      this.resultado = this.polyToString(res);

    } catch (e) {
      this.resultado = 'Erro: formato inválido.';
      console.error("Erro no cálculo:", e);
    }
  }

  // ================================================
  // === LÓGICA DE ADIÇÃO =============================
  // ================================================
  realizarAdicao(
    p1: Record<number, number>,
    p2: Record<number, number>
  ): Record<number, number> {
      
    let resultado: Record<number, number> = {};

    const graus = new Set([
      ...Object.keys(p1).map(Number),
      ...Object.keys(p2).map(Number)
    ]);

    graus.forEach(grau => {
      const a = p1[grau] || 0;
      const b = p2[grau] || 0;
      resultado[grau] = a + b;
    });

    return resultado;
  }

  // ================================================
  // === PARSE E FORMATAR STRING =====================
  // ================================================
  parsePoly(poly: string): Record<number, number> {
    poly = poly.replace(/\s/g, '');
    poly = poly.replace(/\*/g, '');

    poly = poly.replace(/-/g, "+-");

    if (poly.startsWith("+-")) poly = "-" + poly.substring(2);
    else if (poly.startsWith("+")) poly = poly.substring(1);

    let termos = poly.split("+").filter(t => t.trim() !== "");

    let obj: Record<number, number> = {};

    termos.forEach(t => {
      if (t === "") return;

      let coef: number;
      let grau: number;

      if (t.includes('x')) {

        let powerMatch = t.match(/([+-]?\d*\.?\d*)x\^(\d+)/);
        if (powerMatch) {
          grau = Number(powerMatch[2]);
          let coefStr = powerMatch[1];
          if (coefStr === '') coef = 1;
          else if (coefStr === '-') coef = -1;
          else if (coefStr === '+') coef = 1;
          else coef = Number(coefStr);

        } else {
          let linearMatch = t.match(/([+-]?\d*\.?\d*)x/);
          if (!linearMatch) return;
          grau = 1;
          let coefStr = linearMatch[1];
          if (coefStr === '') coef = 1;
          else if (coefStr === '-') coef = -1;
          else coef = Number(coefStr);
        }

      } else {
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
      .sort((a, b) => b - a);

    if (graus.length === 0) return "0";

    graus.forEach((g, index) => {
      let c = poly[g];
      let valor = Math.abs(c);
      const val = Math.round(valor * 10000) / 10000;

      let sinal = index === 0 ? (c < 0 ? "-" : "") : (c < 0 ? " - " : " + ");

      let termo = "";

      if (g === 0) termo = sinal + val;
      else if (g === 1) termo = sinal + (val === 1 ? "" : val) + "x";
      else termo = sinal + (val === 1 ? "" : val) + "x^" + g;

      termos.push(termo.trim());
    });

    let res = termos.join("");
    return res.replace(/^\+/, "").trim();
  }
}
