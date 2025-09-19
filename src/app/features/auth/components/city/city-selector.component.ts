import { Component, forwardRef, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import citiesData from '../../../../../../public/assets/iran-cities.json';
import { TranslateModule } from '@ngx-translate/core';

interface City {
  id: number;
  name: string;
  provinceId: number;
}

interface CityValue {
  cityId: number;
  provinceId: number;
}

@Component({
  selector: 'app-city-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './city-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CitySelectorComponent),
      multi: true
    }
  ]
})
export class CitySelectorComponent implements ControlValueAccessor, OnInit {
  @ViewChild('dropdown') dropdownRef!: ElementRef;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  cities = signal<City[]>([]);
  filteredCities = signal<City[]>([]);
  isOpen = signal(false);
  selectedCity = signal<City | null>(null);
  searchControl = new FormControl<string>('');

  private onChange: (value: CityValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.loadCities();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.filterCities(value || '');
      });
  }

  private loadCities(): void {
    try {
      const citiesArray = Object.entries(citiesData).flatMap(([provinceId, province]: [string, any]) =>
        Object.entries(province.city).map(([cityId, city]: [string, any]) => ({
          id: Number(cityId),
          name: city.name,
          provinceId: Number(provinceId)
        }))
      );

      this.cities.set(citiesArray);
      this.filteredCities.set(citiesArray);
    } catch (error) {
      console.error('Error loading cities data:', error);
      this.cities.set([]);
      this.filteredCities.set([]);
    }
  }

  private filterCities(searchTerm: string): void {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredCities.set(this.cities());
      return;
    }

    const filtered = this.cities().filter(city =>
      city.name.toLowerCase().includes(search)
    );

    this.filteredCities.set(filtered);
  }

  toggleDropdown(): void {
    this.isOpen.update(open => !open);
    if (this.isOpen()) {
      setTimeout(() => this.searchInputRef.nativeElement.focus(), 100);
    }
  }

  selectCity(city: City): void {
    this.selectedCity.set(city);
    this.onChange({ cityId: city.id, provinceId: city.provinceId });
    this.onTouched();
    this.isOpen.set(false);
    this.searchControl.setValue('');
  }

  clearSelection(): void {
    this.selectedCity.set(null);
    this.onChange(null);
    this.onTouched();
    this.searchControl.setValue('');
  }

  // ControlValueAccessor implementation
  writeValue(value: number | null): void {
    if (value) {
      const city = this.cities().find(c => c.id === value);
      if (city) {
        this.selectedCity.set(city);
      }
    } else {
      this.selectedCity.set(null);
    }
  }

  registerOnChange(fn: (value: CityValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }
}