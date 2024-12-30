import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { JsonPipe } from '@angular/common';
import { Email } from '../models/email';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private baseUrl = 'http://localhost:3000/email';

  constructor(private http: HttpClient, private authService: AuthService) { }

  uploadEmail(sender: string, subject: string, body: string): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/upload`;
    const headers = new HttpHeaders().set('Authorization', token);
  
    const requestBody = { sender, subject, body };
  
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

  uploadEmailFile(file: File): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/uploadFile`;
    const headers = new HttpHeaders().set('Authorization',token);

    const formData = new FormData();
    formData.append('emailFile', file);

    return this.http.post(url, formData, { headers }).pipe(
      map((response: any) => {
        console.log('File .eml caricato con successo!');
        return response;
      }), catchError((error: any) => {
        return throwError(() => new Error(`Errore durante l'upload del file: ${error.status} ${error.statusText}`));
      })
    );
  }

  getUserEmailsOrSearchBy(option: number, word?: string): Observable<Email[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/user-emails`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body = { option, word };

    return this.http.post<Email[]>(url, body, { headers }).pipe(
      map((response: Email[]) => {
        console.log('Email ricevute con successo!');
        return response;
      }), 
      catchError((error) => {
        console.error('Errore nel recupero delle email: ', error);
        return throwError(() => new Error(`Errore nel recupero delle email: ${error.status} ${error.statusText}`));
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
