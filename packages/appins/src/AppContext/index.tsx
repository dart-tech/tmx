import { FC, ReactNode } from "react";
import { AppStore } from "@tmx/core/AppStore";

export interface AppinsProviderProps {
  children: ReactNode;
}

export interface AppinsContextValue {
  store: AppStore;
}

export const AppinsProvider: FC<AppinsProviderProps> = (props) => {
  return <>{props.children}</>;
};
