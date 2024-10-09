import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './snack-bar.component.html',
})
export class SnackBarComponent {
  constructor(private snackBar: MatSnackBar) {}

  open(message: string, action: string, color: string = 'default') {

    const config: MatSnackBarConfig = {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [`snack-bar-${color}`]
    };

    this.snackBar.open(message, action, config);
  }
}
