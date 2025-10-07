import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { ChessBoardComponent } from './chess-board/chess-board';

export const routes: Routes = [
    {
        path: '',
        component: Homepage,
    },
    {
        path: 'local',
        component: ChessBoardComponent
    }
];
