import { createContext, useContext } from 'react';
import { AGE_MODE } from '../utils/ageMode';

// 'adult' = TrustiScore classique, 'kid' = style graphique dédié -15 ans
export const AgeModeContext = createContext(AGE_MODE.ADULT);
export const useAgeMode = () => useContext(AgeModeContext);
