import { createContext, ReactNode, useContext } from "react";
import { App } from "./App";

enum APP_CURRENT_STATE {
  IDLE,
  LOADING,
  READY,
  ERROR,
}

interface AppState {
  app: App | undefined;
  currentState: APP_CURRENT_STATE;
  error: string | undefined;
}

interface AppStateContextValue extends AppState {
  setApp: (app: App) => void;
}

interface AppStateProviderProps {
  children: ReactNode;
}

const defaultStateValue: AppState = {
  app: undefined,
  currentState: APP_CURRENT_STATE.IDLE,
  error: undefined,
};

const defaultContextValue: AppStateContextValue = {
  ...defaultStateValue,
  setApp: (app: App) => {},
};

enum ActionType {
  SET_APP = "SET_APP",
}

type SetApp = {
  type: ActionType.SET_APP;
  payload: {
    app: App;
  };
};

type Action = SetApp;

type Handler = (state: AppState, action: Action) => AppState;

const handlers: Record<ActionType, Handler> = {
  [ActionType.SET_APP]: (state, action) => {
    return {
      ...state,
      app: action.payload.app,
    };
  },
};

const reducer = (state: AppState, action: Action): AppState =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

const initialState: AppState = defaultStateValue;

const AppStateContext =
  createContext<AppStateContextValue>(defaultContextValue);

const Actions = (dispatch: React.Dispatch<Action>) => ({
  setApp: (app: App) => {
    dispatch({
      type: ActionType.SET_APP,
      payload: {
        app,
      },
    });
  },
});

const useAppState = () => {
  const context = useContext(AppStateContext);

  if (context === undefined) {
    throw new Error("useAppState must be used within a AppStateProvider");
  }

  return context;
};

export {
  AppStateContext,
  ActionType,
  reducer,
  initialState,
  defaultStateValue,
  defaultContextValue,
  Actions,
  useAppState,
};

export type {
  AppState,
  AppStateContextValue,
  AppStateProviderProps,
  Action,
  SetApp,
};
