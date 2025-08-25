import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { MessageComponent } from "./message/message.component";
import { MessageHistoryComponent } from "./message-history/message-history.component";
import { AuthService, User } from "./auth/auth.service";

@Component({
  selector: "app-messages-page",
  standalone: true,
  imports: [CommonModule, MessageComponent, MessageHistoryComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="container mx-auto px-4">
        <!-- Header with title and logout button -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">MY SMS MESSENGER</h1>

          <!-- User info and logout button -->
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-600">Logged in as</p>
              <p class="text-sm font-medium text-gray-800">
                {{ currentUser?.email }}
              </p>
            </div>
            <button
              (click)="logout()"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Logout
            </button>
          </div>
        </div>

        <!-- Two-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <!-- Left column: New Message Form -->
          <div class="w-full">
            <app-message></app-message>
          </div>

          <!-- Right column: Message History -->
          <div class="w-full">
            <app-message-history></app-message-history>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Component-specific styles if needed */
      .focus-visible {
        outline: 2px solid theme("colors.blue.500");
        outline-offset: 2px;
      }
    `,
  ],
})
export class MessagesPageComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(["/login"]);
      },
      error: (error) => {
        // Even if server logout fails, user is logged out locally
        this.router.navigate(["/login"]);
      },
    });
  }
}
