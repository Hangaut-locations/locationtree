import {
  createContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { CurrencyCode } from "../../lib/currency";
import { loadState, saveState } from "../../lib/storage";

interface IAppProvider {
  children: ReactNode;
}

interface IAppContext {
  isAuthModal: boolean;
  setIsAuthModal: Dispatch<SetStateAction<boolean>>;
  isSideMenu: boolean;
  setIsSideMenu: Dispatch<SetStateAction<boolean>>;
  isCurrencyModal: boolean;
  setIsCurrencyModal: Dispatch<SetStateAction<boolean>>;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
}

export const AppContext = createContext<IAppContext | undefined>(undefined);

const AppProvider = ({ children }: IAppProvider) => {
  const [isAuthModal, setIsAuthModal] = useState(false);
  const [isSideMenu, setIsSideMenu] = useState(false);
  const [isCurrencyModal, setIsCurrencyModal] = useState(false);
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    loadState<CurrencyCode>("currency", "USD"),
  );

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    saveState("currency", code);
  };

  const values: IAppContext = {
    isAuthModal,
    setIsAuthModal,
    isSideMenu,
    setIsSideMenu,
    isCurrencyModal,
    setIsCurrencyModal,
    currency,
    setCurrency,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export default AppProvider;
