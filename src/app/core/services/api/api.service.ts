import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
   providedIn: 'root',
})
export class ApiService {
   private baseUrl = environment.apiUrl;
   private http = inject(HttpClient);

   private getHeaders(customHeaders?: Record<string, string>): HttpHeaders {
      let headers = new HttpHeaders({
         'Content-Type': 'application/json',
      });

      if (customHeaders) {
         for (const [key, value] of Object.entries(customHeaders)) {
            headers = headers.set(key, value);
         }
      }
      return headers;
   }

   get<T>(endpoint: string, params?: HttpParams, headers?: Record<string, string>): Observable<T> {
      return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
         headers: this.getHeaders(headers),
         params,
         withCredentials: true,
      });
   }

   post<T>(endpoint: string, body: any, headers?: Record<string, string>): Observable<T> {
      return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
         headers: this.getHeaders(headers),
         withCredentials: true
      });
   }

   put<T>(endpoint: string, body: any, headers?: Record<string, string>): Observable<T> {
      return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, {
         headers: this.getHeaders(headers),
         withCredentials: true,
      });
   }

   delete<T>(endpoint: string, headers?: Record<string, string>): Observable<T> {
      return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
         headers: this.getHeaders(headers),
         withCredentials: true,
      });
   }
}