import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<string>('');
  public currentUser$: Observable<string> = this.currentUserSubject.asObservable();


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
    return this.http.post<{ token: string }>(url, body)
      .pipe(
        map(response => {
          // Rendere osservabili lo stato di autenticazione e lo username
          const accessToken = response.token;
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(username);
          // Salva il token nel localStorage
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('username', username);
          console.log('Login avvenuto');
          return response.token;
        }),
        catchError(err => {
          // Gestione errori (ad esempio, notifiche o log)
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
    // Controllo la presenza del token
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

  getDemoPage(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
  
    const url = `${this.baseUrl}/demoPage`;
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(url, { headers });
  }
}
