export interface Message {
  text: string;
  sender: MessageSender;
  type: MessageState;
}

export interface MessageAction {
  loading: boolean;
  typing: boolean;
}

export enum MessageState {
  ERROR,
  SUCCESS
}

export enum MessageSender {
  BOT,
  HUMAN
}
