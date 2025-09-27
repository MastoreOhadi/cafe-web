// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgProgressbar, NgProgressRouter],
  template: `
    <ng-progress ngProgressRouter class="root-progress-bar"></ng-progress>
    <router-outlet />
  `,
  styleUrl: './app.css',
})
export class App {
  protected title = 'cafe-web';
}