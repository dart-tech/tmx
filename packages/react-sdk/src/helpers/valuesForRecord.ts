import { DataRecord } from "../AppContext.js";
import { Entity } from "../Entity.js";
import { PROPERTY_TYPE, Property } from "../Property.js";

export function valuesForRecord(
  entity: Entity,
  record: DataRecord
): DataRecord | undefined {
  return entity.properties?.reduce(
    (o: DataRecord, property) => {
      const { key, value } = getInitialValueForProperty(record, property);
      o[key] = value;
      return o;
    },
    {
      id: record?.id,
    }
  );
}

function getInitialValueForProperty(
  record: DataRecord,
  property: Property
): {
  key: string;
  value: string | string[] | boolean | undefined;
} {
  const key = property.id;
  const value = record?.[property.id];
  switch (property.type) {
    case PROPERTY_TYPE.SWITCH:
      return {
        key,
        value: !!value,
      };
    case PROPERTY_TYPE.RADIO:
      return {
        key,
        value: `${value}`,
      };
    case PROPERTY_TYPE.CHECKBOX:
      return {
        key,
        value: value?.map((item: { id: string }) => `${item.id}`),
      };
    case PROPERTY_TYPE.MULTIPLE_SELECT:
      return {
        key,
        value,
      };
    case PROPERTY_TYPE.RELATION:
      const relation = property.config?.relation;
      if (relation?.type === "has_many") {
        return {
          key,
          value: value?.map((item: DataRecord) => item.id),
        };
      } else if (relation?.type === "has_one") {
        return {
          key: property.id,
          value: record?.[`${property.id.replace("_id", "")}`]?.id,
        };
      }
      break;
    default:
      return { key, value: value || "" };
  }
  return { key, value };
}
