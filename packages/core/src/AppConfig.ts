import { Entity } from "./Entity";

export interface AppConfig {
  id: string;
  name: string;
  entities: Entity[];
}
