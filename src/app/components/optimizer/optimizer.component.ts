import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SimplexTableComponent } from '../simplex-table/simplex-table.component'; // IMPORTAR O COMPONENTE!
import { environment } from '../../../environments/enviroment';

interface SimplexResponse {
  status: string;
  solution: number[];
  optimal_value: number;
  message: string;
}

interface SimplexInput {
  c: number[];
  A: number[][];
  operador: (0 | 1 | 2)[]; // Agora os operadores são números
  b: number[];
  maximize: boolean;
}

@Component({
  selector: 'app-optimizer',
  imports: [FormsModule, CommonModule, SimplexTableComponent],
  templateUrl: './optimizer.component.html',
  styleUrls: ['./optimizer.component.scss']
})
export class OptimizerComponent {
  numVariables: number = 2;
  objective: number[] = [0, 0];
  isLoading: boolean = false;
  showWakeMessage: boolean = false;
  private loadingTimeout: any;
  maximize: boolean = true;
  constraints: { coefficients: number[]; operator: '>=' | '<=' | '='; rhs: number }[] = [];
  method: string = 'simplex';
  result: any = null;
  imageSrc: string | null = null;
  solution: number[] = [];
  optimalValue: number = 0;
  message: string = '';
  simplexSubmitted: boolean = false;
  simplexInputData!: SimplexInput;

  constructor(private http: HttpClient) { }

  updateVariables() {
    this.objective = new Array(this.numVariables).fill(0);
    this.constraints.forEach(constraint => {
      constraint.coefficients = new Array(this.numVariables).fill(0);
    });
  }

  addConstraint() {
    this.constraints.push({
      coefficients: new Array(this.numVariables).fill(0),
      operator: '<=',
      rhs: 0
    });
  }

  buildSimplexTable() {
    return {
      c: this.objective,
      A: this.constraints.map(c => c.coefficients),
      operador: this.constraints.map(c => this.operatorToNumber(c.operator)), 
      b: this.constraints.map(c => c.rhs),
      maximize: this.maximize
    };
  }

  operatorToNumber(operator: '>=' | '<=' | '='): 0 | 1 | 2 {
    switch (operator) {
      case '<=':
        return 0;
      case '>=':
        return 1;
      case '=':
        return 2;
      default:
        throw new Error('Operador desconhecido');
    }
  }

  removeConstraint(index: number) {
    this.constraints.splice(index, 1);
  }

  submit() {
    this.simplexSubmitted = false;

    if (!this.method) {
      alert('Selecione um método.');
      return;
    }

    if (this.method === 'grafico') {
    
      const payload = this.buildSimplexTable();

      console.log('Payload gráfico:', payload);
      this.isLoading = true;
      this.showWakeMessage = false;

      this.loadingTimeout = setTimeout(() => {
        this.showWakeMessage = true;
      }, 5000);
      this.http.post(environment.apiUrlGraficos, payload, { responseType: 'blob' }).subscribe({
        next: (response) => {
          this.isLoading = false;
          clearTimeout(this.loadingTimeout);
          this.showWakeMessage = false;
          const reader = new FileReader();
          reader.readAsDataURL(response);
          reader.onloadend = () => {
            this.imageSrc = reader.result as string;
          };
        },
        error: (error) => {
          console.error('Erro no gráfico:', error);
        }
      });
    } else if (this.method === 'simplex') {
      const payload = this.buildSimplexTable();
      this.simplexInputData = {
        c: [...this.objective],
        A: this.constraints.map(constraint => [...constraint.coefficients]),
        operador: this.constraints.map(constraint => this.operatorToNumber(constraint.operator)), 
        b: this.constraints.map(constraint => constraint.rhs),
        maximize: this.maximize
      };
      console.log('Payload simplex:', payload);

      this.simplexSubmitted = true;
      this.isLoading = true;
      this.showWakeMessage = false;

      this.loadingTimeout = setTimeout(() => {
        this.showWakeMessage = true;
      }, 5000);
      this.http.post<SimplexResponse>(environment.apiUrlSimplex, payload).subscribe({
        next: (response) => {

          this.isLoading = false;
          clearTimeout(this.loadingTimeout);
          this.showWakeMessage = false;
          console.log('Resposta simplex:', response);
          if (response.status === 'success') {
            this.solution = response.solution ?? [];
            this.optimalValue = response.optimal_value ?? 0;
            this.message = response.message;
          } else {
            this.solution = [];
            this.message = response.message;
          }
          this.imageSrc = null;
        },
        error: (error) => {
          console.error('Erro no simplex:', error);
        }
      });
    }
  }
}
