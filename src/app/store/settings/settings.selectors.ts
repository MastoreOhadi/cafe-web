import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SettingsState, initialState } from './settings.reducer';

export const selectSettingsState = createFeatureSelector<SettingsState>('settings');

export const selectSettings = createSelector(
  selectSettingsState,
  (state) => state || initialState
);

export const selectTheme = createSelector(
  selectSettings,
  (state) => state.theme
);

export const selectLanguage = createSelector(
  selectSettings,
  (state) => state.language
);