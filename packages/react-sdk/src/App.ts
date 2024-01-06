import { Entity } from "./Entity";

export interface App {
  id: string;
  name: string;
  entities: Entity[];
}
