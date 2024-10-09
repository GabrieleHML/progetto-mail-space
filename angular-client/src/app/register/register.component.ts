import { Component, Inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { ConfirmationCodeComponent } from '../confirmation-code/confirmation-code.component';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  protected form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirm: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  constructor(
    public dialog: MatDialog, 
    private authService: AuthService, 
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private dialogRef: MatDialogRef<RegisterComponent>
  ) { }

  openConfirmationDialog(): void {
    this.dialog.open(ConfirmationCodeComponent, {
      width: '400px',
      height: '400px'
    });
  }

  onSignUp(){
    let email = this.form.value.email;
    let username = this.form.value.username;
    let password = this.form.value.password;
    let confirm = this.form.value.confirm;

    console.log('email: ',email,' username: ',username,' password1: ',password,' password2: ',confirm); // FIXME debug log

    if (password !== confirm) {
      this.snackBar.open('Le password non corrispondono. Riprova.', 'Chiudi', {
        duration: 3000, 
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }

    this.authService.signUp(username, password, email).subscribe({
      next: (response) => {
        console.log('Registrazione avvenuta con successo:', response);
        this.dialogRef.close();
        this.snackBar.open('Registrazione avvenuta con successo!', 'Chiudi', {
          duration: 3000, 
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.openConfirmationDialog();
      }, error: (error) => {
        this.snackBar.open('Errore durante la registrazione. Riprova', 'Chiudi', {
          duration: 3000, 
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        console.error('Errore durante la registrazione:', error);
      }
    });
  }
}