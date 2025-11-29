import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Campo = 'a' | 'x' | 'b';

interface ResultadoFuncao1Grau {
  y: number;
  raiz: number | null;
  eFuncao1Grau: boolean;
}

interface Eixo {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-funcao-1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funcao-1.page.html',
  styleUrls: ['./funcao-1.page.css'],
})
export class Funcao1Page {
  display: string = 'a · x + b';
  campoAtual: Campo = 'a';

  aValor: string = '';
  xValor: string = '';
  bValor: string = '';

  private readonly MAX_DIGITOS = 12;

  valores = {
    a: 0,
    b: 0,
    x: 0,
  };

  resultado: ResultadoFuncao1Grau | null = null;

  graphWidth = 320;
  graphHeight = 220;
  intervaloX = { min: -10, max: 10 };
  intervaloY = { min: -10, max: 10 };
  graphPath: string = '';
  eixoX: Eixo | null = null;
  eixoY: Eixo | null = null;

  gridXTicks = [-10, -5, 0, 5, 10];
  gridYTicks = [-10, -5, 0, 5, 10];

  selecionarCampo(campo: Campo): void {
    this.campoAtual = campo;
  }

  private getValorCampo(campo: Campo): string {
    if (campo === 'a') return this.aValor;
    if (campo === 'x') return this.xValor;
    return this.bValor;
  }

  private setValorCampo(campo: Campo, valor: string): void {
    if (campo === 'a') this.aValor = valor;
    else if (campo === 'x') this.xValor = valor;
    else this.bValor = valor;
  }

  private atualizarDisplay(): void {
    const aTxt = this.aValor !== '' ? this.aValor : 'a';
    const xTxt = this.xValor !== '' ? this.xValor : 'x';
    const bTxt = this.bValor !== '' ? this.bValor : 'b';
    this.display = `${aTxt} · ${xTxt} + ${bTxt}`;
  }

  adicionar(caractere: string): void {
    let atual = this.getValorCampo(this.campoAtual);

    if (caractere === '-') {
      if (atual.startsWith('-')) {
        atual = atual.slice(1);
      } else {
        atual = '-' + atual;
      }
      this.setValorCampo(this.campoAtual, atual);
      this.atualizarDisplay();
      return;
    }

    if (caractere === '.' && atual.includes('.')) {
      return;
    }

    const semSinal = atual.startsWith('-') ? atual.slice(1) : atual;
    if (semSinal.length >= this.MAX_DIGITOS) {
      return;
    }

    const novo = atual + caractere;
    this.setValorCampo(this.campoAtual, novo);
    this.atualizarDisplay();
  }

  apagarUltimo(): void {
    const atual = this.getValorCampo(this.campoAtual);
    const novo = atual.slice(0, -1);
    this.setValorCampo(this.campoAtual, novo);
    this.atualizarDisplay();
  }

  limpar(): void {
    this.aValor = '';
    this.xValor = '';
    this.bValor = '';
    this.resultado = null;
    this.graphPath = '';
    this.eixoX = null;
    this.eixoY = null;
    this.intervaloY = { min: -10, max: 10 };
    this.atualizarDisplay();
  }

  calcular(): void {
    const a = Number(this.aValor.replace(',', '.'));
    const x = Number(this.xValor.replace(',', '.'));
    const b = Number(this.bValor.replace(',', '.'));

    if (isNaN(a) || isNaN(b) || isNaN(x)) {
      alert('Preencha todos os valores (a, x e b) com números válidos.');
      return;
    }

    this.valores = { a, b, x };

    const y = a * x + b;

    if (a === 0) {
      this.resultado = {
        y,
        raiz: null,
        eFuncao1Grau: false,
      };
      this.atualizarGrafico(a, b);
      return;
    }

    const raiz = -b / a;

    this.resultado = {
      y,
      raiz,
      eFuncao1Grau: true,
    };

    this.atualizarGrafico(a, b);
  }

  toScreenX(x: number): number {
    const rangeX = this.intervaloX.max - this.intervaloX.min || 1;
    return ((x - this.intervaloX.min) / rangeX) * this.graphWidth;
  }

  toScreenY(y: number): number {
    const rangeY = this.intervaloY.max - this.intervaloY.min || 1;
    const normalized = (y - this.intervaloY.min) / rangeY;
    return this.graphHeight - normalized * this.graphHeight;
  }

  private atualizarGrafico(a: number, b: number): void {
    const pontosX: number[] = [];
    const pontosY: number[] = [];
    const passos = 40;
    const minX = this.intervaloX.min;
    const maxX = this.intervaloX.max;
    const rangeX = maxX - minX;

    for (let i = 0; i <= passos; i++) {
      const t = i / passos;
      const x = minX + rangeX * t;
      const y = a * x + b;
      pontosX.push(x);
      pontosY.push(y);
    }

    let minY = Math.min(...pontosY);
    let maxY = Math.max(...pontosY);

    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    const margem = (maxY - minY) * 0.1;
    this.intervaloY = {
      min: minY - margem,
      max: maxY + margem,
    };

    let d = '';
    for (let i = 0; i < pontosX.length; i++) {
      const sx = this.toScreenX(pontosX[i]);
      const sy = this.toScreenY(pontosY[i]);
      d += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`;
    }
    this.graphPath = d;

    if (this.intervaloY.min <= 0 && this.intervaloY.max >= 0) {
      const sy0 = this.toScreenY(0);
      this.eixoX = {
        x1: 0,
        y1: sy0,
        x2: this.graphWidth,
        y2: sy0,
      };
    } else {
      this.eixoX = null;
    }

    if (this.intervaloX.min <= 0 && this.intervaloX.max >= 0) {
      const sx0 = this.toScreenX(0);
      this.eixoY = {
        x1: sx0,
        y1: 0,
        x2: sx0,
        y2: this.graphHeight,
      };
    } else {
      this.eixoY = null;
    }
  }
}
