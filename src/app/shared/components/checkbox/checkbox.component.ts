import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent {

  @Input() label: string = "";        // Texto acima do checkbox
  @Input() checked: boolean = false;  // Valor inicial
  @Output() checkedChange = new EventEmitter<boolean>(); // Emite quando muda

  alterarValor() {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}