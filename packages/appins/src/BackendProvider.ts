import {
  BackendProvider,
  App,
  AppLoadError,
  APP_CURRENT_STATE,
  User,
  DataRecord,
  Entity,
  AUTHORIZER_ACTION,
  AuthorizerContext,
} from "@tmakex/react-sdk";
import { getApiEndpoint } from "./getApiEndpoint.js";
import { Auth } from "./amplifyConfig.js";
import { mapApp } from "./mapApp.js";
import { MatchConditions, PureAbility } from "@casl/ability";

interface AppinsGrant {
  id: string;
  action: string;
  attributes: string;
  resource: string;
  subject: string;
}
interface AppinsRole {
  id: string;
  name: string;
  grants: AppinsGrant[];
}

interface AppinsAccessControl {
  roles: AppinsRole[];
  userGrants: AppinsGrant[];
  ability?: PureAbility;
}
const customMatcher = (matchConditions: MatchConditions) => () => {
  return false;
};

const buildAbility = (accessControl: AppinsAccessControl) => {
  return new PureAbility(accessControl.userGrants, {
    conditionsMatcher: customMatcher,
  });
};

interface AppinsCustomMetadata {
  app_id: string;
  organization_id: string;
}

export class AppinsBackendProvider extends BackendProvider {
  accessControl: AppinsAccessControl;
  customMetadata: AppinsCustomMetadata;

  constructor(appId: string) {
    const APPINS_API_ENDPOINT = getApiEndpoint();
    super(APPINS_API_ENDPOINT, appId);
    this.accessControl = {
      roles: [],
      userGrants: [],
    };
    this.customMetadata = {
      app_id: appId,
      organization_id: "",
    };
  }
  async loadApp(): Promise<[App | undefined, AppLoadError | undefined]> {
    const token = await this.getJWTToken();
    const result = await fetch(`${this.apiEndpoint}/app-config/${this.appId}`, {
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
    const userGrants = result.user.grants;
    const roles = result.app.roles;
    const _accessControl = {
      roles,
      userGrants,
    };
    const ability = buildAbility(_accessControl);
    this.accessControl = {
      ..._accessControl,
      ability,
    };
    this.customMetadata = {
      app_id: result.app.id,
      organization_id: result.app.organization_id,
    };
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
        id: result.attributes.sub,
        email: result.attributes.email,
        name: result.attributes.name,
      },
      undefined,
    ];
  }
  async signOut(): Promise<void> {
    await Auth.signOut();
  }
  async getCurrentUser(): Promise<User | undefined> {
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser();
      return {
        id: authenticatedUser.attributes.sub,
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
  can(
    action: AUTHORIZER_ACTION,
    context: AuthorizerContext
  ): [boolean, string | undefined] {
    const _can = this.accessControl.ability?.can(action, context);
    return [!!_can, undefined];
  }
  async getSingleRecord(entity: Entity, id: string): Promise<DataRecord> {
    const token = await this.getJWTToken();
    const response = await fetch(
      `${this.apiEndpoint}/lambda-server/${this.appId}/${entity.id}/${id}`,
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
      `${this.apiEndpoint}/lambda-server/${this.appId}/${entity.id}/${id}`,
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
    const error = result.longMessage;
    return [result.record, error];
  }
  async getRecords(entity: Entity): Promise<DataRecord[]> {
    const token = await this.getJWTToken();
    const response = await fetch(
      `${this.apiEndpoint}/lambda-server/${this.appId}/${entity.id}?limit=100`,
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
  async createRecord(
    entity: Entity,
    record: DataRecord
  ): Promise<[DataRecord | undefined, string | undefined]> {
    const token = await this.getJWTToken();
    const response = await fetch(
      `${this.apiEndpoint}/lambda-server/${this.appId}/${entity.id}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(record || {}),
      }
    ).then((res) => res.json());
    const receivedRecord = response.record;
    receivedRecord.id = receivedRecord.id.toString();
    return [receivedRecord, undefined];
  }
  async deleteRecord(
    entity: Entity,
    record: DataRecord
  ): Promise<[boolean | undefined, string | undefined]> {
    const token = await this.getJWTToken();
    const response = await fetch(
      `${this.apiEndpoint}/lambda-server/${this.appId}/${entity.id}/${record.id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      }
    ).then((res) => res.json());
    return [response.success, undefined];
  }
  async uploadFile(
    file: File,
    fileKey: string,
    onProgress?: ((progress: number) => void) | undefined,
    abortSignal?: AbortSignal | undefined
  ): Promise<[string | undefined, string | undefined]> {
    const token = await this.getJWTToken();
    const response = await fetch(
      `${this.apiEndpoint}/lambda-server/${this.appId}/do`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({
          op: "_getSignedUrl",
          app_id: this.customMetadata.app_id,
          organization_id: this.customMetadata.organization_id,
          contentType: file.type,
          fileKey,
        }),
      }
    ).then((res) => res.json());
    const { signedUrl, fileKey: fileKeyResponse } = response;
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
      signal: abortSignal,
    });
    if (!uploadResponse.ok) {
      throw new Error("Upload failed");
    }
    return [fileKeyResponse, undefined];
  }
}
