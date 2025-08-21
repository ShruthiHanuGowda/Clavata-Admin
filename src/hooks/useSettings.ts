import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchUserSettings,
  saveUserSettings,
  updateSetting,
  updateSettings,
  resetSettings,
  clearError,
  Settings
} from '../store/slices/settingsSlice';
import useAuth from './useAuth';
import useConfig from './useConfig';

export default function useSettingsRedux() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { onChangeMode } = useConfig();

  const { settings, loading, error } = useSelector((state: RootState) => state.settings);

  const userId = user?.email ?? 'kiran@d.energy';

  const { theme_mode } = settings;

  useEffect(() => {
    onChangeMode(theme_mode);
  }, [theme_mode, onChangeMode]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserSettings(userId));
    }
  }, [dispatch, userId]);

  const handleUpdateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    dispatch(updateSetting({ key, value }));
  };

  const handleUpdateSettings = (newSettings: Partial<Settings>) => {
    dispatch(updateSettings(newSettings));
  };

  const handleSaveSettings = async (): Promise<void> => {
    if (!userId) {
      throw new Error('User ID is required to save settings');
    }

    const result = await dispatch(saveUserSettings({ userId, settings }));
    if (saveUserSettings.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  const handleResetSettings = () => {
    dispatch(resetSettings());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    settings,
    updateSetting: handleUpdateSetting,
    updateSettings: handleUpdateSettings,
    saveSettings: handleSaveSettings,
    resetSettings: handleResetSettings,
    clearError: handleClearError,
    loading,
    error
  };
}
