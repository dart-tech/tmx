import { App, Entity, Property, PropertyType } from "@tmx/react-sdk";

export interface Root {
  user: User;
  app: AppinsApp;
}

export interface User {
  authenticated: boolean;
  hasAccess: boolean;
  grants: Grant[];
  id: string;
}

export interface AppinsApp {
  id: number;
  slug: string;
  name: string;
  description: string;
  created_by_id: string;
  organization_id: number;
  rest_api_id: string;
  status: number;
  booted: boolean;
  layout_settings: LayoutSettings;
  created_at: string;
  updated_at: string;
  status_code: number;
  status_reason: string;
  own_resources: boolean;
  signed_app_style: string;
  entities: Record<string, AppinsEntity>;
  apis: Api[];
  roles: Role[];
  users: User[];
  cacheExtended: CacheExtended;
  public_identifier: string;
}

export interface LayoutSettings {
  layout: string;
  container: string;
}

export interface AppinsEntity {
  id: number;
  name: string;
  description: string;
  table_name: string;
  hidden: boolean;
  schema_only: boolean;
  enable_auto_save: boolean;
  draft_mode: boolean;
  properties: AppinsProperty[];
  identity_property: AppinsProperty;
}

export interface AppinsProperty {
  id: number;
  name: string;
  type: string;
  column_name: string;
  config?: Config;
  entity_id: number;
}

export interface Config {
  is_primary_key: boolean;
  type: string;
  required: boolean;
  help_text: string;
  use_textarea: boolean;
  default_value: string;
  options: {
    id: string;
    name: string;
  }[];
}

export interface Option {
  name: string;
  id: string;
}

export interface Api {
  id: number;
  name: string;
  description: string;
  type: string;
  group: string;
  function_name: string;
  created_by_id: string;
  app_id: number;
  status: number;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  grants: Grant[];
}

export interface Grant {
  id: number;
  resource: string;
  action: string;
  attributes: string;
  conditions?: Conditions;
  role_id: number;
}

export interface Conditions {
  created_by_id: string;
}

export interface CacheExtended {}

export function mapApp(appConfig: Root): App {
  const { app } = appConfig;
  return {
    id: app.public_identifier,
    name: app.name,
    description: app.description,
    entities: Object.keys(app.entities).reduce(
      (accumulator: Record<string, Entity>, entityId: string) => {
        const entity = app.entities[entityId];
        if (!entity) {
          return accumulator;
        }
        accumulator[entity.table_name] = {
          id: entity.table_name,
          name: entity.name,
          description: entity.description,
          config: {
            hidden: entity.hidden,
          },
          identity_property: entity.identity_property
            ? mapProperty(entity.identity_property)
            : undefined,
          properties: entity.properties.map((property) =>
            mapProperty(property)
          ),
        };
        return accumulator;
      },
      {}
    ),
  };
}

function mapProperty(property: AppinsProperty): Property {
  return {
    id: property.column_name,
    name: property.name,
    type: property.type as PropertyType,
    config: {
      help_text: property.config?.help_text,
      required: property.config?.required,
      use_textarea: property.config?.use_textarea,
      default_value: property.config?.default_value,
      options: property.config?.options,
    },
  };
}
