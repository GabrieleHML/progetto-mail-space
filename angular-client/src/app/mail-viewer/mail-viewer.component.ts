import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatListModule } from '@angular/material/list';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { CommonModule, NgFor } from '@angular/common';
import { Email } from '../models/email';

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
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
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
  emails: Email[] = []
  selectedOption: string = 'tutto';
  searchText: string = '';
  protected form: FormGroup = new FormGroup({
    cerca: new FormControl('', Validators.required)
  });
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  paginatedEmails: Email[] = [];
  pageSize: number = 5;
  pageIndex: number = 0;
  isLoading: boolean = false;

  constructor(
    private notifica: NotificationService,
    private emailService: EmailService,
  ) { }


  ngOnInit(): void {
    this.isLoading = true;
    this.getUserEmailsOrSearchBy(0);
    const state = history.state;
    if (state && state['message']) {
      this.notifica.show(state['message'], state['action']);
    } else {
      console.log('Nessun messaggio da mostrare.');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // verifica l'estensione del file
      if (file.name.toLowerCase().endsWith('.eml')) {
        this.emailService.uploadEmailFile(file).subscribe({
          next: (data) => {
            console.log('File caricato con successo!', data);
            this.notifica.show("File .eml caricato con successo!", "OK");
          },
          error: (err) => {
            console.error('Errore caricamento file:', err);
            this.notifica.show("Errore nel caricamento del file", "OK");
          }
        });
      } else {
        console.error('Il file selezionato non ha l\'estensione .eml');
        this.notifica.show("Estensione del file non valida","OK");
      }
    } else {
      console.error('Nessun file selezionato');
      this.notifica.show("Nessun file selezionato", "OK");
    }
  }

  getSearchOptionValue(option: string): number {
    const optionMap: { [key: string]: number } = {
      'all': 1,
      'sender': 2,
      'topic': 3
    };
    return optionMap[option] ?? 4;
  }
  
  /* @param option: 
   * 0 getAll, 
   * 1 searchByAll, 
   * 2 searchBySender, 
   * 3 searchByTopic, 
   * 4 searchByUsedTerms
  */
  getUserEmailsOrSearchBy(option: number, word?: string): void {
    this.pageIndex = 0; // Reset paginator
    this.isLoading = true;
    this.emailService.getUserEmailsOrSearchBy(option, word).subscribe({
      next: (data) => {
        this.emails = data;
        this.updatePaginatedEmails();
        if (this.paginator) {
          this.paginator.length = this.emails.length;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore durante il recupero delle email:', err);
        this.isLoading = false;
      }
    });
  }

  updatePaginatedEmails(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmails = this.emails.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedEmails();
  }
}
