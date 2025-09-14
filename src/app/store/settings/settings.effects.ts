import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as settingsActions from './settings.actions';
import { selectSettings } from './settings.selectors';
import { TranslateService } from '@ngx-translate/core';
import { initialState } from './settings.reducer';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';

@Injectable()
export class SettingsEffects implements OnInitEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'fa']);
  }

  loadSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(settingsActions.loadSettings),
      switchMap(() => {
        try {
          if (typeof localStorage === 'undefined') {
            return of(
              settingsActions.setTheme({ theme: initialState.theme }),
              settingsActions.setLanguage({ language: initialState.language })
            );
          }

          const json = localStorage.getItem('settings');
          if (!json) {
            return of(
              settingsActions.setTheme({ theme: initialState.theme }),
              settingsActions.setLanguage({ language: initialState.language })
            );
          }

          const saved = JSON.parse(json);
          const theme = (saved.theme || initialState.theme) as settingsActions.Theme;
          const language = saved.language || initialState.language;

          return of(
            settingsActions.setTheme({ theme }),
            settingsActions.setLanguage({ language })
          );
        } catch (error) {
          console.error('Error loading settings:', error);
          return of(
            settingsActions.setTheme({ theme: initialState.theme }),
            settingsActions.setLanguage({ language: initialState.language })
          );
        }
      })
    )
  );

  persistSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(settingsActions.setTheme, settingsActions.setLanguage),
        withLatestFrom(this.store.select(selectSettings)),
        tap(([_, settings]) => {
          if (typeof localStorage !== 'undefined' && settings) {
            try {
              localStorage.setItem('settings', JSON.stringify(settings));
            } catch (error) {
              console.error('Error saving settings to localStorage:', error);
            }
          }
        })
      ),
    { dispatch: false }
  );

  applyTheme$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(settingsActions.setTheme),
        tap(({ theme }) => {
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
            document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
            document.documentElement.lang = language;
          }
        })
      ),
    { dispatch: false }
  );

  ngrxOnInitEffects(): Action {
    return settingsActions.loadSettings();
  }
}