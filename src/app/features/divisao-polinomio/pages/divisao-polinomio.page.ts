import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DisplayComponent } from '../../../shared/components/display/display.component';

const EPSILON = 1e-10;

type Campo = 'dividendo' | 'divisor';

@Component({
  selector: 'app-divisao-polinomios',
  templateUrl: './divisao-polinomio.page.html',
  styleUrls: ['./divisao-polinomio.page.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DisplayComponent]
})
export class DivisaoPolinomiosPage {

  dividendoStr: string = '';
  divisorStr: string = '';
  campoAtual: Campo = 'dividendo';
  resultado: { quociente: string, resto: string } | null = null;

  private readonly MAX_LENGTH = 50;

  selecionarCampo(campo: Campo): void {
    this.campoAtual = campo;
  }

  getValorCampo(campo: Campo): string {
    return campo === 'dividendo' ? this.dividendoStr : this.divisorStr;
  }

  private setValorCampo(campo: Campo, valor: string): void {
    if (campo === 'dividendo') this.dividendoStr = valor;
    else this.divisorStr = valor;
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
      if (['*', '^', '.'].includes(atual.slice(-1))) {
        return; 
      }
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
    this.dividendoStr = '';
    this.divisorStr = '';
    this.resultado = null;
    this.campoAtual = 'dividendo';
  }

  dividir() {
    if (!this.dividendoStr || !this.divisorStr) {
      this.resultado = {
        quociente: 'Erro: Preencha Dividendo e Divisor.',
        resto: '',
      };
      return;
    }

    try {
      const parsedDividendo = this.parsePoly(this.dividendoStr);
      const parsedDivisor = this.parsePoly(this.divisorStr);

      const res = this.realizarDivisao(parsedDividendo, parsedDivisor);

      this.resultado = {
        quociente: this.polyToString(res.quociente),
        resto: this.polyToString(res.resto),
      };
    } catch (e) {
      this.resultado = {
        quociente: 'Erro na entrada ou divisão impossível (divisão por zero ou formato inválido).',
        resto: '',
      };
      console.error("Erro no cálculo:", e);
    }
  }

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
          if (coefStr === '' || coefStr === '+') coef = 1;
          else if (coefStr === '-') coef = -1;
          else coef = Number(coefStr);
        } else {
          let linearMatch = t.match(/([+-]?\d*\.?\d*)x/);
          if (!linearMatch) return;
          grau = 1;
          let coefStr = linearMatch[1];
          if (coefStr === '' || coefStr === '+') coef = 1;
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
      .sort((a,b) => b-a);

    if (graus.length === 0) return '0';

    graus.forEach((g, index) => {
      let c = poly[g];
      let sinal: string;
      let valor = Math.abs(c);
      
      const valorFormatado = Math.round(valor * 10000) / 10000;

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

  realizarDivisao(dividendo: Record<number, number>, divisor: Record<number, number>) {
    let quociente: Record<number, number> = {};
    let resto = { ...dividendo };

    const todosGrausDivisor = Object.keys(divisor).map(Number).filter(g => Math.abs(divisor[g]) > EPSILON);
    if (todosGrausDivisor.length === 0) {
        throw new Error('Divisor inválido (igual a zero)');
    }
    const grauDivisor = Math.max(...todosGrausDivisor);
    const coefDivisor = divisor[grauDivisor];

    let getGrauResto = () => Math.max(
        ...Object.keys(resto)
            .map(Number)
            .filter(k => Math.abs(resto[k]) > EPSILON)
    );

    let grauResto = getGrauResto();

    while (grauResto >= grauDivisor) {
      const grauNovo = grauResto - grauDivisor;
      const coefNovo = resto[grauResto] / coefDivisor;

      quociente[grauNovo] = (quociente[grauNovo] || 0) + coefNovo;

      for (let g in divisor) {
        const gNum = Number(g);
        const grauAtual = gNum + grauNovo;
        
        resto[grauAtual] = (resto[grauAtual] || 0) - divisor[gNum] * coefNovo;
      }

      grauResto = getGrauResto();
      
      if (grauResto === -Infinity) break;
    }

    return { quociente, resto };
  }
}