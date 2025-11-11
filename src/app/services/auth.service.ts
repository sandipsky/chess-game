import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    login() {
        localStorage.setItem('token', "asd");
    }

    isLoggedIn() {
        let authToken = localStorage.getItem('token');
        return authToken !== null ? true : false;
    }

    logout() {
        localStorage.removeItem('token');
    }
}
