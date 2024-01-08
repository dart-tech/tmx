export const PROPERTY_TYPE = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  EMAIL: "email",
  URL: "url",
  RICH_TEXT: "rich_text",
  PHONE_NUMBER: "phone_number",
  SINGLE_SELECT: "single_select",
  FILES: "files",
  RADIO: "radio",
  CURRENCY: "currency",
  FORMULA: "formula",
  MULTIPLE_SELECT: "multiple_select",
  CHECKBOX: "checkbox",
  SWITCH: "switch",
  RANGE: "range",
  RELATION: "relation",
  AUTO_INCREMENT: "auto_increment",
  JSON: "json",
};

export type PropertyType = keyof typeof PROPERTY_TYPE;

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  config?: {
    required?: boolean;
    help_text?: string;
    use_textarea?: boolean;
    default_value?: string;
    options?: {
      id: string;
      name: string;
    }[];
  };
}
