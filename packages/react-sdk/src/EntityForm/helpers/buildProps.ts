import { App, DataRecord } from "../../AppContext.js";
import { Entity } from "../../Entity.js";
import { PROPERTY_TYPE, Property } from "../../Property.js";
import { EntityFormOverrides } from "../EntityForm.js";

type CommonInputProps = {
  name: string;
  placeholder: string;
  label: string;
  required?: boolean;
  help_text?: string;
  entity?: Entity;
  property?: Property;
  disabled?: boolean;
};

type SelectInputProps = {
  defaultValue: string[];
  options: { id: string; name: string }[];
};

export type RelationInputProps = {
  defaultValue: string[];
  target: Entity;
  relation: {
    entity: string;
    type: "has_one" | "has_many";
  };
};

type CheckboxInputProps = CommonInputProps & {
  options: { id: string; name: string }[];
};

type TextInputProps = CommonInputProps & {
  use_textarea?: boolean;
  default_value?: string;
};

type FilesInputProps = CommonInputProps & {
  file_path_prefix: string;
};

export type PropertyInputProps =
  | CommonInputProps
  | SelectInputProps
  | RelationInputProps
  | CheckboxInputProps
  | TextInputProps
  | FilesInputProps;

function Common(
  entity: Entity,
  property: Property,
  overrides?: EntityFormOverrides
): CommonInputProps {
  return {
    name: property.id,
    placeholder: `Type ${entity.name} ${property.name}`,
    label: property.name,
    required: property?.config?.required,
    help_text: property?.config?.help_text,
    entity,
    property,
    disabled: overrides?.properties?.[property.id]?.config?.disabled,
  };
}

function DefaultSelectedValuesForInputsWithOptions(
  _: Entity,
  property: Property,
  record: DataRecord
): Partial<SelectInputProps> {
  let defaultValue: string[] = [];
  if (record) {
    defaultValue = record[property.id];
    defaultValue = defaultValue?.map(
      (item) =>
        property.config?.options?.find((option) => option.id === item)?.id
    ) as string[];
  }
  return {
    defaultValue,
  };
}

function Checkbox(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): CheckboxInputProps {
  return {
    ...Common(entity, property),
    options: [],
  };
}

function Currency(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
) {
  return Common(entity, property);
}

function Date(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
) {
  return Common(entity, property);
}

function Email(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
) {
  return Common(entity, property, overrides);
}

function Files(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): FilesInputProps {
  return {
    file_path_prefix: `entity/${entity.id}`,
    ...Common(entity, property),
  };
}

function Formula(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
) {
  return Common(entity, property);
}

function MultipleSelect(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
) {
  return {
    ...Common(entity, property),
  };
}

function Number(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
) {
  return Common(entity, property);
}

function PhoneNumber(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
) {
  return Common(entity, property);
}

function Radio(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): CheckboxInputProps {
  return {
    ...Common(entity, property),
    options: [],
  };
}

function RichText(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): CommonInputProps {
  return Common(entity, property);
}

function SingleSelect(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): SelectInputProps {
  return {
    ...Common(entity, property),
    options: property?.config?.options || [],
    defaultValue: record[property?.id],
  };
}

function Text(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): TextInputProps {
  return {
    ...Common(entity, property),
    use_textarea: property?.config?.use_textarea,
    default_value: property?.config?.default_value,
  };
}

function URL(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): CommonInputProps {
  return Common(entity, property);
}

function Switch(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): CommonInputProps {
  return Common(entity, property);
}

function Range(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): CommonInputProps {
  return Common(entity, property);
}

function JSON(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): CommonInputProps {
  return Common(entity, property);
}

function Relation(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): RelationInputProps {
  const relation = property.config?.relation;
  const targetEntity = app.entities[relation?.entity!];
  let defaultValue = [];
  if (record) {
    const toMap = relation?.type === "has_one" ? [record] : record[property.id];
    defaultValue = toMap
      ?.map((item: DataRecord) => item.id || item)
      .flat()
      .filter((withVal: string) => withVal);
  }

  return {
    ...Common(entity, property),
    target: targetEntity,
    defaultValue,
    relation,
  };
}

export type InputProps = Property & {
  property: Property;
  inputProps: PropertyInputProps;
};

export function buildPropsForProperty(
  entity: Entity,
  property: Property,
  record: DataRecord,
  app: App,
  overrides: EntityFormOverrides
): PropertyInputProps {
  const PropertyTypePropsBuilder = {
    [PROPERTY_TYPE.CHECKBOX]: Checkbox,
    [PROPERTY_TYPE.CURRENCY]: Currency,
    [PROPERTY_TYPE.DATE]: Date,
    [PROPERTY_TYPE.EMAIL]: Email,
    [PROPERTY_TYPE.FILES]: Files,
    [PROPERTY_TYPE.FORMULA]: Formula,
    [PROPERTY_TYPE.MULTIPLE_SELECT]: MultipleSelect,
    [PROPERTY_TYPE.NUMBER]: Number,
    [PROPERTY_TYPE.PHONE_NUMBER]: PhoneNumber,
    [PROPERTY_TYPE.RADIO]: Radio,
    [PROPERTY_TYPE.RICH_TEXT]: RichText,
    [PROPERTY_TYPE.SINGLE_SELECT]: SingleSelect,
    [PROPERTY_TYPE.TEXT]: Text,
    [PROPERTY_TYPE.URL]: URL,
    [PROPERTY_TYPE.SWITCH]: Switch,
    [PROPERTY_TYPE.RANGE]: Range,
    [PROPERTY_TYPE.RELATION]: Relation,
    [PROPERTY_TYPE.JSON]: JSON,
  };
  const builder = PropertyTypePropsBuilder[property.type];
  if (!builder) {
    throw new Error(`Property type ${property.type} is not supported yet.`);
  }
  return builder(entity, property, record, app, overrides);
}
