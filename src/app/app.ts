import { Component, signal } from '@angular/core';
import { ChessBoardComponent } from './chess-board/chess-board';

@Component({
  selector: 'app-root',
  imports: [ChessBoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('chess-game');
}
