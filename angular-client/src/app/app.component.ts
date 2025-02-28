import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NotificationService } from './services/notification.service';
import { ConfirmationCodeComponent } from './components/confirmation-code/confirmation-code.component';
import { ForgotPwdComponent } from './components/forgot-pwd/forgot-pwd.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSlideToggleModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule, 
    MatCardModule,
    CommonModule,
    LoginComponent,
    RegisterComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{
  title = 'angular-client';

  isLoggedIn$!: Observable<boolean>;  // Observable che gestisce lo stato di autenticazione
  currentUser$!: Observable<string | null>;  // Observable per l'utente corrente 
  username!: string | null;
  showLogin: boolean = true;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    public router: Router,
    private notifica: NotificationService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUser$ = this.authService.currentUser$;
    this.authService.currentUser$.subscribe(user => {
      this.username = user;
    });
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '400px',
      height: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (this.username) {
        this.notifica.show(`Benvenuto ${this.username}!`, '');
      }
    });
  }
  
  openRegisterDialog(): void {
    this.dialog.open(RegisterComponent, {
      width: '400px',
      height: '500px'
    });
  }

  openRegisterComponent(): void {
    this.router.navigate(['/register']);
  }

  toggleForm(): void {
    this.showLogin = !this.showLogin;
  }

  logout(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Logout effettuato');
          this.notifica.show("Ciao, alla prossima!", "");
          this.router.navigate(['/']);
        },
        error: err => console.error('Errore durante il logout', err)
      });
    }
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationCodeComponent, {
      width: '420px',
      height: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notifica.show('Registrazione completata con successo!', '');
      }
    });
  }

  openForgotPwdDialog(): void {
    const dialogRef = this.dialog.open(ForgotPwdComponent, {
      width: '400px',
      height: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notifica.show('Password reimpostata con successo!', '');
      }
    });
  }
}
