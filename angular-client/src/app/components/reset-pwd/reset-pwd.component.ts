import { CommonModule, NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { NotificationService } from '../../services/notification.service';
import { MatInputModule } from "@angular/material/input";
import { MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'app-reset-pwd',
    standalone: true,
    imports:[
        MatButton,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        NgIf
    ],
    templateUrl: './reset-pwd.component.html'
})
export class ResetPwdComponent {
    resetPwdForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private dialogRef: MatDialogRef<ResetPwdComponent>,
        private notifica: NotificationService,
    ) {
        this.resetPwdForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])/)
            ]]
        });
    }

    onSubmit() {
        if (this.resetPwdForm.valid) {
            const { oldPassword, newPassword } = this.resetPwdForm.value;
            this.authService.changePassword(oldPassword, newPassword).subscribe({
                next: () => {
                    console.log('Password modificata con successo!');
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Errore durante la modifica della password: ', err);
                    this.notifica.show('Errore durante la modifica della password', err.error?.message || '');
                    this.dialogRef.close(false);
                }
            });
        }
    }
}