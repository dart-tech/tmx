import { FC, useReducer, useEffect } from "react";
import {
  AppStateContext,
  reducer,
  initialState,
  AppStateProviderProps,
  Actions,
  APP_CURRENT_STATE,
  DataRecord,
  AUTHORIZER_ACTION,
  AuthorizerContext,
} from "./AppContext.js";
import SignIn from "./SignIn.js";

export const AppProvider: FC<AppStateProviderProps> = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = Actions(dispatch);
  const backendProvider = props.backendProvider;
  const Resolvers = props.Resolvers;

  useEffect(() => {
    const performAppLoad = async () => {
      try {
        actions.setAppCurrentState(APP_CURRENT_STATE.INITIALIZING);

        const user = await backendProvider.getCurrentUser();
        if (user) {
          actions.setAuth({
            user,
            isInitialized: true,
            isAuthenticated: true,
            errorInitializing: "",
            busyInitializing: false,
          });
        }
        const [app, appLoadError] = await backendProvider.loadApp();
        if (app) {
          actions.setApp(app);
        }
        if (appLoadError) {
          actions.setAppCurrentState(appLoadError.state);
          return;
        } else {
          actions.setAppCurrentState(APP_CURRENT_STATE.READY);
        }
      } catch (error) {
        actions.setAppCurrentState(APP_CURRENT_STATE.ERROR);
      }
    };
    if (
      state.currentState === APP_CURRENT_STATE.IDLE ||
      state.currentState === APP_CURRENT_STATE.STALE
    ) {
      performAppLoad();
    }
  }, [state.currentState]);

  const getDataBlockRecord = (
    dataBlockId: string,
    recordId: string
  ): DataRecord => {
    return state.dataBlock[dataBlockId]?.find(
      (record) => record.id === recordId
    ) as DataRecord;
  };

  const getDataBlock = (dataBlockId: string): DataRecord[] => {
    return state.dataBlock[dataBlockId] as DataRecord[];
  };

  const handleSignOut = async () => {
    actions.setAppCurrentState(APP_CURRENT_STATE.INITIALIZING);
    await backendProvider.signOut();
    actions.setAppCurrentState(APP_CURRENT_STATE.SIGN_IN_REQUIRED);
  };

  const can = (action: AUTHORIZER_ACTION, context: AuthorizerContext) => {
    return backendProvider.can(action, {
      ...context,
      user: state?.auth?.user!,
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        ...actions,
        backendProvider,
        Resolvers,
        getDataBlockRecord,
        getDataBlock,
        handleSignOut,
        can,
      }}
    >
      {state.currentState === APP_CURRENT_STATE.READY &&
        props.children &&
        props.children}
      {state.currentState === APP_CURRENT_STATE.ERROR && <div>ERROR</div>}
      {state.currentState === APP_CURRENT_STATE.INITIALIZING && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Resolvers.Spinner />
        </div>
      )}
      {state.currentState === APP_CURRENT_STATE.SIGN_IN_REQUIRED && <SignIn />}
    </AppStateContext.Provider>
  );
};
