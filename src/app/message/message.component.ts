import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MessageService } from "./message.service";
import { TextMessage } from "./message.interface";

@Component({
  selector: "app-message",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./message.component.html",
  styleUrl: "./message.component.css",
})
export class MessageComponent {
  messageForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  isFadingOut = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {
    this.messageForm = this.fb.group({
      phoneNumber: ["+1 (877) 780-4236"], // hardcoded formatted value, no validators needed
      message: ["", [Validators.required, Validators.maxLength(160)]],
    });
  }

  onSubmit(): void {
    if (this.messageForm.valid) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;

      // Map form data to Rails backend structure
      // Form fields: phoneNumber -> recipient, message -> content
      const textMessage: TextMessage = {
        content: this.messageForm.value.message,
        sender: "web-app", // Static sender identifier for web requests
        recipient: this.stripPhoneNumberFormatting(
          this.messageForm.value.phoneNumber,
        ),
      };

      this.messageService.sendMessage(textMessage).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.isFadingOut = false;
          this.messageForm.reset();
          this.messageForm.patchValue({
            phoneNumber: "+1 (877) 780-4236",
          });
          // Trigger message history refresh
          this.messageService.triggerMessageHistoryRefresh();

          // Start fade-out after 2.5 seconds, then hide completely after transition
          setTimeout(() => {
            this.isFadingOut = true;
          }, 2500);

          setTimeout(() => {
            this.submitSuccess = false;
            this.isFadingOut = false;
          }, 3000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = true;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.messageForm.controls).forEach((key) => {
        this.messageForm.get(key)?.markAsTouched();
      });
    }
  }

  clearForm(): void {
    this.messageForm.reset();
    this.messageForm.patchValue({
      phoneNumber: "+1 (877) 780-4236",
    });
    this.submitSuccess = false;
    this.submitError = false;
    this.isFadingOut = false;
  }

  // Helper method to strip formatting from phone number for API submission
  private stripPhoneNumberFormatting(phoneNumber: string): string {
    // Remove all characters except digits and the leading +
    return phoneNumber.replace(/[^\d+]/g, "");
  }

  // Getter methods for easy access to form controls in template
  get phoneNumber() {
    return this.messageForm.get("phoneNumber");
  }

  get message() {
    return this.messageForm.get("message");
  }
}
