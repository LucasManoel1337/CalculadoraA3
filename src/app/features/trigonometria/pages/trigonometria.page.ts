import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend } from 'chart.js';
import { evaluate } from 'mathjs';

// Registrar Chart.js
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend);

@Component({
  selector: 'app-trigonometria',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './trigonometria.page.html',
  styleUrls: ['./trigonometria.page.css']
})
export class TrigonometriaPage {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  display: string = '';

  public lineChartData = {
    labels: [] as number[],
    datasets: [
      {
        data: [] as number[],
        label: 'f(x)',
        borderColor: '#007bff',
        fill: false
      }
    ]
  };

  public lineChartOptions = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'X' } },
      y: { title: { display: true, text: 'Y' } }
    }
  };

  public lineChartType: 'line' = 'line';

  append(valor: string) { this.display += valor; }
  apagar() { this.display = this.display.slice(0, -1); }
  limpar() { this.display = ''; }

  calcular() {
    if (!this.display) return;
    try {
      // Avalia expressão direta
      this.display = evaluate(this.display).toString();
    } catch (e) {
      this.display = 'Erro';
      console.error(e);
    }
  }

  // Funções trigonométricas inserindo radianos
  sin() { this.display += 'sin('; }
  cos() { this.display += 'cos('; }
  tan() { this.display += 'tan('; }
  asin() { this.display += 'asin('; }
  acos() { this.display += 'acos('; }
  atan() { this.display += 'atan('; }

  // Gerar gráfico
  gerarGrafico() {
    if (!this.display) return;

    const xValues: number[] = [];
    const yValues: number[] = [];
    const step = 0.1;

    try {
      for (let x = -10; x <= 10; x += step) {
        xValues.push(parseFloat(x.toFixed(2)));

        // Limpa espaços e substitui x na expressão
        let expr = this.display.replace(/\s+/g, '').replace(/x/g, `(${x})`);

        // Avalia
        const y = evaluate(expr);
        yValues.push(y);
      }

      this.lineChartData.labels = xValues;
      this.lineChartData.datasets[0].data = yValues;

      this.chart?.update();
    } catch (e) {
      console.error("Erro ao gerar gráfico", e);
      alert("Expressão inválida para gráfico.");
    }
  }
}
