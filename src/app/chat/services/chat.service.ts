import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8000/chat';

  constructor(private http: HttpClient) {}

  // Build a chat based on the context
  buildChat(contextName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/build`, { context_name: contextName });
  }

  // Perform a chat query (question)
  chat(contextName: string, sessionId: string, question: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, {
      context_name: contextName,
      session_id: sessionId,
      question: question,
    }, { responseType: 'text' });
  }
}
