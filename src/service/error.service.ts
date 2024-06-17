import { Injectable } from '@angular/core';
import {EMPTY, throwError} from 'rxjs';

import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private UNAUTHORIZED: number = 401;
  private CONNECTION_REFUSE: number = 0;

  private errorNotification = '';
  private showErrors: boolean = true;


  constructor(private snackBar: MatSnackBar) {}

  error(notification: string): this {
    this.errorNotification = notification;
    return this;
  }

  private showError(notification: string): void {
    if(this.showErrors) {
      if (this.errorNotification) {
        this.snackBar.open(this.errorNotification, 'Error', {duration: 5000});
        this.errorNotification = '';
      } else {
        this.snackBar.open(notification, 'Error', {duration: 5000});
      }
    }
    this.showErrors = true;
  }

  handleError(response: any): any {
    if (response.status === this.UNAUTHORIZED) {
      this.showError('Unauthorized');
      return EMPTY;
    } else if (response.status === this.CONNECTION_REFUSE) {
      this.showError('Connection refuse');
      return EMPTY;
    }
    else {
        try {
            this.showError('(' + response.status + '): ' + response.error.message);
            return throwError(() => response.error);
          }
         catch (e) {
          this.showError('Not response');
          return throwError(() => response.error);
        }
      }

  }
}
