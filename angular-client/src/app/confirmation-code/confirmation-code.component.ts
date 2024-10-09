import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-code',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './confirmation-code.component.html'
})
export class ConfirmationCodeComponent {

  protected form: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    confirmationCode: new FormControl('', Validators.required)
  });

  constructor(
    private authService: AuthService, 
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationCodeComponent>
  ) {}

  // CONFERMA PER LA REGISTRAZIONE COMPLETA 
  onConfirmSignUp() {
    let username = this.form.value.username;
    let confirmationCode = this.form.value.confirmationCode;

    console.log('username: ',username ,' code: ',confirmationCode);

    this.authService.confirmSignUp(username, confirmationCode).subscribe({
      next: (response) => {
        console.log('Conferma avvenuta con successo: ', response);
        this.dialogRef.close();
        this.snackBar.open('Conferma avvenuta con successo!', 'Chiudi', {
          duration: 3000, 
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }, error: (error) => {
        console.error('Errore durante la conferma: ', error);
        this.snackBar.open('Errore durante la conferma. Verifica il codice e riprova', 'Chiudi', {
          duration: 3000, 
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }
}
