import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Campo = 'a' | 'x' | 'b' | 'c';

@Component({
  selector: 'app-funcao-2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funcao-2.page.html',
  styleUrls: ['./funcao-2.page.css'],
})
export class Funcao2Page {
  // expressão mostrada no display
  display: string = 'a · x² + b · x + c';

  // campo que o teclado está editando
  campoAtual: Campo = 'a';

  // valores digitados (O texto)
  aValor: string = '';
  xValor: string = '';
  bValor: string = '';
  cValor: string = '';

  // limite de dígitos (sem contar o operador)
  private readonly MAX_DIGITOS = 12;

  // valores numéricos usados no resultado
  valores = {
    a: 0,
    b: 0,
    c: 0,
    x: 0,
  };

  // resultado do cálculo
  resultado: {
    y: number;
    delta: number | null;
    raiz1: number | null;
    raiz2: number | null;
    temRaizesReais: boolean;
    descricaoRaizes: string;
    eFuncao2Grau: boolean;
  } | null = null;

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
    const xTxt = this.xValor !== '' ? this.xValor : 'x';
    const bTxt = this.bValor !== '' ? this.bValor : 'b';
    const cTxt = this.cValor !== '' ? this.cValor : 'c';

    this.display = `${aTxt} · x² + ${bTxt} · x + ${cTxt}`;
  }

  adicionar(caractere: string): void {
    let atual = this.getValorCampo(this.campoAtual);

    // botão de sinal: alterna "menos" no início
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

    // evita dois pontos decimais no mesmo número
    if (caractere === '.' && atual.includes('.')) {
      return;
    }

    // respeita limite de dígitos (sem contar o menos)
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

    // caso a = 0, não é função de 2º grau
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

    this.atualizarDisplay();
  }
}
