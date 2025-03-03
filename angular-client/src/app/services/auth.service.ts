import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private baseUrl = 'http://localhost:3000/auth';
  // private baseUrl = 'http://34.247.122.14:3000/auth';
  private baseUrl = 'https://emailproject.linkpc.net/auth';
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<string>('');
  public currentUsername$: Observable<string> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadFromLocalStorage();  // Carica lo stato di autenticazione e l'utente dal localStorage all'avvio
  }

  private loadFromLocalStorage(){
    const token = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');

    if (token && savedUsername) {
      this.isLoggedInSubject.next(true);
      this.currentUserSubject.next(savedUsername);
    }
  }

  signUp(username: string, password: string, email: string): Observable<any> {
    const url = `${this.baseUrl}/signup`;
    return this.http.post(url, { username, password, email });
  }

  confirmSignUp(username: string, confirmationCode: string): Observable<any> {
    const url = `${this.baseUrl}/confirm`;
    return this.http.post(url, { username, confirmationCode });
  }

  signIn(username: string, password: string): Observable<string> {
    const url = `${this.baseUrl}/signin`;
    const body = { username, password };
    return this.http.post<{ token: string }>(url, body).pipe(
        map(response => {
          const accessToken = response.token;
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(username);
          const decodedToken = jwtDecode<{ email: string }>(accessToken);
          const userEmail = decodedToken.email;
          localStorage.setItem('email', userEmail);
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('username', username);
          console.log('Login avvenuto');
          return response.token;
        }),
        catchError(err => {
          console.error('Errore login: ', err);
          throw err;
        })
      );
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }
  
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  
  logout(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Token non trovato!');
    }    

    const url = `${this.baseUrl}/logout`;
    const headers = new HttpHeaders().set('Authorization', token);

    return this.http.post(url, {}, { headers }).pipe(
      map((response: any) => {
        this.isLoggedInSubject.next(false);
        this.currentUserSubject.next('');
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        console.log('Logout effettuato con successo: ',response);
        return response;
      }), catchError((error: any) => {
        console.error('Errore logout: ', error);
        this.isLoggedInSubject.next(false);
        this.currentUserSubject.next('');
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        return throwError(() => error);
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    const url = `${this.baseUrl}/requestPasswordReset`;
    return this.http.post(url, { email });
  }

  resetPassword(email: string, confirmationCode: string, newPassword: string): Observable<any> {
    const url = `${this.baseUrl}/resetPassword`;
    return this.http.post(url, { email, confirmationCode, newPassword });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
  
    const url = `${this.baseUrl}/changePassword`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body = { oldPassword, newPassword };
  
    return this.http.post(url, body, { headers }).pipe(
      map(response => {
        console.log('Password modificata con successo: ', response);
        return response;
      }),
      catchError(err => {
        console.error('Errore durante la modifica della password: ', err);
        return throwError(() => err);
      })
    );
  }
}
