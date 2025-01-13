import { Router } from '@angular/router';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';

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
    ReactiveFormsModule,
    CommonModule,
    NgIf
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
    private router: Router,
    private notifica: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmationCodeComponent>
  ) {}

  // CONFERMA PER LA REGISTRAZIONE COMPLETA 
  onConfirmSignUp() {
    if (this.form.invalid) {
      this.notifica.show('Compila correttamente il modulo.', 'Chiudi');
      return;
    }

    const { username, confirmationCode } = this.form.value;

    this.authService.confirmSignUp(username, confirmationCode).subscribe({
      next: (response) => {
        console.log('Conferma avvenuta con successo: ', response);
        this.dialogRef.close();
        this.router.navigate(['/'], {
          state: { message: 'Registrazione confermata con successo!', action: 'OK' }
        });
      },
      error: (error) => {
        console.error('Errore durante la conferma: ', error);
        this.notifica.show('Errore durante la conferma. Verifica il codice e riprova', 'Chiudi');
      }
    });
  }
}
