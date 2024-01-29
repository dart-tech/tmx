import { createContext, ReactNode, useContext } from "react";
import { App } from "./App.js";
import { Entity } from "./Entity.js";
import { produce } from "immer";
import { Property } from "./Property.js";

enum APP_CURRENT_STATE {
  IDLE,
  INITIALIZING,
  READY,
  ERROR,
  STALE,
  SIGN_IN_REQUIRED,
}

type ResolversType = Record<string, any>;

interface User {
  id: string;
  name: string;
  email: string;
  grants?: RoleGrant[];
}

type RoleGrant = {
  action: string;
  subject: string;
  conditions?: any;
};

interface AppState {
  app: App | undefined;
  currentState: APP_CURRENT_STATE;
  error: string | undefined;
  auth:
    | {
        isAuthenticated: boolean;
        isInitialized: boolean;
        user: User | null;
        busyInitializing: boolean;
        errorInitializing: string | null;
      }
    | undefined;
  dataBlock: Record<string, DataRecord[]>;
}

export enum AUTHORIZER_ACTION {
  DELETE_RECORD = "deleteRecord",
  CREATE_RECORD = "createRecord",
  UPDATE_RECORD = "updateRecord",
  GET_RECORD = "getRecord",
  GET_RECORDS = "getRecords",
  MUTATE_RECORD_PROPERTY = "mutateRecordProperty",
}

type AuthorizerContext = {
  entity: Entity;
  user?: User;
  property?: Property;
  record?: DataRecord;
};

interface AppStateContextValue extends AppState {
  backendProvider: BackendProvider;
  Resolvers: ResolversType;
  setAuth: (auth: AppState["auth"]) => void;
  handleSignOut: () => void;
  setAppCurrentState: (currentState: APP_CURRENT_STATE) => void;
  setDataBlockRecord: (dataBlockId: string, record: DataRecord) => void;
  setDataBlock: (dataBlockId: string, data: DataRecord[]) => void;
  getDataBlock: (dataBlockId: string) => DataRecord[];
  getDataBlockRecord: (dataBlockId: string, recordId: string) => DataRecord;
  removeDataBlockRecord: (dataBlockId: string, recordId: string) => void;
  can: (
    action: AUTHORIZER_ACTION,
    context: AuthorizerContext
  ) => [boolean, string | undefined]; // [can, reason]
}

interface AppStateProviderProps {
  children: ReactNode;
  backendProvider: BackendProvider;
  Resolvers: ResolversType;
}

const defaultStateValue: AppState = {
  app: undefined,
  auth: {
    isAuthenticated: false,
    isInitialized: false,
    user: null,
    busyInitializing: true,
    errorInitializing: null,
  },
  currentState: APP_CURRENT_STATE.IDLE,
  error: undefined,
  dataBlock: {},
};

const defaultContextValue: AppStateContextValue = {
  ...defaultStateValue,
  setAuth: (auth: AppState["auth"]) => {},
  handleSignOut: () => {},
  setAppCurrentState: (currentState: APP_CURRENT_STATE) => {},
  backendProvider: {} as BackendProvider,
  Resolvers: {},
  setDataBlockRecord: (dataBlockId: string, record: DataRecord) => {},
  setDataBlock: (dataBlockId: string, data: DataRecord[]) => {},
  getDataBlockRecord: (dataBlockId: string, recordId: string) => {
    return {} as DataRecord;
  },
  getDataBlock: (dataBlockId: string) => {
    return [] as DataRecord[];
  },
  removeDataBlockRecord: (dataBlockId: string, recordId: string) => {},
  can: (action: AUTHORIZER_ACTION, context: AuthorizerContext) => {
    return [false, undefined];
  },
};

enum ActionType {
  SET_APP = "SET_APP",
  SET_APP_CURRENT_STATE = "SET_APP_CURRENT_STATE",
  SET_AUTH = "SET_AUTH",
  SET_DATA_BLOCK = "SET_DATA_BLOCK",
  SET_DATA_BLOCK_RECORD = "SET_DATA_BLOCK_RECORD",
  REMOVE_DATA_BLOCK_RECORD = "REMOVE_DATA_BLOCK_RECORD",
}

type SetApp = {
  type: ActionType.SET_APP;
  payload: {
    app: App;
  };
};

type SetAppCurrentState = {
  type: ActionType.SET_APP_CURRENT_STATE;
  payload: {
    currentState: APP_CURRENT_STATE;
  };
};

type SetAuth = {
  type: ActionType.SET_AUTH;
  payload: {
    auth: AppState["auth"];
  };
};

type SetDataBlock = {
  type: ActionType.SET_DATA_BLOCK;
  payload: {
    dataBlockId: string;
    data: DataRecord[];
  };
};

type SetDataBlockRecord = {
  type: ActionType.SET_DATA_BLOCK_RECORD;
  payload: {
    dataBlockId: string;
    record: DataRecord;
  };
};

type RemoveDataBlockRecord = {
  type: ActionType.REMOVE_DATA_BLOCK_RECORD;
  payload: {
    dataBlockId: string;
    recordId: string;
  };
};

type Action =
  | SetApp
  | SetAppCurrentState
  | SetAuth
  | SetDataBlock
  | SetDataBlockRecord
  | RemoveDataBlockRecord;

