import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';


@Injectable({
    providedIn: 'root'
})
export class AuthService {



    getToken(): string | null {
        return localStorage.getItem('token');
    }
    
    private userSubject = new BehaviorSubject<any>(this.getUser());
    user$ = this.userSubject.asObservable();

    getUser(): any {
        return JSON.parse(localStorage.getItem('user') || 'null');
    }

    setUser(user: any) {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null); // 🔥 esto actualiza todo
    }






    isLogged(): boolean {
        return !!localStorage.getItem('token');
    }


}