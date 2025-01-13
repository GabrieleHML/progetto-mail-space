import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FolderService } from '../../services/folder.service';
import { NotificationService } from '../../services/notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-folder',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './add-folder.component.html',
})
export class AddFolderComponent {
    protected form: FormGroup = new FormGroup({
        folderName: new FormControl('', Validators.required)
    });

    constructor(
        private dialogRef: MatDialogRef<AddFolderComponent>,
        private folderService: FolderService,
        private notificationService: NotificationService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    onAddFolder() {
        if (this.form.valid) {
            const folderName = this.form.value.folderName;
            this.folderService.addFolder(folderName).subscribe({
                next: () => {
                    this.notificationService.show('Cartella aggiunta con successo!', 'OK');
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Errore durante l\'aggiunta della cartella:', err);
                    this.notificationService.show('Errore durante l\'aggiunta della cartella', 'OK');
                }
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
