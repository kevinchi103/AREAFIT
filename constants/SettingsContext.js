import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createT, getDays } from './i18n';

const SETTINGS_KEY = 'areafit_settings';

const DEFAULT_SETTINGS = {
  lang: 'es',       // 'ca' | 'es' | 'en'
  theme: 'dark',    // 'dark' | 'light'
  notifications: true,
  subscription: 'free', // 'free' | 'premium_monthly' | 'premium_yearly'
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(raw => {
      if (raw) {
        try { setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) }); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  async function updateSettings(partial) {
    const next = { ...settings, ...partial };
    setSettingsState(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }

  const t = createT(settings.lang);
  const days = getDays(settings.lang);
  const isDark = settings.theme === 'dark';

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, t, days, isDark, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
