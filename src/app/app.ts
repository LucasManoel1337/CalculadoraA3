import { Component } from '@angular/core';
import { MenuComponent } from "./shared/components/menu/menu.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}
