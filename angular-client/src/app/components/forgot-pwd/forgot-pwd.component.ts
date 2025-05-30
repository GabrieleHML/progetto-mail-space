import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-pwd',
  standalone: true,
  imports: [
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgIf
  ],
  templateUrl: './forgot-pwd.component.html'
})
export class ForgotPwdComponent {
  primoForm: FormGroup;
  secondoForm: FormGroup;
  step: number = 1;

  constructor(
    private authService: AuthService,
    private notifica: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ForgotPwdComponent>
  ) {
    this.primoForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });

    this.secondoForm = new FormGroup({
      confirmationCode: new FormControl('', Validators.required),
      newPassword: new FormControl('', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])/)
      ])
    });
  }

  onRequestCode() {
    if (this.primoForm.invalid) {
      this.notifica.show('Inserisci un indirizzo email valido.', 'Chiudi');
      return;
    }

    const email = this.primoForm.get('email')?.value;
    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.step = 2;
        this.notifica.show('Codice di verifica inviato all\'email.', 'Chiudi');
      },
      error: (error) => {
        console.error('Errore durante la richiesta del codice: ', error);
        this.notifica.show('Errore durante la richiesta del codice. Riprova.', 'Chiudi');
      }
    });
  }

  onSubmit() {
    if (this.secondoForm.invalid) {
      this.notifica.show('Compila correttamente il modulo.', 'Chiudi');
      return;
    }

    const email = this.primoForm.get('email')?.value;
    const { confirmationCode, newPassword } = this.secondoForm.value;
    
    this.authService.resetPassword(email, confirmationCode, newPassword).subscribe({
      next: () => {
        this.dialogRef.close();
        this.notifica.show('Password reimpostata con successo!', 'Chiudi');
      },
      error: (error) => {
        console.error('Errore durante la reimpostazione della password: ', error);
        this.notifica.show('Errore durante la reimpostazione della password. Riprova.', 'Chiudi');
      }
    });
  }
}