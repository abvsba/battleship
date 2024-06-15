import { Component } from '@angular/core';
import {UserRestService} from "../../../service/userRest.service";
import {User} from "../../../shared/models/user.model";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-delete-confirm-dialog',
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.css']
})
export class DeleteConfirmDialogComponent {
  message = 'Confirm delete';
  user: User;

  constructor(private auth : UserRestService, private snackBar: MatSnackBar,
              private dialog: MatDialog, private router: Router) {
    this.user = this.auth.getUser();
  }

  confirmDelete() {
    this.auth.deleteUser(this.user.id).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.router.navigate(['/home']).then(() => {
          this.auth.logout();
        });
        this.snackBar.open('User delete successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }
}
