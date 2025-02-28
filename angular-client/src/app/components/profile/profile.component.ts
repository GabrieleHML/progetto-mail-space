import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationCodeComponent } from '../confirmation-code/confirmation-code.component';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ResetPwdComponent } from '../reset-pwd/reset-pwd.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatDialogModule,
    ConfirmationCodeComponent,
    CommonModule,
    MatCardModule,
    ResetPwdComponent
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  username!: string;
  email!: string;
  isConfirmed$!: Observable<boolean>;

  constructor(
    private authService: AuthService, 
    private dialog: MatDialog,
    private notifica: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.getUserDetails().subscribe(details => {
      this.username = details.username;
      this.email = details.email;
    });
    this.isConfirmed$ = this.authService.isAccountConfirmed();
  }

  openResetPwdDialog(): void {
      const dialogRef = this.dialog.open(ResetPwdComponent, {
        width: '500px',
        height: '400px'
      });
  
      dialogRef.afterClosed().subscribe(result => {
          this.notifica.show('Password modificata con successo!', '');
      });
    }
}
