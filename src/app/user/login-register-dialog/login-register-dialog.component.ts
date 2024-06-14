import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UserRestService} from "../../../service/userRest.service";
import {MatDialog} from "@angular/material/dialog";
import {catchError, map, Observable, of} from "rxjs";

@Component({
  selector: 'app-login-register-dialog',
  templateUrl: './login-register-dialog.component.html',
  styleUrls: ['./login-register-dialog.component.css']
})
export class LoginRegisterDialogComponent implements OnInit{

  authMode: string = 'login';

  registerForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(private auth: UserRestService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required, this.checkUsername()),
      email: new FormControl('', [Validators.required, Validators.email], this.checkEmail()),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: new FormControl('', [Validators.required, this.checkPasswords()])
    });


    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  login(): void {
    const username = this.loginForm.value.username!;
    const password = this.loginForm.value.password!;

    this.auth.login(username, password).subscribe({
        next: () => {
          this.dialog.closeAll();
        },
        error: () => {
          this.loginForm.reset();
        }
      }
    );
  }

  register() {
    const user = {...this.registerForm.value};
    delete user.confirmPassword;

    this.auth.register(user).subscribe({
      next: () => {
        this.authMode = 'login';
      },
      error: () => {
        this.loginForm.reset();
      }
    });
  }

  checkUsername(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<any> => {
      return this.auth.getUsername(control.value).pipe(
        map(username => {
          return username ? {usernameExist: true} : of(null);
        }),
        catchError(() => {
          return of(null);
        })
      );
    };
  }

  checkEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<any> => {
      return this.auth.getEmail(control.value).pipe(
        map(email => {
          return email ? {emailExist: true} : of(null);
        }),
        catchError(() => {
          return of(null);
        })
      );
    };
  }


  checkPasswords(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.registerForm?.get("password")?.value === control.value ? null : {passwordNoMatch: true};
    }
  }
}
