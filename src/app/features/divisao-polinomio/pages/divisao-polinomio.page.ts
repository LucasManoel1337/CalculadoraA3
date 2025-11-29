import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

const EPSILON = 1e-10;

@Component({
  selector: 'app-divisao-polinomios',
  templateUrl: './divisao-polinomio.page.html',
  styleUrls: ['./divisao-polinomio.page.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DivisaoPolinomiosPage {

  polyForm: FormGroup;

  resultado: { quociente: string, resto: string } | null = null;

  constructor(private fb: FormBuilder) {
    this.polyForm = this.fb.group({
      dividendo: ['', Validators.required],
      divisor: ['', Validators.required]
    });
  }

  dividir() {
    if (this.polyForm.invalid) return;
    
    const dividendoStr = this.polyForm.value.dividendo;
    const divisorStr = this.polyForm.value.divisor;

    try {
      const parsedDividendo = this.parsePoly(dividendoStr);
      const parsedDivisor = this.parsePoly(divisorStr);

      const res = this.realizarDivisao(parsedDividendo, parsedDivisor);

      this.resultado = {
        quociente: this.polyToString(res.quociente),
        resto: this.polyToString(res.resto)
      };
    } catch (e) {
      this.resultado = {
        quociente: 'Erro na entrada ou divisão impossível',
        resto: 'Verifique a formatação dos polinômios'
      };
      console.error(e);
    }
  }

  // Polinômio é um Record<grau, coeficiente>
  parsePoly(poly: string): Record<number, number> {
    // 1. Limpeza e normalização
    poly = poly.replace(/\s/g, '').replace(/\*/g, ''); // Remove espaços e *
    
    // 2. Garante que todos os '-' sejam precedidos por '+' (para o split)
    poly = poly.replace(/-/g, "+-");
    
    // 3. Remove um '+' inicial que pode ser gerado (ex: +3x)
    if (poly.startsWith("+-")) poly = "-" + poly.substring(2);
    else if (poly.startsWith("+")) poly = poly.substring(1);


    let termos = poly.split("+").filter(t => t.trim() !== "");

    let obj: Record<number, number> = {};

    termos.forEach(t => {
      if (t === "") return;

      // Regex principal para capturar o termo: [coeficiente](x^|[x])(grau)
      const match = t.match(/^([+-]?\d*)\s*x(?:\^(\d+))?$/);
      
      let coef: number;
      let grau: number;

      if (t.includes('x')) {
        // Caso de x^n (n>1)
        let powerMatch = t.match(/([+-]?\d*)x\^(\d+)/);
        if (powerMatch) {
          grau = Number(powerMatch[2]);
          let coefStr = powerMatch[1];
          if (coefStr === '' || coefStr === '+') coef = 1;
          else if (coefStr === '-') coef = -1;
          else coef = Number(coefStr);
        } 
        // Caso de x^1 (Ex: 5x ou x ou -x)
        else {
          let linearMatch = t.match(/([+-]?\d*)x/);
          if (!linearMatch) return;
          grau = 1;
          let coefStr = linearMatch[1];
          if (coefStr === '' || coefStr === '+') coef = 1;
          else if (coefStr === '-') coef = -1;
          else coef = Number(coefStr);
        }
      } 
      // Caso Constante (Ex: -10 ou 5)
      else {
        grau = 0;
        coef = Number(t);
      }
      
      // Acumula coeficientes para o mesmo grau (ex: x^2 + 2x^2)
      obj[grau] = (obj[grau] || 0) + coef;
    });

    return obj;
  }

  polyToString(poly: Record<number, number>): string {
    let termos: string[] = [];
    // Ordena do maior para o menor grau
    let graus = Object.keys(poly)
      .map(Number)
      .filter(g => Math.abs(poly[g]) > EPSILON) // Filtra coeficientes que são zero (com tolerância)
      .sort((a,b) => b-a);

    if (graus.length === 0) return '0';

    graus.forEach((g, index) => {
      let c = poly[g];
      let sinal: string;
      let valor = Math.abs(c);

      // Define o sinal (só adiciona '+' se não for o primeiro termo)
      if (index === 0) {
        sinal = c > 0 ? '' : '-';
      } else {
        sinal = c > 0 ? ' + ' : ' - ';
      }

      let termo = '';
      if (g === 0) {
        // Constante
        termo = sinal + valor;
      } else if (g === 1) {
        // x^1
        let coefStr = valor === 1 ? '' : String(valor);
        termo = sinal + coefStr + 'x';
      } else {
        // x^n (n > 1)
        let coefStr = valor === 1 ? '' : String(valor);
        termo = sinal + coefStr + 'x^' + g;
      }
      
      termos.push(termo.trim());
    });

    // Remove o espaço extra no início se o primeiro termo for positivo
    let res = termos.join("");
    return res.replace(/^\s*\+\s*/, "").trim();
  }

  realizarDivisao(dividendo: Record<number, number>, divisor: Record<number, number>) {
    let quociente: Record<number, number> = {};
    let resto = { ...dividendo };

    const todosGrausDivisor = Object.keys(divisor).map(Number).filter(g => Math.abs(divisor[g]) > EPSILON);
    if (todosGrausDivisor.length === 0) {
        throw new Error('Divisor inválido (igual a zero)');
    }
    const grauDivisor = Math.max(...todosGrausDivisor);
    const coefDivisor = divisor[grauDivisor];

    let getGrauResto = () => Math.max(
        ...Object.keys(resto)
            .map(Number)
            .filter(k => Math.abs(resto[k]) > EPSILON) // USA EPSILON AQUI
    );

    let grauResto = getGrauResto();

    // Loop de divisão
    while (grauResto >= grauDivisor) {
      const grauNovo = grauResto - grauDivisor;
      const coefNovo = resto[grauResto] / coefDivisor;

      // Adiciona o novo termo ao quociente
      quociente[grauNovo] = (quociente[grauNovo] || 0) + coefNovo;

      // Subtrai (termo do quociente * divisor) do resto
      for (let g in divisor) {
        const gNum = Number(g);
        const grauAtual = gNum + grauNovo;
        
        // Multiplica o termo do divisor pelo coeficiente do quociente e subtrai do resto
        resto[grauAtual] = (resto[grauAtual] || 0) - divisor[gNum] * coefNovo;
      }

      // Procura o novo maior grau do resto para continuar o loop
      grauResto = getGrauResto();
      
      if (grauResto === -Infinity) break; // Divisão completa
    }

    return { quociente, resto };
  }
}