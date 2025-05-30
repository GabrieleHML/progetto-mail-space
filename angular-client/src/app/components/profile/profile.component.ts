import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationCodeComponent } from '../confirmation-code/confirmation-code.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ResetPwdComponent } from '../reset-pwd/reset-pwd.component';
import { NotificationService } from '../../services/notification.service';
import { LabelsService } from '../../services/labels.service';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule}  from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatDialogModule,
    ConfirmationCodeComponent,
    ResetPwdComponent,
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  username!: string;
  email!: string;
  labels: string[] = [];
  originalLabels: string[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = true;

  constructor(
    private dialog: MatDialog,
    private notifica: NotificationService,
    private labelsService: LabelsService
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || '';
    this.getLabels();
  }

  openResetPwdDialog(): void {
    const dialogRef = this.dialog.open(ResetPwdComponent, {
        width: '500px',
        height: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
            this.notifica.show('La password è stata modificata con successo!', '');
        } else if (result === false) {
        } else {
            this.notifica.show('Modifica password annullata', '');
        }
    });
  }

  getLabels(): void {
    this.labelsService.getLabels().subscribe({
      next: (data: string[]) => {
        this.labels = data;
        this.originalLabels = [...data]; // shallow copy
      },
      error: (err) => {
        console.error('Errore durante il recupero delle etichette:', err);
      }
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.labels.push(value);
    }
    event.chipInput!.clear();
  }

  remove(label: string): void {
    const index = this.labels.indexOf(label);
    if (index >= 0) {
      this.labels.splice(index, 1);
    }
  }

  edit(label: string, event: MatChipEditedEvent): void {
    const value = event.value.trim();
    if (!value) {
      this.remove(label);
      return;
    }
    const index = this.labels.indexOf(label);
    if (index >= 0) {
      this.labels[index] = value;
    }
  }

  updateLabels(): void {
    // Determino quali tag sono da rimuovere
    const toBeRemoved = this.originalLabels.filter(
      oldLabel => !this.labels.includes(oldLabel)
    );

    // Determino quali tag sono da aggiungere
    const toBeAdded = this.labels.filter(
      newLabel => !this.originalLabels.includes(newLabel)
    );

    if(toBeRemoved.length === 0 && toBeAdded.length === 0) {
      this.notifica.show('Nessuna modifica alle etichette da salvare', 'OK');
      return;
    }

    this.labelsService.updateLabels(toBeRemoved, toBeAdded).subscribe({
      next: (response) => {
        console.log('Etichette aggiornate con successo!', response);
        this.notifica.show('Configurazione salvata correttamente', '');
        // Aggiorno originalLabels con il nuovo state
        this.originalLabels = [...this.labels];
      },
      error: (err) => {
        console.error('Errore durante l\'aggiornamento delle etichette:', err);
        this.notifica.show('Errore nel salvataggio delle etichette', 'OK');
      }
    });
  }
}
