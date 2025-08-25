export interface TextMessage {
  content: string;
  sender: string;
  recipient: string;
  user_id?: string;
}

export interface MessagePayload {
  message: TextMessage;
}

export interface MessageResponse {
  id?: string;
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface MessageFormData {
  phoneNumber: string;
  message: string;
}

export interface MessageHistoryItem {
  id: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
  status?: "queued" | "sending" | "sent" | "done" | "failed";
  user_id?: string;
}

export interface MessageHistoryResponse {
  messages: MessageHistoryItem[];
  total: number;
}
