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

    getLabels(): Observable<string[]> {
        const token = this.authService.getToken();
        if (!token) {
            return throwError(() => new Error('Token non trovato!'));
        }

        const url = `${this.baseUrl}/get`;
        const headers = new HttpHeaders().set('Authorization', token);

        return this.http.get<string[]>(url, { headers }).pipe(
            map((response: string[]) => {
                console.log('Etichette ottenute con successo!');
                return response;
            }),
            catchError((error: any) => {
                return throwError(() => new Error(`Errore durante il recupero delle etichette: ${error.status} ${error.statusText}`));
            })
        );
    }

    updateLabels(toBeRemoved: string[], toBeAdded :string[]): Observable<any> {
        const token = this.authService.getToken();
        if (!token) {
            return throwError(() => new Error('Token non trovato!'));
        }

        const url = `${this.baseUrl}/update`;
        const headers = new HttpHeaders().set('Authorization', token);
        const requestBody = { toBeRemoved, toBeAdded };

        return this.http.post<any>(url, requestBody, { headers }).pipe(
            map((response: any) => {
                console.log('Etichette aggiornate con successo!');
                return response;
            }),
            catchError((error: any) => {
                console.log('Errore updateLabels() in labels.service.ts')
                return throwError(() => new Error(`Errore durante l'aggiornamento delle etichette: ${error.status} ${error.statusText}`));
            })
        );
    }
}