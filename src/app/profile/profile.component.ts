import { Component } from '@angular/core';
import {User} from "../../shared/models/user.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserRestService} from "../../service/userRest.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  user! : User;
  triggerChangePassword : boolean = false;

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('',[Validators.required, Validators.minLength(4)])
  });

  constructor(private auth : UserRestService, private snackBar: MatSnackBar) {
    this.user = this.auth.getUser();
  }


  logout() {
    this.auth.logout();
  }


  deleteUser() {
    this.auth.deleteUser(this.user.id).subscribe();
  }


  changePassword(): void {
    let oldPassword = this.passwordForm.value.oldPassword!;
    let newPassword = this.passwordForm.value.newPassword!;

    this.auth.patchPassword(this.user.id, oldPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        if (error.status === 401) {
          this.snackBar.open('The old password is incorrect', 'Close', {
            duration: 3000,
          });
        }
      },
    });
  }

}
