import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faStop, faVolumeHigh, faClipboard, faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Message, MessageSender } from './chat-message.model';

@Component({
  selector: 'chat-message',
  standalone: true,
  imports: [CommonModule, MarkdownModule, FontAwesomeModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) message!: Message;
  @Input() isLoading = false;
  @Input() isTyping = false;
  @Output() scrollRequest = new EventEmitter<void>();

  content = '';
  playIcon = faVolumeHigh;
  clipboardIcon = faClipboard;
  private typingInterval?: number;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  get messageClass(): { [key: string]: boolean } {
    return {
      'ai': this.message.sender === MessageSender.BOT,
      'human': this.message.sender === MessageSender.HUMAN
    };
  }

  ngOnInit(): void {
    this.initializeTypingEffect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isTyping'] || changes['message']) {
      this.initializeTypingEffect();
    }
  }

  ngOnDestroy(): void {
    this.clearTypingInterval();
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.message.text)
      .then(() => {
        this.clipboardIcon = faClipboardCheck;
        setTimeout(() => {
          this.clipboardIcon = faClipboard;
          this.changeDetectorRef.detectChanges();
        }, 2000);
      })
      .catch(err => console.error('Failed to copy text: ', err));
  }

  readMessage(): void {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.playIcon = faVolumeHigh;
    } else {
      const utterance = new SpeechSynthesisUtterance(this.message.text);
      utterance.addEventListener('end', () => {
        this.playIcon = faVolumeHigh;
        this.changeDetectorRef.detectChanges();
      });
      window.speechSynthesis.speak(utterance);
      this.playIcon = faStop;
    }
  }

  private initializeTypingEffect(): void {
    this.clearTypingInterval();
    if (this.isTyping) {
      this.startTypingEffect(this.message.text);
    } else {
      this.content = this.message.text;
      this.requestScroll();
    }
  }

  private startTypingEffect(finalMessage: string): void {
    let index = 0;
    this.content = '';

    this.typingInterval = window.setInterval(() => {
      if (index < finalMessage.length) {
        this.content += finalMessage[index];
        index++;
        this.changeDetectorRef.detectChanges();
      } else {
        this.isTyping = false;
        this.clearTypingInterval();
      }
      this.requestScroll();
    }, 10);
  }

  private clearTypingInterval(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private requestScroll(): void {
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
      this.scrollRequest.emit();
    });
  }
}
