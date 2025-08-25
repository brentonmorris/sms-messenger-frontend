import { Routes } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { MessagesPageComponent } from "./messages-page.component";
import { authGuard } from "./auth/auth.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/messages", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  {
    path: "messages",
    component: MessagesPageComponent,
    canActivate: [authGuard],
  },
  { path: "**", redirectTo: "/messages" },
];
