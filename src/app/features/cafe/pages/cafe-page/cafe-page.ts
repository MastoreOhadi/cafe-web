import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cafe-page',
  imports: [CommonModule],
  templateUrl: './cafe-page.html',
  styleUrl: './cafe-page.scss'
})
export class CafePage {
  activeTab: string = 'menu';
}
