import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-imc',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './imc.page.html',
  styleUrl: './imc.page.css'
})
export class ImcPage {
  peso: number = 0;
  altura: number = 0;
  imc: number | null = null;
  classificacao: string = "";
  rotacaoPonteiro: string = "rotate(-90deg)"; // APARECENDO NASCIDO

  calcularIMC() {
    if (!this.peso || !this.altura) return;

    this.imc = this.peso / (this.altura * this.altura);

    if (this.imc < 18.5) this.classificacao = "Abaixo do peso";
    else if (this.imc < 25) this.classificacao = "Peso normal";
    else if (this.imc < 30) this.classificacao = "Acima do peso";
    else this.classificacao = "Obeso";

    this.rotacaoPonteiro = `rotate(${this.converterIMCparaAngulo(this.imc)}deg)`;
  }

  converterIMCparaAngulo(imc: number): number {
    if (imc < 18.5) return -90 + (imc / 18.5) * 30;
    if (imc < 25) return -60 + ((imc - 18.5) / (25 - 18.5)) * 60;
    if (imc < 30) return 0 + ((imc - 25) / 5) * 45;
    return 45 + Math.min((imc - 30) * 3, 45);
  }
}