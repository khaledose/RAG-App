import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { SessionService } from '../session/services/session/session.service';
import { ChatService } from './services/chat.service';
import { ChatMessageComponent } from "./chat-message/chat-message.component";
import { ChatInputComponent } from "./chat-input/chat-input.component";
import { Message, MessageAction, MessageSender, MessageState } from './chat-message/chat-message.model';
import { catchError, finalize, of, tap } from 'rxjs';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, MarkdownModule, ChatMessageComponent, ChatInputComponent],
})
export class ChatComponent implements OnInit, OnChanges  {
  @Input({ required: true }) context!: string;
  @Input({ required: true }) sessionId!: string;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: { content: Message; action: MessageAction }[] = [];

  constructor(
    private sessionService: SessionService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.initializeChat();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['context'] || changes['sessionId']) {
      this.initializeChat();
    }
  }

  onMessageSent(newMessage: string): void {
    this.addMessage(newMessage, MessageSender.HUMAN);
    this.sendMessageToBot(newMessage);
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  private initializeChat(): void {
    if (this.context && this.sessionId) {
      this.loadSessionMessages();
      this.buildChat();
    }
  }

  private loadSessionMessages(): void {
    this.sessionService.getSession(this.sessionId).pipe(
      tap((response: any) => {
        this.messages = response.messages.map((message: any) => ({
          content: {
            text: message.content,
            sender: message.type === 'human' ? MessageSender.HUMAN : MessageSender.BOT,
            type: MessageState.SUCCESS,
          },
          action: {
            loading: false,
            typing: false,
          },
        }));
      }),
      catchError((error) => {
        console.error('Error loading session messages:', error);
        return of(null);
      })
    ).subscribe();
  }

  private buildChat(): void {
    this.chatService.buildChat(this.context).pipe(
      catchError((error) => {
        console.error('Error building chat:', error);
        return of(null);
      })
    ).subscribe();
  }

  private addMessage(text: string, sender: MessageSender): void {
    this.messages.push({
      content: {
        text,
        sender,
        type: MessageState.SUCCESS,
      },
      action: {
        typing: false,
        loading: false,
      },
    });
  }

  private sendMessageToBot(message: string): void {
    const botMessageIndex = this.messages.length;
    this.messages.push({
      content: {
        text: '',
        sender: MessageSender.BOT,
        type: MessageState.SUCCESS,
      },
      action: {
        loading: true,
        typing: false,
      },
    });

    this.chatService.chat(this.context, this.sessionId, message).pipe(
      tap((response: string) => {
        this.updateBotMessage(botMessageIndex, response);
      }),
      catchError((error) => {
        console.error('Error in chat service:', error);
        this.updateBotMessage(botMessageIndex, 'An error occurred', MessageState.ERROR);
        return of(null);
      }),
      finalize(() => {
        this.messages[botMessageIndex].action.loading = false;
      })
    ).subscribe();
  }

  private updateBotMessage(index: number, text: string, state: MessageState = MessageState.SUCCESS): void {
    if (this.messages[index]) {
      this.messages[index].content.text = text;
      this.messages[index].content.type = state;
      this.messages[index].action.loading = false;
      this.messages[index].action.typing = true;
    }
  }
}
