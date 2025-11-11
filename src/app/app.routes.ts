import { Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { ChessBoardComponent } from './chess-board/chess-board';
import { Login } from './pages/login/login';

export const routes: Routes = [
    {
        path: '',
        component: Homepage,
    },
    {
        path: 'local',
        component: ChessBoardComponent
    },
    {
        path: 'login',
        component: Login
    }
];
