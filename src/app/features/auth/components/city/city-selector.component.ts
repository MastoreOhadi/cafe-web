import {
  Component,
  forwardRef,
  signal,
  computed,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import citiesData from '../../../../../../public/assets/iran-cities.json';
import { TranslateModule } from '@ngx-translate/core';
import { selectLanguage } from '../../../../store/settings/settings.selectors';
import { Store } from '@ngrx/store';
import { City, CityValue } from '../../models';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-city-selector',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './city-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CitySelectorComponent),
      multi: true,
    },
  ],
})
export class CitySelectorComponent implements ControlValueAccessor {
  private store = inject(Store);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('dropdown') dropdownRef!: ElementRef;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  // Signals
  cities = signal<City[]>([]);
  selectedCity = signal<City | null>(null);
  isOpen = signal(false);
  currentLang = signal<'fa' | 'en' | 'ar'>('fa');
  searchQuery = signal('');

  // FormControl
  searchControl = new FormControl<string>('', { nonNullable: true });

  // Derived signal (computed)
  filteredCities = computed(() => {
      const search = this.searchQuery().toLowerCase().trim();
      const allCities = this.cities();
      if (!search) return allCities;

      return allCities.filter((city) =>
        city.name[this.currentLang()].toLowerCase().includes(search)
      );
    });


  private onChange: (value: CityValue | null) => void = () => {};
  private onTouched: () => void = () => {};
  private clickListener!: (event: MouseEvent) => void;

  constructor() {
    this.loadCities();

    // Sync language from store
    this.store.select(selectLanguage).pipe(takeUntilDestroyed()).subscribe((lang) => {
      this.currentLang.set(lang === 'fa' || lang === 'en' || lang === 'ar' ? lang : 'fa');
    });

    // Sync search input with signal (debounced)
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.searchQuery.set(value || ''));

    // Add click listener to close dropdown when clicking outside
    if (isPlatformBrowser(this.platformId)) {
      this.setupClickListener();
    }
  };

  ngOnDestroy(): void {
    // Remove event listener when component is destroyed
    if (isPlatformBrowser(this.platformId) && this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  private setupClickListener(): void {
    this.clickListener = (event: MouseEvent) => {
      if (this.isOpen() && this.dropdownRef?.nativeElement) {
        const clickedInside = this.dropdownRef.nativeElement.contains(event.target as Node);
        if (!clickedInside) {
          this.closeDropdown();
        }
      }
    };

    // Use setTimeout to avoid immediate execution
    setTimeout(() => {
      document.addEventListener('click', this.clickListener);
    }, 0);
  }

  private loadCities(): void {
    try {
      const citiesArray: City[] = [];
      for (const [provinceId, provinceData] of Object.entries(citiesData)) {
        if (provinceData?.city) {
          for (const [cityId, cityData] of Object.entries(provinceData.city)) {
            if (cityData?.name) {
              citiesArray.push({
                id: Number(cityId),
                name: cityData.name,
                provinceId: Number(provinceId),
              });
            };
          };
        };
      };
      this.cities.set(citiesArray);
    } catch (error) {
      console.error('Error loading cities:', error);
      this.cities.set([]);
    };
  };

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.isOpen.update((open) => !open);
    if (this.isOpen()) {
      setTimeout(() => {
        if (this.searchInputRef?.nativeElement && isPlatformBrowser(this.platformId)) {
          this.searchInputRef.nativeElement.focus();
        }
      }, 0);
    } else {
      this.resetSearch();
    }
  }

  private closeDropdown(): void {
    this.isOpen.set(false);
    this.resetSearch();
  }

  selectCity(city: City, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent event from bubbling to document
    }

    this.selectedCity.set(city);
    this.onChange({ cityId: city.id, provinceId: city.provinceId });
    this.onTouched();
    this.closeDropdown();
  }

  clearSelection(event: Event): void {
    event.stopPropagation(); // Prevent event from bubbling to document
    this.selectedCity.set(null);
    this.onChange(null);
    this.onTouched();
    this.resetSearch();
  }

  private resetSearch(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchQuery.set('');
  }

  // ControlValueAccessor
  writeValue(value: CityValue | null): void {
    this.selectedCity.set(
      value ? this.cities().find((c) => c.id === value.cityId) ?? null : null
    );
  }

  registerOnChange(fn: (value: CityValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }

  getCityName(city: City | null): string {
    return city ? city.name[this.currentLang()] : '';
  }

  trackByCityId(_: number, city: City): number {
    return city.id;
  }
}