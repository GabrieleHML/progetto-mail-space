import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NotificationService } from "../../services/notification.service";

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
    searchText: string = "";
    sender: string = "";
    subject: string = "";
    body_words: string = "";
    dropdownOpen: boolean = false;
    constructor(private notifica: NotificationService, private elementRef: ElementRef) {}

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
        // TODO
        this.notifica.show("Hai premuto invio","Giusto?");
    }

    onSearchSubmit() {
        // TODO
        this.notifica.show("Hai premuto Cerca","Giusto?");
    }
}