import { FC, ReactNode, useReducer, useEffect } from "react";
import {
  AppStateContext,
  reducer,
  initialState,
  AppProviderProps,
  Actions,
} from "@tmx/react-sdk/AppContext";
import { getApiEndpoint } from "./getApiEndpoint.js";

export const AppProvider: FC<AppProviderProps> = (props) => {
  const APPINS_API_ENDPOINT = getApiEndpoint();
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = Actions(dispatch);

  useEffect(() => {
    actions.setApp({
      name: "4th Wave",
    });
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        ...state,
      }}
    >
      {props.children}
    </AppStateContext.Provider>
  );
};
