import { CommonModule } from '@angular/common';
import { afterNextRender, Component, EventEmitter, inject, Injector, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, FontAwesomeModule, MatButtonModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Output() contentEmitter = new EventEmitter<string>();
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;
  private _injector = inject(Injector);
  content!: string;
  sendIcon;

  constructor() {
    this.sendIcon = faArrowUp;
  }

  emitContent() {
    this.contentEmitter.emit(this.content);
    this.content = '';
  }

  triggerResize() {
    afterNextRender(
      () => {
        this.autosize.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      },
    );
  }

  get inputButtonDisabled() {
    return this.content === undefined || this.content.trim().length === 0;
  }
}
