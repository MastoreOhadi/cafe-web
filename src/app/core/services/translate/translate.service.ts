import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { selectLanguage } from '../../../store/settings/settings.selectors';
import * as settingsActions from '../../../store/settings/settings.actions';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root',
})
export class AppTranslateService {
   private translate = inject(TranslateService);
   private readonly supportedLangs = ['en', 'fa'];

   currentLang$: Observable<string>;

   constructor(private store: Store) {
      this.currentLang$ = this.store.select(selectLanguage);
   }

   public switchLanguage(lang: string): void {
      if (this.supportedLangs.includes(lang)) {
         this.store.dispatch(settingsActions.setLanguage({ language: lang }));
      }
   }

   public getCurrentLang(): string| null {
      return this.translate.getCurrentLang() || this.translate.getFallbackLang();
   }
}