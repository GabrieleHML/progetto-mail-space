import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) { }

  uploadEmail(mittente: string, oggetto: string, testo: string): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/upload`;
    const headers = new HttpHeaders().set('Authorization', token);
  
    const requestBody = { mittente, oggetto, testo };
  
    return this.http.post(url, requestBody, { headers }).pipe(
      map((response: any) => {
        console.log('Email caricata con successo!');
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(`Errore durante l\'upload: ${error.status} ${error.statusText}`));
      })
    );
  }

  getEmails(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/user-emails`;
    const headers = new HttpHeaders().set('Authorization', token);

    return this.http.get<any[]>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Errore nel recupero delle email: ',error);
        return throwError(() => error);
      })
    );
  }

  searchEmailsBySender(sender: string): Observable<any[]> {
    const url = `${this.baseUrl}/search-by-sender/${sender}`;
    return this.http.get<any>(url);
  }

  searchEmailsBySubject(subject: string): Observable<any[]> {
    const url = `${this.baseUrl}/search-by-subject/${subject}`;
    return this.http.get<any>(url);
  }

  searchEmailsByKeyword(keyword: string): Observable<any[]> {
    const url = `${this.baseUrl}/search-by-keyword/${keyword}`;
    return this.http.get<any>(url);
  }

  searchEmailsByText(text: string): Observable<any[]> {
    const url = `${this.baseUrl}/search-by-text/${text}`;
    return this.http.get<any>(url);
  }
}
