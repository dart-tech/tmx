import { createStore } from "zustand/vanilla";
import { AppConfig } from "./AppConfig";

export enum APP_CURRENT_STATE {
  IDLE,
  LOADING,
  READY,
  ERROR,
}

export interface AppStore {
  appConfig: AppConfig | undefined;
  currentState: APP_CURRENT_STATE;
  setAppConfig: (appConfig: AppConfig) => void;
  error: string | undefined;
}

const appStore = createStore<AppStore>((set) => ({
  appConfig: undefined,
  currentState: APP_CURRENT_STATE.IDLE,
  error: undefined,
  setAppConfig: (appConfig: AppConfig) => set({ appConfig }),
}));

export { appStore };
