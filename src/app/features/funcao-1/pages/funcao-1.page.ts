import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Campo = 'a' | 'x' | 'b';

@Component({
  selector: 'app-funcao-1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funcao-1.page.html',
  styleUrls: ['./funcao-1.page.css'],
})
export class Funcao1Page {
  // expressão mostrada no display
  display: string = 'a · x + b';

  // campo que o teclado está editando
  campoAtual: Campo = 'a';

  // valores digitados (como texto)
  aValor: string = '';
  xValor: string = '';
  bValor: string = '';

  // limite máximo de dígitos (sem contar o sinal -)
  private readonly MAX_DIGITOS = 12;

  // valores numéricos usados para exibir o resultado
  valores = {
    a: 0,
    b: 0,
    x: 0,
  };

  // resultado do cálculo
  resultado: {
    y: number;
    raiz: number | null;
    eFuncao1Grau: boolean;
  } | null = null;

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

    // botão de sinal: caractere '-' e alterna o sinal
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

    // impede mais de um ponto decimal
    if (caractere === '.' && atual.includes('.')) {
      return;
    }

    // limita quantidade de dígitos (ignora o hífen na contagem)
    const semSinal = atual.startsWith('-') ? atual.slice(1) : atual;
    if (semSinal.length >= this.MAX_DIGITOS) {
      // já chegou no limite, acabou pro beta
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
      return;
    }

    const raiz = -b / a;

    this.resultado = {
      y,
      raiz,
      eFuncao1Grau: true,
    };

    this.atualizarDisplay();
  }
}
