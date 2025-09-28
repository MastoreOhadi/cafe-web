import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as settingsActions from './settings.actions';
import { selectSettings, selectTheme } from './settings.selectors';
import { SettingsService } from '../../core/services/settings/settings.service';
import { Action } from '@ngrx/store';

@Injectable()
export class SettingsEffects implements OnInitEffects {
   private actions$ = inject(Actions);
   private store = inject(Store);
   private translate = inject(TranslateService);
   private settingsService = inject(SettingsService);

   constructor() {
      this.translate.addLangs(['en', 'fa', 'ar']);
   }

   loadSettings$ = createEffect(() =>
      this.actions$.pipe(
         ofType(settingsActions.loadSettings),
         switchMap(() => {
            const settings = this.settingsService.getSettings();

            return of(
               settingsActions.setTheme({ theme: settings.theme }),
               settingsActions.setLanguage({ language: settings.language })
            );
         })
      )
   );

   persistSettings$ = createEffect(
      () =>
         this.actions$.pipe(
         ofType(
            settingsActions.setTheme,
            settingsActions.toggleTheme,
            settingsActions.setLanguage
         ),
         withLatestFrom(this.store.select(selectSettings)),
         tap(([_, settings]) => {
            this.settingsService.saveSettings(settings);
         })
         ),
      { dispatch: false }
   );

   applyTheme$ = createEffect(
      () =>
         this.actions$.pipe(
         ofType(settingsActions.setTheme, settingsActions.toggleTheme),
         withLatestFrom(this.store.select(selectTheme)),
         tap(([_, theme]) => {
            if (typeof document !== 'undefined') {
               const html = document.documentElement;
               html.classList.toggle('dark', theme === 'dark');
            }
         })
         ),
      { dispatch: false }
   );

   applyLanguage$ = createEffect(
      () =>
         this.actions$.pipe(
            ofType(settingsActions.setLanguage),
            tap(({ language }) => {
               this.translate.use(language);
               if (typeof document !== 'undefined') {
                  document.documentElement.dir = (language === 'fa' || language === 'ar') ? 'rtl' : 'ltr';
                  document.documentElement.lang = language;
               };
            })
         ),
      { dispatch: false }
   );

   ngrxOnInitEffects(): Action {
      return settingsActions.loadSettings();
   }
}