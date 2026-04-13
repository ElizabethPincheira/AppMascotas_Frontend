import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}`;
    private verificationBannerSubject = new BehaviorSubject<boolean>(false);
    verificationBanner$ = this.verificationBannerSubject.asObservable();

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

        if (user?.email_verified) {
            this.clearVerificationBanner();
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null); // 🔥 esto actualiza todo
        this.clearVerificationBanner();
    }

    async refreshCurrentUser(): Promise<any> {
        const token = this.getToken();

        if (!token) {
            this.userSubject.next(null);
            return null;
        }

        try {
            const response = await axios.get(this.apiUrl + 'user/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            this.setUser(response.data?.user ?? null);
            return response.data?.user ?? null;
        } catch (error) {
            this.logout();
            throw error;
        }
    }






    isLogged(): boolean {
        return !!localStorage.getItem('token');
    }

    requestVerificationBanner(): void {
        const user = this.getUser();

        if (user?.email_verified === false) {
            this.verificationBannerSubject.next(true);
        }
    }

    clearVerificationBanner(): void {
        this.verificationBannerSubject.next(false);
    }


}
