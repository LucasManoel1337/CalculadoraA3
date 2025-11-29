import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Campo = 'a' | 'x' | 'b' | 'c';

interface ResultadoFuncao2Grau {
  y: number;
  delta: number | null;
  raiz1: number | null;
  raiz2: number | null;
  temRaizesReais: boolean;
  descricaoRaizes: string;
  eFuncao2Grau: boolean;
}

interface Eixo {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-funcao-2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funcao-2.page.html',
  styleUrls: ['./funcao-2.page.css'],
})
export class Funcao2Page {
  display: string = 'a · x² + b · x + c';
  campoAtual: Campo = 'a';

  aValor: string = '';
  xValor: string = '';
  bValor: string = '';
  cValor: string = '';

  private readonly MAX_DIGITOS = 12;

  valores = {
    a: 0,
    b: 0,
    c: 0,
    x: 0,
  };

  resultado: ResultadoFuncao2Grau | null = null;

  graphWidth = 320;
  graphHeight = 220;
  intervaloX = { min: -10, max: 10 };
  intervaloY = { min: -10, max: 10 };
  graphPath: string = '';
  eixoX: Eixo | null = null;
  eixoY: Eixo | null = null;

  selecionarCampo(campo: Campo): void {
    this.campoAtual = campo;
  }

  private getValorCampo(campo: Campo): string {
    if (campo === 'a') return this.aValor;
    if (campo === 'x') return this.xValor;
    if (campo === 'b') return this.bValor;
    return this.cValor;
  }

  private setValorCampo(campo: Campo, valor: string): void {
    if (campo === 'a') this.aValor = valor;
    else if (campo === 'x') this.xValor = valor;
    else if (campo === 'b') this.bValor = valor;
    else this.cValor = valor;
  }

  private atualizarDisplay(): void {
    const aTxt = this.aValor !== '' ? this.aValor : 'a';
    const bTxt = this.bValor !== '' ? this.bValor : 'b';
    const cTxt = this.cValor !== '' ? this.cValor : 'c';
    this.display = `${aTxt} · x² + ${bTxt} · x + ${cTxt}`;
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
    this.cValor = '';
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
    const c = Number(this.cValor.replace(',', '.'));

    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(x)) {
      alert('Preencha todos os valores (a, b, c e x) com números válidos.');
      return;
    }

    this.valores = { a, b, c, x };

    const y = a * x * x + b * x + c;

    if (a === 0) {
      this.resultado = {
        y,
        delta: null,
        raiz1: null,
        raiz2: null,
        temRaizesReais: false,
        descricaoRaizes:
          'Como a = 0, a função não é de 2º grau (é de 1º grau ou constante).',
        eFuncao2Grau: false,
      };
      this.atualizarGrafico(a, b, c);
      return;
    }

    const delta = b * b - 4 * a * c;
    let raiz1: number | null = null;
    let raiz2: number | null = null;
    let temRaizesReais = false;
    let descricaoRaizes = '';

    if (delta < 0) {
      temRaizesReais = false;
      descricaoRaizes = 'Δ < 0 ⇒ a função não possui raízes reais.';
    } else if (delta === 0) {
      temRaizesReais = true;
      raiz1 = raiz2 = -b / (2 * a);
      descricaoRaizes = 'Δ = 0 ⇒ a função possui uma raiz real dupla.';
    } else {
      temRaizesReais = true;
      const raizDelta = Math.sqrt(delta);
      raiz1 = (-b + raizDelta) / (2 * a);
      raiz2 = (-b - raizDelta) / (2 * a);
      descricaoRaizes = 'Δ > 0 ⇒ a função possui duas raízes reais distintas.';
    }

    this.resultado = {
      y,
      delta,
      raiz1,
      raiz2,
      temRaizesReais,
      descricaoRaizes,
      eFuncao2Grau: true,
    };

    this.atualizarGrafico(a, b, c);
  }

  private toScreenX(x: number): number {
    const rangeX = this.intervaloX.max - this.intervaloX.min || 1;
    return ((x - this.intervaloX.min) / rangeX) * this.graphWidth;
  }

  private toScreenY(y: number): number {
    const rangeY = this.intervaloY.max - this.intervaloY.min || 1;
    const normalized = (y - this.intervaloY.min) / rangeY;
    return this.graphHeight - normalized * this.graphHeight;
  }

  private atualizarGrafico(a: number, b: number, c: number): void {
    const pontosX: number[] = [];
    const pontosY: number[] = [];
    const passos = 80;
    const minX = this.intervaloX.min;
    const maxX = this.intervaloX.max;
    const rangeX = maxX - minX;

    for (let i = 0; i <= passos; i++) {
      const t = i / passos;
      const x = minX + rangeX * t;
      const y = a * x * x + b * x + c;
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
