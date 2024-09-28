import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private baseUrl = 'http://localhost:8000/contexts';

  constructor(private http: HttpClient) {}

  // Get all contexts
  getAllContexts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }

  // Create a new context
  createContext(contextName: string): Observable<any> {
    return this.http.post(this.baseUrl, { context_name: contextName });
  }

  // Add a file to a context
  addFileToContext(contextName: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.baseUrl}/${contextName}/file/`, formData);
  }

  // Add a webpage to a context
  addWebpageToContext(contextName: string, url: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${contextName}/web/`, { url });
  }

  // Delete a context
  deleteContext(contextName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${contextName}/`);
  }
}
