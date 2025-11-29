import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend } from 'chart.js';
import { evaluate } from 'mathjs';

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
  usarGraus: boolean = true;

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
      this.display = evaluate(this.display).toString();
    } catch (e) {
      this.display = 'Erro';
      console.error(e);
    }
  }

  sin() { this.display += 'sin('; }
  cos() { this.display += 'cos('; }
  tan() { this.display += 'tan('; }
  asin() { this.display += 'asin('; }
  acos() { this.display += 'acos('; }
  atan() { this.display += 'atan('; }

  toggleGraus() { this.usarGraus = !this.usarGraus; }

  gerarGrafico() {
    if (!this.display) return;

    const xValues: number[] = [];
    const yValues: number[] = [];
    const step = 0.1;

    try {
      for (let x = -10; x <= 10; x += step) {
        xValues.push(parseFloat(x.toFixed(2)));

        let expr = this.display.replace(/\s+/g, '').replace(/x/g, `(${x})`);

        if (this.usarGraus) {
          expr = expr
            .replace(/sin\(/g, 'sin((pi/180)*')
            .replace(/cos\(/g, 'cos((pi/180)*')
            .replace(/tan\(/g, 'tan((pi/180)*');
        }

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
