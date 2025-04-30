import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NotificationService } from "../../services/notification.service";
import { EmailService } from "../../services/email.service";
import { Email } from "../../models/email";

@Component({
    selector: "app-search",
    standalone: true,
    imports: [
        MatToolbarModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatInputModule,
        CommonModule,
        FormsModule
    ],
    templateUrl: "./search.component.html"
})
export class SearchComponent {
    @Output() emailsFound = new EventEmitter<Email[]>();

    searchText: string = "";
    sender: string = "";
    subject: string = "";
    body_words: string = "";
    dropdownOpen: boolean = false;
    constructor(
        private notifica: NotificationService, 
        private elementRef: ElementRef,
        private emailService: EmailService
    ) {}

    @HostListener("document:click", ["$event"])
    onClickOutside(event: MouseEvent) {
        const clickInside = this.elementRef.nativeElement.contains(event.target);
        if (!clickInside) {
            this.dropdownOpen = false;
        }
    }

    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
    }

    onSearch() {
        if (!this.searchText.trim()) {
          this.notifica.show("Inserisci una parola per cercare", "Attenzione");
          return;
        }
        
        this.emailService.getUserEmailsOrSearchBy(1, {
          freeText: this.searchText.trim()
        }).subscribe({
          next: (emails) => {
            console.log('Email trovate:', emails);
            this.emailsFound.emit(emails);
          },
          error: (err) => {
            console.error(err);
            this.notifica.show("Errore nella ricerca libera", "Errore");
          }
        });
      }
      

      onSearchSubmit() {
        if (
          !this.sender.trim() &&
          !this.subject.trim() &&
          !this.body_words.trim()
        ) {
          this.notifica.show("Compila almeno un campo della ricerca avanzata", "Attenzione");
          return;
        }
      
        this.emailService.getUserEmailsOrSearchBy(2, {
          sender: this.sender.trim(),
          subject: this.subject.trim(),
          words: this.body_words.trim()
        }).subscribe({
          next: (emails) => {
            console.log('Email trovate:', emails);
            // gestisci le email ricevute
            this.dropdownOpen = false;
            this.emailsFound.emit(emails);
          },
          error: (err) => {
            console.error(err);
            this.notifica.show("Errore nella ricerca avanzata", "Errore");
          }
        });
      }
      
}