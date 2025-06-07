import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Email } from '../models/email';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  // private baseUrl = 'http://localhost:3000/email';
  // private baseUrl = 'http://34.247.122.14:3000/email';
  private baseUrl = 'https://mail-space.it/email';

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

  deleteEmails(emailIds: number[]): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/delete`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body = { emailIds };

    return this.http.post(url, body, { headers }).pipe(
      map((response: any) => {
        console.log('Email cancellate con successo!');
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(`Errore durante la cancellazione: ${error.status} ${error.statusText}`));
      })
    );
  }

  getUserEmailsOrSearchBy(
    option: number, 
    params: { 
      freeText?: string;
      sender?: string;
      subject?: string;
      words?: string;
      labels?: string[];
      intersection?: boolean;
     } = {}
  ): Observable<Email[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/user-emails`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body: any = { option };

    if (params.freeText) body.freeText = params.freeText;
    if (params.sender) body.sender = params.sender;
    if (params.subject) body.subject = params.subject;
    if (params.words) body.words = params.words;
    if (params.labels) body.labels = params.labels;
    if (params.intersection !== undefined) body.intersection = params.intersection;

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

  filterEmails(mode: boolean, labels: string[]): Observable<Email[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/filter`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body: any = { mode, labels };
    
    return this.http.post<Email[]>(url, body, { headers }).pipe(
      map((response: Email[]) => {
        console.log('Email filtrate con successo!');
        return response;
      }), 
      catchError((error) => {
        console.error('Errore nel filtraggio delle email: ', error);
        return throwError(() => new Error(`Errore nel filtraggio delle email: ${error.status} ${error.statusText}`));
      })
    );
  }
}
