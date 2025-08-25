import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import {
  TextMessage,
  MessageResponse,
  MessagePayload,
  MessageHistoryItem,
} from "./message.interface";

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;
  private messageHistoryRefresh = new Subject<void>();

  // Observable that components can subscribe to for refresh notifications
  messageHistoryRefresh$ = this.messageHistoryRefresh.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(textMessage: TextMessage): Observable<MessageResponse> {
    const payload: MessagePayload = {
      message: textMessage,
    };
    return this.http.post<MessageResponse>(this.apiUrl, payload);
  }

  getMessageHistory(): Observable<MessageHistoryItem[]> {
    return this.http.get<MessageHistoryItem[]>(this.apiUrl);
  }

  // Method to trigger message history refresh
  triggerMessageHistoryRefresh(): void {
    this.messageHistoryRefresh.next();
  }
}
