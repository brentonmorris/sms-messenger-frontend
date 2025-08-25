import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable, BehaviorSubject, throwError } from "rxjs";
import { map, catchError, tap, switchMap } from "rxjs/operators";
import { environment } from "../../environments/environment";

export interface User {
  id: string;
  email: string;
}

export interface LoginRequest {
  user: {
    email: string;
    password: string;
  };
}

export interface LoginResponse {
  user: User;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = "jwt_token";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router,
  ) {
    this.initializeAuthState();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      user: {
        email: email,
        password: password,
      },
    };

    return this.http
      .post(`${this.apiUrl}/login`, loginData, {
        observe: "response",
        responseType: "text",
      })
      .pipe(
        map((response) => {
          const authHeader = response.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            localStorage.setItem(this.tokenKey, token);
            return token;
          } else {
            throw new Error("No Authorization header found in response");
          }
        }),
        switchMap(() => this.getCurrentUser()),
        map((user) => ({ user })),
        catchError((error) => {
          this.clearAuthState();
          return throwError(() => error);
        }),
      );
  }

  logout(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/logout`).pipe(
      tap(() => this.clearAuthState()),
      catchError((error) => {
        // Clear local state even if server call fails
        this.clearAuthState();
        return throwError(() => error);
      }),
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        if (error.status === 401) {
          this.clearAuthState();
          this.router.navigate(["/login"]);
        }
        return throwError(() => error);
      }),
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const isExpired = token ? this.jwtHelper.isTokenExpired(token) : true;
    return token != null && !isExpired;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getTokenPayload(): any {
    const token = this.getToken();
    return token ? this.jwtHelper.decodeToken(token) : null;
  }

  getTokenExpirationDate(): Date | null {
    const token = this.getToken();
    return token ? this.jwtHelper.getTokenExpirationDate(token) : null;
  }

  private initializeAuthState(): void {
    if (this.isAuthenticated()) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          // User state is set in the tap operator
          // If we're on login page and authenticated, redirect to messages
          if (this.router.url === "/login") {
            this.router.navigate(["/messages"]);
          }
        },
        error: () => {
          this.clearAuthState();
          this.router.navigate(["/login"]);
        },
      });
    } else {
      this.clearAuthState();
      // Only navigate to login if we're not already there
      if (this.router.url !== "/login") {
        this.router.navigate(["/login"]);
      }
    }
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }
}
