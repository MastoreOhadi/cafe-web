import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { YamlTranslateHttpLoader } from './core/services/translate/yaml-translate-loader';
import { provideStore } from '@ngrx/store';
import { settingsReducer } from './store/settings/settings.reducer';
import { SettingsEffects } from './store/settings/settings.effects';
import { provideEffects } from '@ngrx/effects';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';

export const appConfig: ApplicationConfig = {
   providers: [
      // provideBrowserGlobalErrorListeners(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes), provideClientHydration(withEventReplay()),
      provideHttpClient(
         withFetch(),
         withXsrfConfiguration({
            cookieName: "csrf_token",
            headerName: "X-Csrf-Token"
         }),
         withInterceptors([jwtInterceptor])
      ),
      {
         provide: RECAPTCHA_V3_SITE_KEY,
         useValue: environment.recaptchaSiteKey,
      },
      importProvidersFrom(TranslateModule.forRoot({
         loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) => new YamlTranslateHttpLoader(http),
            deps: [HttpClient],
         },
         fallbackLang: "fa",
      })),
      provideStore({
         settings: settingsReducer
      }),
      provideEffects([SettingsEffects]),
   ]
};
