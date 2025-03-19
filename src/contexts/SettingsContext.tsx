import React, { createContext, useState, useEffect, ReactNode } from 'react';
import useAuth from 'hooks/useAuth';

// Define the settings interface
interface Settings {
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

// Default settings
const defaultSettings: Settings = {
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

// Create a context for the settings
interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: any) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveSettings: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create a provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const userId = user?.email ?? 'kiran@d.energy';

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const requestOptions: RequestInit = {
          method: 'GET',
          redirect: 'follow'
        };

        const response = await fetch(
          `https://11rysti5l2.execute-api.me-central-1.amazonaws.com/test/getUserSettings?userId=${userId}`,
          requestOptions
        );

        const result = await response.json();

        if (result.data?.settings) {
          setSettings(result.data.settings);
        }
      } catch (err) {
        setError('Failed to fetch settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchSettings().then();
  }, [userId]);

  // Update a single setting
  const updateSetting = (key: keyof Settings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Update multiple settings at once
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings
    }));
  };

  // Save settings to API
  const saveSettings = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const requestOptions: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
          userId,
          settings
        }),
        redirect: 'follow'
      };

      const response = await fetch('https://11rysti5l2.execute-api.me-central-1.amazonaws.com/test/userSettings', requestOptions);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    settings,
    updateSetting,
    updateSettings,
    saveSettings,
    loading,
    error
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsContext;
