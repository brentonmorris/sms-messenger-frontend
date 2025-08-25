import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import {
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn,
} from "@angular/common/http";
import { JwtHelperService, JWT_OPTIONS } from "@auth0/angular-jwt";
import { environment } from "../environments/environment";

import { routes } from "./app.routes";

// Custom JWT interceptor
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("jwt_token");
  const jwtHelper = new JwtHelperService();

  // Don't add token to login requests
  const isLoginRequest = req.url.includes("/api/login");

  // Check if request is to our API domain
  const apiDomain = environment.apiUrl
    .replace(/^https?:\/\//, "")
    .replace("/api", "");
  const isApiRequest = req.url.includes(apiDomain);

  if (
    token &&
    !isLoginRequest &&
    isApiRequest &&
    !jwtHelper.isTokenExpired(token)
  ) {
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return next(authReq);
  }

  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    {
      provide: JWT_OPTIONS,
      useValue: {
        tokenGetter: () => localStorage.getItem("jwt_token"),
        allowedDomains: [
          environment.apiUrl.replace(/^https?:\/\//, "").replace("/api", ""),
        ],
        disallowedRoutes: [environment.apiUrl.replace("/api", "/api/login")],
      },
    },
    JwtHelperService,
  ],
};
