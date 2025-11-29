import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
})
export class HomePage {
  constructor(private router: Router) {}

  navegar(rota: string) {
    this.router.navigate([rota]);
  }

  integrantes = [
    'Lucas Manoel Paixão - RA: 12524140750',
    'Victor Gabriel Monteiro Silva - RA: 1252411480',
    'Igor Ferreira Zanotti - RA: 12524130207'
  ];

  descricao = `
    Este projeto foi desenvolvido como parte da Avaliação A3 da disciplina Estruturas Matemáticas 
    do professor Adjaci Uchoa Fernandes.
    A proposta é criar uma calculadora/site completa contendo várias funcionalidades,
    desde cálculos básicos até operações matemáticas mais elaboradas.
  `;
}
