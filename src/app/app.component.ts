import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { StylesService } from '../styles/styles.service';
import { ContextService } from './context/services/context/context.service';
import { SessionService } from './session/services/session/session.service';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { MatButtonModule } from '@angular/material/button';
import { catchError, forkJoin, Observable, Subscription, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, ChatComponent, MatButtonModule, FormsModule],
  standalone: true,
})
export class AppComponent {
  contexts: string[] = [];
  sessions: string[] = [];
  currentContext!: string;
  currentSession!: string;
  private sessionStorageKey: string = "CHAT_SESSION";
  private contextStorageKey: string = "CHAT_CONTEXT";
  private subscription: Subscription = new Subscription();

  constructor(
    private _contextService: ContextService,
    private _sessionService: SessionService,
    private _localStorageService: LocalStorageService,
    private stylesService: StylesService,
  ) {}

  ngOnInit(): void {
    this.currentContext = this._localStorageService.getItem(this.contextStorageKey);
    this.subscription.add(this.initializeApp().subscribe());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onContextChanged(): void {
    this._localStorageService.setItem(this.contextStorageKey, this.currentContext);
  }

  onNewChat(): void {
    this._sessionService.deleteSession(this.currentSession).pipe(
      tap(() => {
        this._localStorageService.removeItem(this.sessionStorageKey);
      }),
      switchMap(() => this.initializeChat()),
      catchError((error) => {
        console.error('An error occurred while removing session:', error);
        return [];
      })
    ).subscribe();
  }

  private initializeApp(): Observable<void> {
    return forkJoin({
      contexts: this._contextService.getAllContexts(),
      sessions: this._sessionService.getAllSessions()
    }).pipe(
      tap(({ contexts, sessions }) => {
        this.contexts = [...contexts];
        this.sessions = [...sessions];
      }),
      switchMap(() => this.initializeChat()),
      catchError((error) => {
        console.error('An error occurred during initialization:', error);
        return [];
      })
    );
  }

  private initializeChat(): Observable<void> {
    this.currentSession = this._localStorageService.getItem(this.sessionStorageKey);
    if (this.currentSession === null || !this.sessions.includes(this.currentSession)) {
      return this._sessionService.createSession().pipe(
        tap((newSession) => {
          this.currentSession = newSession;
          this._localStorageService.setItem(this.sessionStorageKey, newSession);
        }),
        catchError((error) => {
          console.error('An error occurred while creating a new session:', error);
          return [];
        })
      );
    }
    return new Observable<void>((observer) => {
      observer.next();
      observer.complete();
    });
  }

  toggleDarkTheme(): void {
    this.stylesService.onThemeChanged();
  }
}
