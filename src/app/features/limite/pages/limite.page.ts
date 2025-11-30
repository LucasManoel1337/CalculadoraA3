import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { util } from '../../../core/utils/util';

@Component({
  selector: 'app-limites',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './limite.page.html',
  styleUrls: ['./limite.page.css']
})
export class LimitesPage {
  expressao = '';
  valorX = '';
  resultado = '';
  debug = '';

  permitirSomenteNumeros = util.permitirSomenteNumeros;

  // Constante para tolerância de ponto flutuante (evita erros de precisão)
  private readonly EPSILON = 1e-9;

  // -------------------------
  // Helper: transforma '^' em '**'
  // -------------------------
  private toJS(expr: string) {
    return expr.replace(/\^/g, '**');
  }

  // -------------------------
  // Parser simples de polinômios
  // Retorna coeficientes do grau máximo para 0: [1, -5, 6]
  // -------------------------
  private parsePolynomial(expr: string): number[] | null {
    // Limpa espaços e asteriscos de multiplicação (assumindo x*x=x^2)
    const s = expr.replace(/\s+/g, '').replace(/\*/g, '');

    // Expressão normalizada para facilitar o split
    let normal = s.replace(/^\+/, '');
    normal = normal.replace(/-/g, '+-');
    const parts = normal.split('+').filter(p => p !== '');

    const coeffsMap: Record<number, number> = {};
    let maxDeg = 0;

    for (const p of parts) {
      // termo constante: [+/-]N
      if (!p.includes('x')) {
        const val = Number(p);
        if (isNaN(val)) return null;
        coeffsMap[0] = (coeffsMap[0] || 0) + val;
        continue;
      }

      // termo com x^n: [+/-]C*x^N
      if (p.includes('x^')) {
        // Captura: [1] Coeficiente (opcional, pode ser vazio/sinal), [2] Grau N
        const m = p.match(/^([+-]?\d*\.?\d*)x\^(\d+)$/);
        if (!m) return null;

        const coefStr = m[1];
        const deg = Number(m[2]);
        const coef = coefStr === '' || coefStr === '+' ? 1 : coefStr === '-' ? -1 : Number(coefStr);

        coeffsMap[deg] = (coeffsMap[deg] || 0) + coef;
        if (deg > maxDeg) maxDeg = deg;
        continue;
      }

      // termo com x: [+/-]C*x
      if (p.includes('x')) {
        // Captura: [1] Coeficiente (opcional, pode ser vazio/sinal)
        const m = p.match(/^([+-]?\d*\.?\d*)x$/);
        if (!m) return null;

        const coefStr = m[1];
        const coef = coefStr === '' || coefStr === '+' ? 1 : coefStr === '-' ? -1 : Number(coefStr);

        coeffsMap[1] = (coeffsMap[1] || 0) + coef;
        if (1 > maxDeg) maxDeg = 1;
        continue;
      }
    }

    // Constrói o array de coeficientes (grau decrescente)
    const arr = [];
    for (let d = maxDeg; d >= 0; d--) {
      arr.push(coeffsMap[d] || 0);
    }
    return arr;
  }

  // -------------------------
  // Converte array de coef para string polinomial bonita
  // ex: [1, -5, 6] => "x^2 - 5x + 6"
  // -------------------------
  private polyToString(coefs: number[]): string {
    const deg = coefs.length - 1;
    const terms: string[] = [];

    for (let i = 0; i < coefs.length; i++) {
      const c = coefs[i];
      const p = deg - i;

      if (Math.abs(c) < this.EPSILON) continue; // Ignora coeficientes próximos de zero

      const sign = c < 0 ? '-' : (terms.length === 0 ? '' : '+');
      const abs = Math.abs(c);

      let coefStr = '';
      if (p === 0) coefStr = String(abs); // Constante
      else if (abs === 1) coefStr = ''; // Coeficiente 1 (implícito)
      else coefStr = String(abs);

      const power = p === 0 ? '' : (p === 1 ? 'x' : `x^${p}`);
      terms.push(`${sign}${coefStr}${power}`);
    }

    if (terms.length === 0) return '0';
    return terms.join(' ').replace(/\s*\+\s*\-/g, ' - ').trim();
  }

  // -------------------------
  // Divisão Sintética (Briot-Ruffini): divide P(x) por (x - a)
  // coef array: [1, -5, 6] (grau decrescente)
  // retorna {quotient: number[], remainder: number}
  // -------------------------
  private syntheticDivide(coefs: number[], a: number) {
    const n = coefs.length;
    const q: number[] = [];
    let carry = coefs[0];

    q.push(carry);

    for (let i = 1; i < n; i++) {
      const next = coefs[i] + carry * a;
      if (i < n - 1) q.push(next);
      carry = next;
    }

    const remainder = carry;
    return { quotient: q, remainder };
  }

