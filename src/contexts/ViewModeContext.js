import { createContext, useContext } from 'react';

// true = mobile layout, false = desktop layout
export const ViewModeContext = createContext(false);
export const useIsMobile = () => useContext(ViewModeContext);
