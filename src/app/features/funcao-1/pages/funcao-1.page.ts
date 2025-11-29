import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-funcao-1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './funcao-1.page.html',
  styleUrls: ['./funcao-1.page.css'],
})
export class Funcao1Page {
  funcao1Form: FormGroup;

  // valores usados para exibir na tela
  valores = {
    a: 0,
    b: 0,
    x: 0,
  };

  // resultado calculado (null quando ainda não calculou)
  resultado: {
    y: number;
    raiz: number | null;
    eFuncao1Grau: boolean;
  } | null = null;

  constructor(private fb: FormBuilder) {
    this.funcao1Form = this.fb.group({
      a: [0, [Validators.required]],
      b: [0, [Validators.required]],
      x: [0, [Validators.required]],
    });
  }

  calcular(): void {
    if (this.funcao1Form.invalid) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    const { a, b, x } = this.funcao1Form.value;

    const aNum = Number(a);
    const bNum = Number(b);
    const xNum = Number(x);

    this.valores = { a: aNum, b: bNum, x: xNum };

    const y = aNum * xNum + bNum;

    // Se a = 0, não é função do 1º grau
    if (aNum === 0) {
      this.resultado = {
        y,
        raiz: null,
        eFuncao1Grau: false,
      };
      return;
    }

    const raiz = -bNum / aNum;

    this.resultado = {
      y,
      raiz,
      eFuncao1Grau: true,
    };
  }
}