  // -------------------------
  // Tenta simplificar polinomial num/den se den for (x - a)
  // retorna string da expressão simplificada ou original
  // -------------------------
  private simplifyPolynomialDivision(numer: string, denom: string): string {
    // Remove parênteses externos do numerador e espaços do denominador
    const numExpr = numer.replace(/^\(|\)$/g, '').trim();
    const dm = denom.replace(/\s+/g, '');

    // Caso simples: (x - a) ou (x + a), com ou sem parênteses
    let rootA: number | null = null;

    // x - a
    let m = dm.match(/^\(?x-(\d+(?:\.\d+)?)\)?$/);
    if (m) {
      rootA = Number(m[1]);
    } else {
      // x + a
      m = dm.match(/^\(?x\+(\d+(?:\.\d+)?)\)?$/);
      if (m) {
        rootA = -Number(m[1]);
      }
    }

    // Se não casar com binômio linear, não simplifica
    if (rootA === null || isNaN(rootA)) {
      return numer + '/' + denom;
    }

    // Tenta parsear o numerador como polinômio
    const coefs = this.parsePolynomial(numExpr);
    if (!coefs) return numer + '/' + denom;

    // Divide P(x) por (x - rootA)
    const res = this.syntheticDivide(coefs, rootA);

    // Só simplifica se o resto for (quase) zero
    if (Math.abs(res.remainder) > this.EPSILON) {
      return numer + '/' + denom;
    }

    // Retorna o quociente como string polinomial (ex.: "x^2 - 5x + 6")
    return this.polyToString(res.quotient);
  }

  // -------------------------
  // Racionalização simples para (sqrt(x)-c)/(x - c^2)
  // -------------------------
  private tryRationalizeSqrt(expr: string): string | null {
    const s = expr.replace(/\s+/g, '');
    // Padrão: (opcional)(sqrt(x)-c) / (opcional)(x-c^2)
    const re = /^\(?(?:sqrt\(\s*x\s*\)-([0-9]+(?:\.[0-9]+)?))\)?\/\(?(?:x-([0-9]+(?:\.[0-9]+)?))\)?$/;
    const m = s.match(re);

    if (!m) return null;

    const c = Number(m[1]); // o 'c' do numerador
    const b = Number(m[2]); // o 'b' do denominador (que deve ser c^2)

    if (Math.abs(b - c * c) > this.EPSILON) return null;

    return `1/(Math.sqrt(x)+${c})`;
  }

  // -------------------------
  // Tratamentos especiais (sin(x)/x)
  // -------------------------
  private trySpecialCases(expr: string, xval: number): { handled: boolean, result?: number, expr?: string } {
    const s = expr.replace(/\s+/g, '');
    if (/^sin\(\s*x\s*\)\/x$/.test(s) && Math.abs(xval) < this.EPSILON) {
      return { handled: true, result: 1 };
    }
    // Adicione Math. para funções trigonométricas na expressão
    const jsExpr = this.toJS(expr).replace(/sin|cos|tan|log|exp|sqrt/g, (match) => `Math.${match}`);
    return { handled: false, expr: jsExpr };
  }

  calcularLimite() {
    this.debug = '';
    this.resultado = '';

    if (!this.expressao || this.valorX === '') {
      this.resultado = 'Preencha todos os campos!';
      return;
    }

    const a = Number(this.valorX);
    if (isNaN(a)) {
      this.resultado = 'Valor de a inválido';
      return;
    }

    let raw = this.expressao.trim();

    // Casos especiais (sin(x)/x em x=0)
    const sc = this.trySpecialCases(raw, a);
    if (sc.handled) {
      this.resultado = String(sc.result);
      return;
    }
    let simplifiedExpr = sc.expr || this.toJS(raw);

    // Se for fração, verifica se há indeterminação antes de simplificar
    if (raw.includes('/')) {
      const [numer, denom] = raw.split('/');
      const numVal = Function('x', `return (${this.toJS(numer)});`)(a);
      const denVal = Function('x', `return (${this.toJS(denom)});`)(a);

      if (Math.abs(numVal) < this.EPSILON && Math.abs(denVal) < this.EPSILON) {
        // Indeterminação 0/0 → tenta simplificar
        const simplified = this.simplifyPolynomialDivision(numer, denom);
        if (simplified !== `${numer}/${denom}`) {
          simplifiedExpr = this.toJS(simplified);
        } else {
          // Tenta racionalizar sqrt
          const trySqrt = this.tryRationalizeSqrt(raw);
          if (trySqrt) {
            simplifiedExpr = this.toJS(trySqrt).replace(/sqrt/g, 'Math.sqrt');
          } else {
            // Se não conseguir simplificar, aproxima numericamente
            const f = Function('x', `return (${simplifiedExpr});`);
            const h = 1e-6;
            const left = f(a - h);
            const right = f(a + h);
            const approx = (left + right) / 2;
            this.resultado = String(Number(approx.toFixed(6))) + ' (aproximação)';
            return;
          }
        }
      }

      // Denominador tende a zero, numerador não → infinito
      if (Math.abs(denVal) < this.EPSILON && Math.abs(numVal) > this.EPSILON) {
        this.resultado = numVal > 0 ? '+∞' : '-∞';
        return;
      }
    }

    // Avaliação final
    try {
      const f = Function('x', `return (${simplifiedExpr});`);
      const val = f(a);
      this.resultado = Number.isFinite(val) ? String(Number(val.toFixed(6))) : String(val);
    } catch (e) {
      this.resultado = 'Erro na expressão!';
      this.debug = (e as Error).message;
    }
  }

  adicionar(valor: string) {
    this.expressao += valor;
  }

  apagarUltimo() {
    this.expressao = this.expressao.slice(0, -1);
  }

  limpar() {
    this.expressao = '';
    this.valorX = '';
    this.resultado= '';
  }

}