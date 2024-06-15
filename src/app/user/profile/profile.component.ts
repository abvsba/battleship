import { Component } from '@angular/core';
import {User} from "../../../shared/models/user.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserRestService} from "../../../service/userRest.service";
import {MatDialog} from "@angular/material/dialog";
import {DeleteConfirmDialogComponent} from "../delete-confirm-dialog/delete-confirm-dialog.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  user : User | undefined = undefined;
  triggerChangePassword : boolean = false;

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('',[Validators.required, Validators.minLength(4)])
  });

  constructor(private auth : UserRestService, private snackBar: MatSnackBar,
              private dialog: MatDialog, private router: Router) {
    this.user = this.auth.getUser();
  }

  logout() {
    this.router.navigate(['/']).then(() => {
      this.auth.logout();
    });
  }

  toggleChangePassword() {
    this.triggerChangePassword = !this.triggerChangePassword;
  }

  deleteUser() {
    this.dialog.open(DeleteConfirmDialogComponent);
  }


  changePassword(): void {
    let oldPassword = this.passwordForm.value.oldPassword!;
    let newPassword = this.passwordForm.value.newPassword!;

    this.auth.patchPassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully', 'Close', {
          duration: 3000,
        });
      },
    });
  }

}
