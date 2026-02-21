import React, { createContext, useContext, useState, useEffect } from 'react';

export type PersonalizationMode = 'rule-based' | 'ai';

interface PersonalizationContextValue {
  mode: PersonalizationMode;
  setMode: (m: PersonalizationMode) => void;
}

const PersonalizationContext = createContext<PersonalizationContextValue>({
  mode: 'rule-based',
  setMode: () => {},
});

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<PersonalizationMode>(() => {
    return (localStorage.getItem('cc_persona_mode') as PersonalizationMode) || 'rule-based';
  });

  const setMode = (m: PersonalizationMode) => {
    setModeState(m);
    localStorage.setItem('cc_persona_mode', m);
  };

  return (
    <PersonalizationContext.Provider value={{ mode, setMode }}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => useContext(PersonalizationContext);
