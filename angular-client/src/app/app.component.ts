import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NotificationService } from './services/notification.service';

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
    CommonModule
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{
  title = 'angular-client';

  isLoggedIn$!: Observable<boolean>;  // Observable che gestisce lo stato di autenticazione
  currentUser$!: Observable<string | null>;  // Observable per l'utente corrente 
  username!: string | null;

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
}
