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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { NotificationService } from '../../services/notification.service';
import { EmailService } from '../../services/email.service';
import { FolderService } from '../../services/folder.service';

import { Email } from '../../models/email';
import { Folder } from '../../models/folder';
import { AddFolderComponent } from '../add-folder/add-folder.component';
import { LabelsService } from '../../services/labels.service';


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
    MatSelectModule,
    MasSplitButtonModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatDialogModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    //RouterLinkActive, disattivato per warning
    CommonModule,
    NgFor,
  ],
  templateUrl: './mail-viewer.component.html',
})
export class MailViewerComponent {
  emails: Email[] = [];
  paginatedEmails: Email[] = [];
  selectedEmails: Set<Email> = new Set<Email>();
  folders: Folder[] = [];
  selectedFolder: Folder | null = null;
  selectedOption: string = 'tutto';
  searchText: string = '';
  pageSize: number = 5;
  pageIndex: number = 0;
  isLoadingEmails: boolean = false;
  isLoadingFolders: boolean = false;
  allSelected: boolean = false;
  labels: string[] = ['ciao'];

  protected form: FormGroup = new FormGroup({
    cerca: new FormControl('', Validators.required)
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private notifica: NotificationService,
    private emailService: EmailService,
    private dialog: MatDialog,
    private folderService: FolderService,
    private labelsService: LabelsService
  ) { }

  ngOnInit(): void {
    this.isLoadingEmails = true;
    this.getUserEmailsOrSearchBy(0);
    this.isLoadingFolders = true;
    this.getFolders();
    this.handleStateMessage();
    this.getLabels();
  }

  handleStateMessage(): void {
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
      this.uploadEmailFile(file);
    } else {
      console.error('Nessun file selezionato');
      this.notifica.show("Nessun file selezionato", "OK");
    }
  }

  uploadEmailFile(file: File): void {
    if (file.name.toLowerCase().endsWith('.eml')) {
      this.emailService.uploadEmailFile(file).subscribe({
        next: (data) => {
          console.log('File caricato con successo!', data);
          this.notifica.show("File .eml caricato con successo!", "OK");
          this.getUserEmailsOrSearchBy(0);
        },
        error: (err) => {
          console.error('Errore caricamento file:', err);
          this.notifica.show("Errore nel caricamento del file", "OK");
        }
      });
    } else {
      console.error('Il file selezionato non ha l\'estensione .eml');
      this.notifica.show("Estensione del file non valida", "OK");
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

  getUserEmailsOrSearchBy(option: number, word?: string): void {
    this.pageIndex = 0; // Reset paginator
    this.isLoadingEmails = true;
    this.emailService.getUserEmailsOrSearchBy(option, word).subscribe({
      next: (data) => {
        this.emails = data;
        this.updatePaginatedEmails();
        if (this.paginator) {
          this.paginator.length = this.emails.length;
        }
        this.isLoadingEmails = false;
      },
      error: (err) => {
        console.error('Errore durante il recupero delle email:', err);
        this.isLoadingEmails = false;
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

  toggleAllSelection(checked: boolean): void {
    this.allSelected = checked;
    if (checked) {
      this.selectedEmails = new Set(this.paginatedEmails);
    } else {
      this.selectedEmails.clear();
    }
  }

  toggleEmailSelection(email: Email, checked: boolean): void {
    if (checked) {
      this.selectedEmails.add(email);
    } else {
      this.selectedEmails.delete(email);
    }
    this.allSelected = this.selectedEmails.size === this.paginatedEmails.length;
  }

  deleteEmails(): void {
    const emailIds = Array.from(this.selectedEmails).map(email => email.id);
    this.emailService.deleteEmails(emailIds).subscribe({
      next: () => {
        this.emails = this.emails.filter(email => !this.selectedEmails.has(email));
        this.updatePaginatedEmails();
        this.selectedEmails.clear();
        this.allSelected = false;
        this.notifica.show("Email cancellate con successo!", "OK");
      },
      error: (err) => {
        console.error('Errore durante la cancellazione delle email:', err);
        this.notifica.show("Errore durante la cancellazione delle email", "OK");
      }
    });
  }

  deleteFolder(folderId: number): void {
    this.folderService.deleteFolder(folderId).subscribe({
      next: () => {
        this.folders = this.folders.filter(folder => folder.id !== folderId);
        this.notifica.show("Cartella eliminata con successo!", "OK");
      },
      error: (err) => {
        console.error('Errore durante l\'eliminazione della cartella:', err);
        this.notifica.show("Errore durante l'eliminazione della cartella", "OK");
      }
    });
  }

  addEmailsToFolder(folderId: number): void {
    const emailIds = Array.from(this.selectedEmails).map(email => email.id);
    this.folderService.addEmailsToFolder(emailIds, folderId).subscribe({
      next: () => {
        this.notifica.show("Email aggiunte alla cartella con successo!", "OK");
        this.selectedEmails.clear();
        this.allSelected = false;
      },
      error: (err) => {
        console.error('Errore durante l\'aggiunta delle email alla cartella:', err);
        this.notifica.show("Errore durante l'aggiunta delle email alla cartella", "OK");
      }
    });
  }

  getEmailsFromFolder(folder: Folder): void {
    this.selectedEmails.clear();
    this.allSelected = false;
    this.selectedFolder = folder;
    this.isLoadingEmails = true;
    this.folderService.getEmailsFromFolder(folder.id).subscribe({
      next: (data) => {
        this.emails = data;
        this.updatePaginatedEmails();
        if (this.paginator) {
          this.paginator.length = this.emails.length;
        }
        this.isLoadingEmails = false;
      },
      error: (err) => {
        console.error('Errore durante il recupero delle email dalla cartella:', err);
        this.isLoadingEmails = false;
      }
    });
  }

  removeEmailsFromFolder(): void {
    const emailIds = Array.from(this.selectedEmails).map(email => email.id);
    this.folderService.removeEmailsFromFolder(emailIds, this.selectedFolder!.id).subscribe({
      next: () => {
        this.emails = this.emails.filter(email => !this.selectedEmails.has(email));
        this.updatePaginatedEmails();
        this.selectedEmails.clear();
        this.allSelected = false;
        this.notifica.show("Email rimosse dalla cartella con successo!", "OK");
      },
      error: (err) => {
        console.error('Errore durante la rimozione delle email dalla cartella:', err);
        this.notifica.show("Errore durante la rimozione delle email dalla cartella", "OK");
      }
    });
  }

  getFolders(): void {
    this.folderService.getFolders().subscribe({
      next: (data) => {
        this.folders = data;
        this.isLoadingFolders = false;
      },
      error: (err) => {
        console.error('Errore durante il recupero delle cartelle:', err);
        this.isLoadingFolders = false;
      }
    });
  }

  openAddFolderDialog(): void {
    const dialogRef = this.dialog.open(AddFolderComponent, {
      width: '400px', 
      height: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFolders();
      }
    });
  }

  clearSelectedFolder(): void {
    this.selectedFolder = null;
    this.getUserEmailsOrSearchBy(0);
  }

  deselectChip(event: Event): void {
    const chip = event.target as HTMLElement;
    chip.classList.remove('mat-chip-selected');
  }

  getLabels(): void {
    this.labelsService.getLabels().subscribe({
      next: (data) => {
        this.labels = data;
      },
      error: (err) => {
        console.error('Errore durante il recupero delle etichette:', err);
      }
    });
  }
}
