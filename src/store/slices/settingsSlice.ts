import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode } from 'config';

export interface Settings {
  theme_mode: ThemeMode;
  email_notification: boolean;
  send_copy_to_personal_email: boolean;
  have_new_notifications: boolean;
  your_sent_a_direct_message: boolean;
  someone_adds_you_as_a_connection: boolean;
  upon_new_order: boolean;
  new_membership_approval: boolean;
  member_registration: boolean;
  news_about_pct_themes_products_and_feature_updates: boolean;
  tips_on_getting_more_out_of_pct_themes: boolean;
  things_you_missed_since_you_last_logged_into_pct_themes: boolean;
  news_about_products_and_other_services: boolean;
  tips_and_document_business_products: boolean;
}

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
}

const defaultSettings: Settings = {
  theme_mode: ThemeMode.LIGHT,
  email_notification: true,
  send_copy_to_personal_email: true,
  have_new_notifications: true,
  your_sent_a_direct_message: true,
  someone_adds_you_as_a_connection: true,
  upon_new_order: true,
  new_membership_approval: true,
  member_registration: true,
  news_about_pct_themes_products_and_feature_updates: true,
  tips_on_getting_more_out_of_pct_themes: true,
  things_you_missed_since_you_last_logged_into_pct_themes: true,
  news_about_products_and_other_services: true,
  tips_and_document_business_products: true
};

const initialState: SettingsState = {
  settings: defaultSettings,
  loading: false,
  error: null
};

const API_BASE_URL = import.meta.env.VITE_APP_SETTINGS_API_URL || 'https://11rysti5l2.execute-api.me-central-1.amazonaws.com/test';

export const fetchUserSettings = createAsyncThunk('settings/fetchUserSettings', async (userId: string, { rejectWithValue }) => {
  try {
    const requestOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow'
    };

    const response = await fetch(`${API_BASE_URL}/getUserSettings?userId=${userId}`, requestOptions);

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const result = await response.json();
    return result.data?.settings || {};
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch settings');
  }
});

export const saveUserSettings = createAsyncThunk(
  'settings/saveUserSettings',
  async ({ userId, settings }: { userId: string; settings: Settings }, { rejectWithValue }) => {
    try {
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          settings
        }),
        redirect: 'follow'
      };

      const response = await fetch(`${API_BASE_URL}/userSettings`, requestOptions);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to save settings');
      }

      return settings;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: <K extends keyof Settings>(state: SettingsState, action: PayloadAction<{ key: K; value: Settings[K] }>) => {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetSettings: (state) => {
      state.settings = defaultSettings;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserSettings.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { updateSetting, updateSettings, resetSettings, clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
