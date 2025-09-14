import { createReducer, on } from '@ngrx/store';
import * as actions from './settings.actions';

export interface SettingsState {
   theme: actions.Theme;
   language: string;
}

export const initialState: SettingsState = {
   theme: 'dark',
   language: 'fa'
};

export const settingsReducer = createReducer(
   initialState,
   on(actions.setTheme, (state, { theme }) => ({ ...state, theme })),
   on(actions.setLanguage, (state, { language }) => ({ ...state, language }))
);