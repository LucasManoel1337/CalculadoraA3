import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisplayComponent } from '../../../shared/components/display/display.component';

@Component({
  selector: 'app-operacoes-basicas',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayComponent],
  templateUrl: './operacoes-basicas.page.html',
  styleUrls: ['./operacoes-basicas.page.css'],
})
export class OperacoesBasicasPage {

  display: string = '';

  adicionar(valor: string) {
    this.display += valor;
  }

  apagarUltimo() {
    this.display = this.display.slice(0, -1);
  }

  limpar() {
    this.display = '';
  }

  calcular() {
    try {
      this.display = new Function(`return ${this.display}`)();
    } catch (e) {
      console.error("Expressão inválida", e);
    }
  }

}
