import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription, timer } from "rxjs";
import { switchMap } from "rxjs/operators";
import { MessageService } from "../message/message.service";
import { MessageHistoryItem } from "../message/message.interface";
import { environment } from "../../environments/environment";
import { format } from "date-fns";

@Component({
  selector: "app-message-history",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./message-history.component.html",
  styleUrl: "./message-history.component.css",
})
export class MessageHistoryComponent implements OnInit, OnDestroy {
  messages: MessageHistoryItem[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = "";
  private refreshSubscription?: Subscription;
  private pollingSubscription?: Subscription;
  private readonly pollingInterval = 5000; // Poll every 5 seconds

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadMessages();

    // Subscribe to refresh notifications
    this.refreshSubscription =
      this.messageService.messageHistoryRefresh$.subscribe(() => {
        this.loadMessages();
      });

    // Start automatic polling for message status updates
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = "";

    this.messageService.getMessageHistory().subscribe({
      next: (messages) => {
        this.messages = messages.sort((a, b) => {
          // Use created_at if available, otherwise use timestamp
          const dateA = new Date(a.created_at || a.timestamp).getTime();
          const dateB = new Date(b.created_at || b.timestamp).getTime();
          return dateB - dateA; // Sort newest first
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.hasError = true;
        this.isLoading = false;
        this.setErrorMessage(error);
      },
    });
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return format(date, "EEEE, dd-MMM-yy HH:mm:ss 'UTC'");
  }

  getCharacterCount(content: string): string {
    return `${content.length}/250`;
  }

  private startPolling(): void {
    // Start polling after initial load, then every 5 seconds
    this.pollingSubscription = timer(this.pollingInterval, this.pollingInterval)
      .pipe(switchMap(() => this.messageService.getMessageHistory()))
      .subscribe({
        next: (messages) => {
          this.messages = messages.sort((a, b) => {
            const dateA = new Date(a.created_at || a.timestamp).getTime();
            const dateB = new Date(b.created_at || b.timestamp).getTime();
            return dateB - dateA;
          });
          this.hasError = false;
          this.errorMessage = "";
        },
        error: (error) => {
          // Only show errors if this is the initial load or there are no messages loaded
          if (this.messages.length === 0) {
            this.hasError = true;
            this.setErrorMessage(error);
          }
          // For polling errors with existing data, just log to console
          console.warn("Polling update failed:", error);
        },
      });
  }

  private setErrorMessage(error: any): void {
    if (error.status === 0) {
      this.errorMessage = `Unable to connect to server. Make sure Rails server is running on ${environment.apiUrl.replace("/api", "")}`;
    } else if (error.status === 404) {
      this.errorMessage =
        "Messages endpoint not found. Check your Rails routes.";
    } else if (error.status >= 500) {
      this.errorMessage = "Server error. Check Rails server logs for details.";
    } else {
      this.errorMessage = `Error loading messages: ${error.message || "Unknown error"}`;
    }
  }

  refreshMessages(): void {
    this.loadMessages();
  }

  trackByMessageId(index: number, message: MessageHistoryItem): string {
    return message.id;
  }

  getStatusDisplayText(status?: string): string {
    if (!status) return "Unknown";

    switch (status) {
      case "queued":
        return "Queued";
      case "sending":
        return "Sending";
      case "sent":
        return "Sent";
      case "done":
        return "Delivered";
      case "failed":
        return "Failed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  getStatusIcon(status?: string): string {
    if (!status) return "";

    switch (status) {
      case "queued":
        return "⏳";
      case "sending":
        return "📤";
      case "sent":
        return "✈️";
      case "done":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  }

  getFormattedPhoneNumber(): string {
    // Hardcoded formatted phone number for display
    return "+1 (877) 780-4236";
  }

  getDefaultErrorMessage(): string {
    return `Make sure the Rails server is running on ${environment.apiUrl.replace("/api", "")}`;
  }
}
