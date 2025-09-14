import { createAction, props } from '@ngrx/store';

export type Theme = 'light' | 'dark';

export const loadSettings = createAction('[Settings] Load');

export const setTheme = createAction('[Settings] Set Theme', props<{ theme: Theme }>());
export const setLanguage = createAction('[Settings] Set Language', props<{ language: string }>());