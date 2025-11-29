import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { util } from '../../../core/utils/util';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend);

@Component({
  selector: 'app-juros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './juros.page.html',
  styleUrls: ['./juros.page.css']
})
export class JurosPage implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  jurosForm!: FormGroup;
  resultado: string = '';

  permitirSomenteNumeros = util.permitirSomenteNumeros;
  bloquearPasteNegativo = util.bloquearPasteNegativo;

  public lineChartData = {
    labels: [] as number[],
    datasets: [
      {
        data: [] as number[],
        label: 'Montante',
        borderColor: '#4a7dff',
        fill: false
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: 'Período' } },
      y: { title: { display: true, text: 'Montante' } }
    }
  };

  public lineChartType: 'line' = 'line';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.jurosForm = this.fb.group({
      capital: [0, [Validators.required, Validators.min(0)]],
      taxa: [0, [Validators.required, Validators.min(0)]],
      periodo: [0, [Validators.required, Validators.min(1)]],
      unidadePeriodo: ['anos', Validators.required], // 'meses' ou 'anos'
      tipo: ['simples', Validators.required] // 'simples' ou 'composto'
    });
  }

  calcular() {
    const { capital, taxa, periodo, unidadePeriodo, tipo } = this.jurosForm.value;
    
    // Ajustar taxa se período em meses
    let i = taxa / 100;
    let n = periodo;
    if (unidadePeriodo === 'meses') {
      i = i / 12; // converter taxa anual para mensal
      // n permanece meses
    }

    let montante = 0;
    let juros = 0;
    if (tipo === 'simples') {
      juros = capital * i * n;
      montante = capital + juros;
    } else {
      montante = capital * Math.pow(1 + i, n);
      juros = montante - capital;
    }

    this.resultado = `Montante: R$ ${montante.toFixed(2)} (Juros: R$ ${juros.toFixed(2)})`;
    this.gerarGrafico();
  }

  gerarGrafico() {
    const { capital, taxa, periodo, unidadePeriodo, tipo } = this.jurosForm.value;
    let i = taxa / 100;
    let n = periodo;
    if (unidadePeriodo === 'meses') i = i / 12;

    const xValues: number[] = [];
    const yValues: number[] = [];

    for (let t = 0; t <= n; t++) {
      xValues.push(t);
      let montante = 0;
      if (tipo === 'simples') {
        montante = capital * (1 + i * t);
      } else {
        montante = capital * Math.pow(1 + i, t);
      }
      yValues.push(montante);
    }

    this.lineChartData.labels = xValues;
    this.lineChartData.datasets[0].data = yValues;
    this.chart?.update();
  }
}
