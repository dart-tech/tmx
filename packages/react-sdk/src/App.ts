import { Entity } from "./Entity";

export interface App {
  id: string;
  name: string;
  description?: string;
  entities: Record<string, Entity>;
}
