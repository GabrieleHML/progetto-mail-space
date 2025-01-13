import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Folder } from '../models/folder';

@Injectable({
  providedIn: 'root'
})
export class FolderService {

  private baseUrl = 'http://localhost:3000/folder';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Aggiunge una cartella con il nome specificato
  addFolder(folderName: string): Observable<Folder> {
      const token = this.authService.getToken();
      if (!token) {
        return throwError(() => new Error('Token non trovato!'));
      }
    
      const url = `${this.baseUrl}/add`;
      const headers = new HttpHeaders().set('Authorization', token);
      const body = { name: folderName };
    
      return this.http.post<Folder>(url, body, { headers }).pipe(
        map((response: any) => {
          console.log('Cartella aggiunta con successo!');
          return response;
        }),
        catchError((error: any) => {
          return throwError(() => new Error(`Errore durante l'aggiunta della cartella: ${error.status} ${error.statusText}`));
        })
      );
  }

  // Restituisce la lista di cartelle dell'utente
  getFolders(): Observable<Folder[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }
  
    const url = `${this.baseUrl}/list`;
    const headers = new HttpHeaders().set('Authorization', token);
  
    return this.http.get<Folder[]>(url, { headers }).pipe(
      map((response: any) => {
        console.log('Cartelle ricevute con successo!');
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(`Errore durante il recupero delle cartelle: ${error.status} ${error.statusText}`));
      })
    );
  }

  // Elimina la cartella con l'id specificato
  deleteFolder(folderId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }
  
    const url = `${this.baseUrl}/delete`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body = { folderId };
  
    return this.http.post(url, body, { headers }).pipe(
      map((response: any) => {
        console.log('Cartella eliminata con successo!');
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(`Errore durante l'eliminazione della cartella: ${error.status} ${error.statusText}`));
      })
    );
  }

  // Aggiunge le email specificate alla cartella specificata
  addEmailsToFolder(s3Keys: string[], folderId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }
    
    const url = `${this.baseUrl}/addEmails`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body = { s3Keys, folderId };
    return this.http.post(url, body, { headers }).pipe(
      map((response: any) => {
        console.log('Email aggiunte alla cartella con successo!');
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(`Errore durante l'aggiunta delle email alla cartella: ${error.status} ${error.statusText}`));
      })
    );
  }

  // Restituisce le email contenute nella cartella specificata
  getEmailsFromFolder(folderId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/getEmails`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body = { folderId };

    return this.http.post(url, body, { headers }).pipe(
      map((response: any) => {
        console.log('Email ricevute dalla cartella con successo!');
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(`Errore durante il recupero delle email dalla cartella: ${error.status} ${error.statusText}`));
      })
    );
  }

  // Rimuove le email specificate dalla cartella specificata
  removeEmailsFromFolder(s3Keys: string[], folderId: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token non trovato!'));
    }

    const url = `${this.baseUrl}/removeEmails`;
    const headers = new HttpHeaders().set('Authorization', token);
    const body = { s3Keys, folderId };

    return this.http.post(url, body, { headers }).pipe(
      map((response: any) => {
        console.log('Email rimosse dalla cartella con successo!');
        return response;
      }),
      catchError((error: any) => {
        return throwError(() => new Error(`Errore durante la rimozione delle email dalla cartella: ${error.status} ${error.statusText}`));
      })
    );
  }
}