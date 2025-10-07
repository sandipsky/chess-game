import { Component, signal } from '@angular/core';
import { ChessBoardComponent } from './chess-board/chess-board';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [ChessBoardComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('chess-game');
}
