import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConfigCRM } from '../types/config.types';
import { configService } from '../utils/configService';

interface ConfigContextType {
  config: ConfigCRM | null;
  loading: boolean;
  refreshConfig: () => Promise<void>;
  updateConfig: (data: Partial<ConfigCRM>) => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ConfigCRM | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    setLoading(true);
    const data = await configService.getConfig();
    if (data) {
      setConfig(data);
      applyTheme(data);
    }
    setLoading(false);
  };

  const applyTheme = (conf: ConfigCRM) => {
    if (conf.accent_color) {
      document.documentElement.style.setProperty('--primary-color', conf.accent_color);
      // Generate light/dark shades if needed
      document.documentElement.style.setProperty('--primary-soft', `${conf.accent_color}20`);
    }
  };

  const updateConfig = async (data: Partial<ConfigCRM>): Promise<boolean> => {
    const ok = await configService.updateConfig(data);
    if (ok) {
      await loadConfig();
    }
    return ok;
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, refreshConfig: loadConfig, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
