import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EmailService } from '../services/email.service';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mail-uploader',
  standalone: true,
  imports: [MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatDividerModule,
    FormsModule, 
    ReactiveFormsModule,
  ],
  templateUrl: './mail-uploader.component.html'
})
export class MailUploaderComponent {

  protected form: FormGroup = new FormGroup({
    mittente: new FormControl('', Validators.required),
    oggetto: new FormControl('', Validators.required),
    testo: new FormControl('', Validators.required)
  });

  constructor(
    private emailService: EmailService,
    private notifica: NotificationService,
    private router: Router
  ) {}
  
  uploadMail(): void {
    const { mittente, oggetto, testo } = this.form.value;

    console.log(this.form.value);

    this.emailService.uploadEmail(mittente, oggetto, testo).subscribe({
      next: (response) => {
        this.handleSuccessResponse(response);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }
  
  private handleSuccessResponse(response: any): void {
    this.notifica.show('Caricamento avvenuto con successo!', 'OK');
    this.router.navigate(['/mails'], {
      state: { message: 'Caricamento della mail avvenuto con successo!', action: 'OK' }
    });
  }
  
  private handleError(error: any): void {
    this.notifica.show('Errore nel caricamento della mail. Riprova', 'Chiudi');
    console.error('Caricamento fallito, errore: ', error);
  }
}
