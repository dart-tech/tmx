import {
  BackendProvider,
  App,
  AppLoadError,
  APP_CURRENT_STATE,
  User,
  DataRecord,
  Entity,
} from "@tmx/react-sdk";
import { getApiEndpoint } from "./getApiEndpoint.js";
import { Auth } from "./amplifyConfig.js";
import { mapApp } from "./mapApp.js";

export class AppinsBackendProvider extends BackendProvider {
  constructor() {
    const APPINS_API_ENDPOINT = getApiEndpoint();
    super(APPINS_API_ENDPOINT);
  }
  async loadApp(): Promise<[App | undefined, AppLoadError | undefined]> {
    const token = await this.getJWTToken();
    const result = await fetch(`${this.apiEndpoint}/app-config/4thwave-cms`, {
      headers: {
        Authorization: token || "",
      },
    }).then((res) => res.json());
    const appMapped = mapApp(result);

    if (result.user.authenticated === false) {
      return [
        appMapped,
        {
          message: "Not authenticated",
          state: APP_CURRENT_STATE.SIGN_IN_REQUIRED,
        },
      ];
    }
    return [appMapped, undefined];
  }
  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<[User | undefined, string | undefined]> {
    const result = await Auth.signIn(email, password);
    return [
      {
        id: result.username,
        email: result.attributes.email,
        name: result.attributes.name,
      },
      undefined,
    ];
  }
  async getCurrentUser(): Promise<User | undefined> {
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser();
      return {
        id: authenticatedUser.username,
        email: authenticatedUser.attributes.email,
        name: authenticatedUser.attributes.name,
      };
    } catch (error) {
      return undefined;
    }
  }
  async getJWTToken(): Promise<string | undefined> {
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken();
      const token = idToken.getJwtToken();
      return token;
    } catch (error) {
      return undefined;
    }
  }
  async getSingleRecord(entity: Entity, id: string): Promise<DataRecord> {
    const token = await this.getJWTToken();
    const response = await fetch(
      `${this.apiEndpoint}/lambda-server/4thwave-cms/${entity.id}/${id}`,
      {
        headers: {
          Authorization: token || "",
        },
      }
    ).then((res) => res.json());
    const record = response.result;
    record.id = id.toString();
    return record;
  }
  async saveRecord(
    entity: Entity,
    record: DataRecord
  ): Promise<[DataRecord | undefined, string | undefined]> {
    const token = await this.getJWTToken();
    const { id, ...rest } = record;
    const result = await fetch(
      `${this.apiEndpoint}/lambda-server/4thwave-cms/${entity.id}/${id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(rest),
      }
    ).then((res) => res.json());
    return [result.record, undefined];
  }
  async getRecords(entity: Entity): Promise<DataRecord[]> {
    const token = await this.getJWTToken();
    const response = await fetch(
      `${this.apiEndpoint}/lambda-server/4thwave-cms/${entity.id}?limit=100`,
      {
        headers: {
          Authorization: token || "",
        },
      }
    ).then((res) => res.json());
    const records = response.result.rows;
    records.forEach((record: DataRecord) => {
      record.id = record.id.toString();
    });
    return records;
  }
}
