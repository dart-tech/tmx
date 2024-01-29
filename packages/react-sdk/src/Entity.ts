import { Property } from "./Property.js";

export interface Entity {
  id: string;
  name: string;
  description?: string;
  properties: Property[];
  identity_property?: Property;
  config: {
    hidden: boolean;
    auto_save: boolean;
  };
}
