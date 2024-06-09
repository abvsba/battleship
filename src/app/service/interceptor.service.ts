import {Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserRestService} from "./userRest.service";

@Injectable({
  providedIn: 'root',
})

@Injectable()
export class InterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const modified = req.clone({
      setHeaders: {'Content-Type': 'application/json'},
    });
    return next.handle(modified);
  }
}

@Injectable()
export class SecondInterceptor implements HttpInterceptor {
  constructor(private auth: UserRestService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    if (!token) {
      return next.handle(req);
    }
    return next.handle(req.clone({
      setHeaders: {Authorization: token}
      })
    );
  }
}