type Handler = (state: AppState, action: Action) => AppState;

const handlers: Record<ActionType, Handler> = {
  [ActionType.SET_APP]: (state, action) => {
    return {
      ...state,
      app: action.payload.app,
    };
  },
  [ActionType.SET_APP_CURRENT_STATE]: (state, action) => {
    return {
      ...state,
      currentState: action.payload.currentState,
    };
  },
  [ActionType.SET_AUTH]: (state, action) => {
    return {
      ...state,
      auth: action.payload.auth,
    };
  },
  [ActionType.SET_DATA_BLOCK]: (state, action) => {
    return {
      ...state,
      dataBlock: {
        ...state.dataBlock,
        [action.payload.dataBlockId]: action.payload.data,
      },
    };
  },
  [ActionType.SET_DATA_BLOCK_RECORD]: (state, action) => {
    const nextState = produce(state, (draftState) => {
      if (!draftState.dataBlock[action.payload.dataBlockId]) {
        draftState.dataBlock[action.payload.dataBlockId] = [];
      }

      const recordIndex = draftState.dataBlock[
        action.payload.dataBlockId
      ].findIndex((record) => record.id === action.payload.record.id);
      if (recordIndex === -1) {
        draftState.dataBlock[action.payload.dataBlockId].push(
          action.payload.record
        );
      } else {
        draftState.dataBlock[action.payload.dataBlockId][recordIndex] = {
          ...draftState.dataBlock[action.payload.dataBlockId][recordIndex],
          ...action.payload.record,
        };
      }
    });
    return nextState;
  },
  [ActionType.REMOVE_DATA_BLOCK_RECORD]: (state, action) => {
    const nextState = produce(state, (draftState) => {
      if (!draftState.dataBlock[action.payload.dataBlockId]) {
        return;
      }
      const recordIndex = draftState.dataBlock[
        action.payload.dataBlockId
      ].findIndex((record) => record.id === action.payload.recordId);
      if (recordIndex === -1) {
        return;
      }
      draftState.dataBlock[action.payload.dataBlockId].splice(recordIndex, 1);
    });
    return nextState;
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
  setAppCurrentState: (currentState: APP_CURRENT_STATE) => {
    dispatch({
      type: ActionType.SET_APP_CURRENT_STATE,
      payload: {
        currentState,
      },
    });
  },
  setAuth: (auth: AppState["auth"]) => {
    dispatch({
      type: ActionType.SET_AUTH,
      payload: {
        auth,
      },
    });
  },
  setDataBlock: (dataBlockId: string, data: DataRecord[]) => {
    dispatch({
      type: ActionType.SET_DATA_BLOCK,
      payload: {
        dataBlockId,
        data,
      },
    });
  },
  setDataBlockRecord: (dataBlockId: string, record: DataRecord) => {
    dispatch({
      type: ActionType.SET_DATA_BLOCK_RECORD,
      payload: {
        dataBlockId,
        record,
      },
    });
  },
  removeDataBlockRecord: (dataBlockId: string, recordId: string) => {
    dispatch({
      type: ActionType.REMOVE_DATA_BLOCK_RECORD,
      payload: {
        dataBlockId,
        recordId,
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

interface AppLoadError {
  message: string;
  state: APP_CURRENT_STATE;
}

interface DataRecord {
  id: string;
  [key: string]: any;
}

abstract class BackendProvider {
  constructor(apiEndpoint: string, appId: string) {
    this.apiEndpoint = apiEndpoint;
    this.appId = appId;
  }
  apiEndpoint: string = "";
  appId: string = "";
  abstract loadApp(): Promise<[App | undefined, AppLoadError | undefined]>;
  abstract signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<[User | undefined, string | undefined]>;
  abstract signOut(): Promise<void>;
  abstract can(
    action: AUTHORIZER_ACTION,
    context: AuthorizerContext
  ): [boolean, string | undefined];
  abstract getCurrentUser(): Promise<User | undefined>;
  abstract getJWTToken(): Promise<string | undefined>;
  abstract getSingleRecord(entity: Entity, id: string): Promise<DataRecord>;
  abstract getRecords(entity: Entity): Promise<DataRecord[]>;
  abstract saveRecord(
    entity: Entity,
    record: DataRecord
  ): Promise<[DataRecord | undefined, string | undefined]>;
  abstract createRecord(
    entity: Entity,
    record: DataRecord
  ): Promise<[DataRecord | undefined, string | undefined]>;
  abstract deleteRecord(
    entity: Entity,
    record: DataRecord
  ): Promise<[boolean | undefined, string | undefined]>;
  abstract uploadFile(
    file: File,
    fileKey: string,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal
  ): Promise<[string | undefined, string | undefined]>;
}

export {
  AppStateContext,
  ActionType,
  reducer,
  initialState,
  defaultStateValue,
  defaultContextValue,
  Actions,
  useAppState,
  BackendProvider,
  APP_CURRENT_STATE,
};

export type {
  AppState,
  AppStateContextValue,
  AppStateProviderProps,
  Action,
  SetApp,
  App,
  AppLoadError,
  User,
  ResolversType,
  DataRecord,
  AuthorizerContext,
};
