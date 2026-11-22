export interface MessageSchema {
  id: string;
  content: string;
  senderUsername: string;
  createdAt: Date | string;
}
