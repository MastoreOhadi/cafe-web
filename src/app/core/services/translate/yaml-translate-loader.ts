import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import yaml from 'yamljs';

@Injectable({
  providedIn: 'root'
})
export class YamlTranslateHttpLoader implements TranslateLoader {
   constructor(private http: HttpClient) {}

   // Cache per-language translation observables to avoid repeated HTTP requests
   private readonly languageToTranslation$: Map<string, Observable<any>> = new Map();

   getTranslation(lang: string): Observable<any> {
      const existing = this.languageToTranslation$.get(lang);
      if (existing) {
         return existing;
      }

      const translation$ = this.http
         .get(`/assets/i18n/${lang}.yml`, { responseType: 'text' })
         .pipe(
         map((yamlContent: string) => yaml.parse(yamlContent)),
         // Cache the latest successful value and share the single HTTP call
         shareReplay({ bufferSize: 1, refCount: false })
      );

      this.languageToTranslation$.set(lang, translation$);
      return translation$;
   }
}