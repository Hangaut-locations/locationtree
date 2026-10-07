import {
  createContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface IAppProvider {
  children: ReactNode;
}

interface IAppContext {
  isAuthModal: boolean;
  setIsAuthModal: Dispatch<SetStateAction<boolean>>;
  isSideMenu: boolean;
  setIsSideMenu: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = createContext<IAppContext | undefined>(undefined);

const AppProvider = ({ children }: IAppProvider) => {
  const [isAuthModal, setIsAuthModal] = useState(false);
  const [isSideMenu, setIsSideMenu] = useState(false);

  const values: IAppContext = {
    isAuthModal,
    setIsAuthModal,
    isSideMenu,
    setIsSideMenu,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export default AppProvider;
