import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MasSplitButtonModule } from '@material-spirit/ngx-split-button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../notification.service';
import { EmailService } from '../email.service';
import { CommonModule, NgFor } from '@angular/common';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-mail-viewer',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MasSplitButtonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    NgFor
  ],
  templateUrl: './mail-viewer.component.html',
})
export class MailViewerComponent {
  emails: any[] = [];
  selectedOption: string = 'tutto';
  searchText: string = '';
  protected form: FormGroup = new FormGroup({
    cerca: new FormControl('', Validators.required)
  });
  
  constructor(
    private notifica: NotificationService,
    private emailService: EmailService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // TODO riprende il metodo getEmails dopo aver configurato RDS
    // this.getEmails();
    const state = history.state;
    if (state && state['message']) {
      this.notifica.show(state['message'], state['action']);
    } else {
      console.log('Nessun messaggio da mostrare.');
    }
  }

  handleFileEml(): void {
    this.notifica.show("hai premuto .eml", "OK");
  }

  getEmails(): void {
    this.emailService.getEmails().subscribe({
      next: (data) => {
        this.emails = data;
      },
      error: (err) => {
        console.error('Errore durante il recupero delle email:', err);
      }
    });
  }

  // TODO
  onSearch() {
    var message: string = 'Stai cercando '+ this.searchText + ' in '+ this.selectedOption;
    this.notifica.show(message, "OK");
    console.log('Search for:', this.searchText, 'in', this.selectedOption);
    this.selectedOption= 'tutto';
    this. searchText = '';
  }
}
