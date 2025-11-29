import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matriz',
  standalone: true,
  imports: [NgFor, FormsModule, CommonModule],
  templateUrl: './matriz.page.html',
  styleUrls: ['./matriz.page.css'],
})
export class MatrizPage {
  linhas: number = 0;
  colunas: number = 0;
  regra: string = "";

  matriz: number[][] = [];

  private avaliarExpressao(expr: string, i: number, j: number): number {
    // Trocar ^ por ** (padrão JS)
    const preparado = expr
      .replace(/\^/g, '**')
      .replace(/i/g, `(${i})`)
      .replace(/j/g, `(${j})`);

    try {
      const resultado = new Function(`return ${preparado}`)();
      return Number(resultado);
    } catch (e) {
      console.error("Erro ao avaliar expressão:", e);
      return NaN;
    }
  }

  gerarMatriz() {
    if (this.linhas <= 0 || this.colunas <= 0) {
      alert('Informe valores válidos!');
      return;
    }

    if (!this.regra || this.regra.trim().length === 0) {
      alert('Digite uma regra! Ex: i*i + j');
      return;
    }

    const nova: number[][] = [];

    for (let i = 1; i <= this.linhas; i++) {
      const linha: number[] = [];

      for (let j = 1; j <= this.colunas; j++) {
        const valor = this.avaliarExpressao(this.regra, i, j);
        linha.push(valor);
      }

      nova.push(linha);
    }

    this.matriz = nova;
  }
}