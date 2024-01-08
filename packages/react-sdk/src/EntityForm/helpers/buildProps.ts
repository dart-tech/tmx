import { DataRecord } from "../../AppContext.js";
import { Entity } from "../../Entity.js";
import { PROPERTY_TYPE, Property } from "../../Property.js";

function Common(entity: Entity, property: Property) {
  return {
    name: property.id,
    placeholder: `Type ${entity.name} ${property.name}`,
    label: property.name,
    required: property?.config?.required,
    help_text: property?.config?.help_text,
  };
}

function DefaultSelectedValuesForInputsWithOptions(
  _: Entity,
  property: Property,
  record: DataRecord
) {
  let defaultSelectedValues: string[] = [];
  if (record) {
    defaultSelectedValues = record[property.id];
    defaultSelectedValues = defaultSelectedValues?.map(
      (item) =>
        property.config?.options?.find((option) => option.id === item)?.id
    ) as string[];
  }
  return {
    defaultSelectedValues,
  };
}

function DefaultSelectedValuesForRelation(_: Entity, property: Property) {
  let defaultSelectedValues: string[] = [];
  return {
    defaultSelectedValues,
  };
}

function Checkbox(entity: Entity, property: Property) {
  return {
    ...Common(entity, property),
    options: [],
  };
}

function Currency(entity: Entity, property: Property) {
  return Common(entity, property);
}

function Date(entity: Entity, property: Property) {
  return Common(entity, property);
}

function Email(entity: Entity, property: Property) {
  return Common(entity, property);
}

function Files(entity: Entity, property: Property) {
  return {
    file_path_prefix: `entity/${entity.id}`,
    ...Common(entity, property),
  };
}

function Formula(entity: Entity, property: Property) {
  return Common(entity, property);
}

function MultipleSelect(entity: Entity, property: Property) {
  return {
    ...Common(entity, property),
  };
}

function Number(entity: Entity, property: Property) {
  return Common(entity, property);
}

function PhoneNumber(entity: Entity, property: Property) {
  return Common(entity, property);
}

function Radio(entity: Entity, property: Property) {
  return {
    ...Common(entity, property),
    options: [],
  };
}

function RichText(entity: Entity, property: Property) {
  return Common(entity, property);
}

function SingleSelect(entity: Entity, property: Property, record: DataRecord) {
  return {
    ...Common(entity, property),
    options: property?.config?.options,
    defaultValue: record[property?.id],
  };
}

function Text(entity: Entity, property: Property) {
  return {
    ...Common(entity, property),
    use_textarea: property?.config?.use_textarea,
    default_value: property?.config?.default_value,
  };
}

function URL(entity: Entity, property: Property) {
  return Common(entity, property);
}

function Switch(entity: Entity, property: Property) {
  return Common(entity, property);
}

function Range(entity: Entity, property: Property) {
  return Common(entity, property);
}

function JSON(entity: Entity, property: Property) {
  return Common(entity, property);
}

function Relation(entity: Entity, property: Property) {
  return {};
}

export function buildPropsForProperty(
  entity: Entity,
  property: Property,
  record: DataRecord
) {
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
  return builder(entity, property, record);
}
