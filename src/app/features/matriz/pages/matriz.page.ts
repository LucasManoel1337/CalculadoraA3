import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { util } from '../../../core/utils/util';
import { CheckboxComponent } from "../../../shared/components/checkbox/checkbox.component";

@Component({
  selector: 'app-matriz',
  standalone: true,
  imports: [NgFor, FormsModule, CommonModule, CheckboxComponent, ReactiveFormsModule],
  templateUrl: './matriz.page.html',
  styleUrls: ['./matriz.page.css'],
})
export class MatrizPage {
  matrizForm: FormGroup;

  matriz: number[][] = [];
  matrizTransposta: number[][] = [];

  permitirSomenteNumeros = util.permitirSomenteNumeros;
  bloquearPasteNegativo = util.bloquearPasteNegativo;

  constructor(private fb: FormBuilder) {
    this.matrizForm = this.fb.group({
      linhas: [0, [Validators.required, Validators.min(1), Validators.max(20)]],
      colunas: [0, [Validators.required, Validators.min(1), Validators.max(20)]],
      regra: ['', Validators.required],
      matrizDiagonal: [false]
    });
  }

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
      return 0;
    }
  }

  gerarMatriz() {
    if (this.matrizForm.invalid) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    const { linhas, colunas, regra, matrizDiagonal } = this.matrizForm.value;
    const nova: number[][] = [];

    for (let i = 1; i <= linhas; i++) {
      const linha: number[] = [];
      for (let j = 1; j <= colunas; j++) {
        let valor = this.avaliarExpressao(regra, i, j);
        if (matrizDiagonal && i !== j) valor = 0;
        linha.push(valor);
      }
      nova.push(linha);
    }

    this.matriz = nova;
    this.matrizTransposta = [];
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

  resetarMatriz() {
    this.matriz = [];
    this.matrizTransposta = [];
  }
}