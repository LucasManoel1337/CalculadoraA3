import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { util } from '../../../core/utils/util';

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
  matrizTransposta: number[][] = [];

  permitirSomenteNumeros = util.permitirSomenteNumeros;
  bloquearPasteNegativo = util.bloquearPasteNegativo;

  private avaliarExpressao(expr: string, i: number, j: number): number {
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
    this.matrizTransposta = []; // reset
  }

  gerarTransposta() {
    if (this.matriz.length === 0) return;

    const linhas = this.matriz.length;
    const colunas = this.matriz[0].length;

    const transposta: number[][] = [];

    for (let j = 0; j < colunas; j++) {
      const novaLinha: number[] = [];

      for (let i = 0; i < linhas; i++) {
        novaLinha.push(this.matriz[i][j]);
      }

      transposta.push(novaLinha);
    }

    this.matrizTransposta = transposta;
  }
}
