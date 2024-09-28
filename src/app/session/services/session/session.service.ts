import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseUrl = 'http://localhost:8000/sessions';

  constructor(private http: HttpClient) {}

  // Get all active session IDs
  getAllSessions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }

  // Get chat history of a specific session
  getSession(sessionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${sessionId}`);
  }

  // Create a new session and get its ID
  createSession(): Observable<any> {
    return this.http.post(this.baseUrl, {});
  }

  // Delete a session by ID
  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${sessionId}`);
  }

  // Clear all sessions
  clearSessions(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/`);
  }
}
