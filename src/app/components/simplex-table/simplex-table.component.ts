import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SimplexInput {
  c: number[];
  A: number[][];
  operador: (0 | 1 | 2)[]; // Agora os operadores são números
  b: number[];
  maximize: boolean;
}

interface SimplexTable {
  headers: string[];
  matrix: number[][];
  objectiveRow: number[];
}

@Component({
  selector: 'app-simplex-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simplex-table.component.html',
  styleUrl: './simplex-table.component.scss'
})
export class SimplexTableComponent implements OnChanges {
  @Input() inputData!: SimplexInput;
  tableData?: SimplexTable;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputData'] && this.inputData) {
      this.tableData = this.montarTabelaSimplex(this.inputData);
    }
  }

  private montarTabelaSimplex(input: SimplexInput): SimplexTable {
    let { c, A, operador, b, maximize } = input;
    const numRestricoes = A.length;
    const numVariaveis = c.length;
  
    let matrix: number[][] = [];
    let headers: string[] = [];
  
    let cClone = [...c];
    if (!maximize) {
      cClone = cClone.map(coef => -coef);
    }
  
    for (let i = 0; i < numVariaveis; i++) {
      headers.push(`x${i + 1}`);
    }
  
    let slackCount = 0;
    let excessCount = 0;
    let artificialCount = 0;
  
    for (let i = 0; i < numRestricoes; i++) {
      let row: number[] = [...A[i]];
  
      const operadorString = this.getOperatorString(operador[i]); // Convertendo para string
      if (operadorString === '<=') {
        slackCount++;
        row = row.concat(new Array(slackCount - 1).fill(0));
        row.push(1);
        headers.push(`s${slackCount}`);
      } else if (operadorString === '>=') {
        excessCount++;
        artificialCount++;
        row = row.concat(new Array(excessCount - 1).fill(0));
        row.push(-1); 
        headers.push(`e${excessCount}`);
        row = row.concat(new Array(artificialCount - excessCount).fill(0));
        row.push(1); 
        headers.push(`a${artificialCount}`);
      } else if (operadorString === '=') {
        artificialCount++;
        row = row.concat(new Array(artificialCount - 1).fill(0));
        row.push(1);
        headers.push(`a${artificialCount}`);
      }
  
      row.push(b[i]);
      matrix.push(row);
    }
  
    headers.push('b');
  
    const totalColumns = headers.length;
    matrix = matrix.map(row => {
      while (row.length < totalColumns) {
        row.splice(row.length - 1, 0, 0);
      }
      return row;
    });
  
    const objectiveRow = new Array(totalColumns).fill(0);
    for (let i = 0; i < numVariaveis; i++) {
      objectiveRow[i] = -cClone[i];
    }
  
    return {
      headers,
      matrix,
      objectiveRow,
    };
  }
  
  private getOperatorString(operador: 0 | 1 | 2): string {
    switch (operador) {
      case 0: return '<=';
      case 1: return '>=';
      case 2: return '=';
      default: return '<='; // Valor default
    }
  }
}
