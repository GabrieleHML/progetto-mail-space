import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private selectedLabelsSubject = new BehaviorSubject<string[]>([]);
  private intersectionSubject = new BehaviorSubject<boolean>(false);

  selectedLabels$ = this.selectedLabelsSubject.asObservable();
  intersection$ = this.intersectionSubject.asObservable();

  setFilters(selectedLabels: string[], intersection: boolean) {
    console.log('Setting filters:', selectedLabels, intersection);
    this.selectedLabelsSubject.next(selectedLabels);
    this.intersectionSubject.next(intersection);
  }

  getCurrentFilters() {
    return {
      selectedLabels: this.selectedLabelsSubject.value,
      intersection: this.intersectionSubject.value
    };
  }
}