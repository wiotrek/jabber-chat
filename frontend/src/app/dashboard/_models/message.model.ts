export interface MessageModel {
  id: string;
  content: string;
  senderUsername: string;
  createdAt: Date | string;
}
