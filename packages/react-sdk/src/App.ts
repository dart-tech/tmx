import { Entity } from "./Entity.js";

export interface App {
  id: string;
  name: string;
  description?: string;
  entities: Record<string, Entity>;
}
