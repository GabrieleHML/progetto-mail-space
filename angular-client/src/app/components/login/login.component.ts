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
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html'
})
export class LoginComponent {
  
  protected form: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(
    private authService: AuthService,
    private notifica: NotificationService,
    private router: Router
  ) {}

  onLogin() {
    if (this.form.invalid) {
      this.notifica.show('Compila tutti i campi richiesti', 'Chiudi');
      return;
    }
  
    const { username, password } = this.form.value;
  
    this.authService.signIn(username, password).subscribe({
      next: (response) => {
        console.log('Accesso avvenuto con successo:', response);
        this.notifica.show('Accesso avvenuto con successo!', 'Chiudi');
        this.router.navigate(['/mails']);
      },
      error: (error) => {
        this.notifica.show('Errore durante l\'accesso. Riprova', 'Chiudi');
        console.error('Errore durante l\'accesso:', error);
        this.form.reset();
      }
    });
  } 
}