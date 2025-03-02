import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LabelsService {
    // private baseUrl = 'http://localhost:3000/labels';
    private baseUrl = 'https://emailproject.linkpc.net/labels';

    constructor(private http: HttpClient, private authService: AuthService) { }

    addLabel(label: string): Observable<any> {
        const token = this.authService.getToken();
        if (!token) {
            return throwError(() => new Error('Token non trovato!'));
        }

        const url = `${this.baseUrl}/add`;
        const headers = new HttpHeaders().set('Authorization', token);
        const requestBody = { label };

        return this.http.post(url, requestBody, { headers }).pipe(
            map((response: any) => {
                console.log('Etichetta aggiunta con successo!');
                return response;
            }),
            catchError((error: any) => {
                return throwError(() => new Error(`Errore durante l'aggiunta dell'etichetta: ${error.status} ${error.statusText}`));
            })
        );
    }

    deleteLabel(label: string): Observable<any> {
        const token = this.authService.getToken();
        if (!token) {
            return throwError(() => new Error('Token non trovato!'));
        }

        const url = `${this.baseUrl}/delete`;
        const headers = new HttpHeaders().set('Authorization', token);
        const requestBody = { label };

        return this.http.post(url, requestBody, { headers }).pipe(
            map((response: any) => {
                console.log('Etichetta eliminata con successo!');
                return response;
            }),
            catchError((error: any) => {
                return throwError(() => new Error(`Errore durante l'eliminazione dell'etichetta: ${error.status} ${error.statusText}`));
            })
        );
    }

    getLabels(): Observable<any> {
        const token = this.authService.getToken();
        if (!token) {
            return throwError(() => new Error('Token non trovato!'));
        }

        const url = `${this.baseUrl}/get`;
        const headers = new HttpHeaders().set('Authorization', token);

        return this.http.get(url, { headers }).pipe(
            map((response: any) => {
                console.log('Etichette ottenute con successo!');
                return response;
            }),
            catchError((error: any) => {
                return throwError(() => new Error(`Errore durante il recupero delle etichette: ${error.status} ${error.statusText}`));
            })
        );
    }
}