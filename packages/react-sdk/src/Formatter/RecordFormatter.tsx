import { DataRecord } from "../AppContext.js";
import { Entity } from "../Entity.js";
import { PROPERTY_TYPE } from "../Property.js";

interface RecordFormatterProps {
  entity: Entity;
  record: DataRecord;
}
export function RecordFormatter(props: RecordFormatterProps) {
  const identityProperty = props.entity?.identity_property;
  const value = props.record?.[identityProperty?.id as string];
  const type = identityProperty?.type;
  if (type === PROPERTY_TYPE.SINGLE_SELECT) {
    const options = identityProperty?.config?.options;
    const option = options?.find((option) => option.id === value);
    return <>{option?.name}</>;
  }
  if (value) {
    return <>{truncateString(value, 30)}</>;
  } else {
    return <>Untitiled...</>;
  }
}

export function truncateString(str: string, length: number) {
  if (str?.length > length) {
    return str?.slice(0, length) + "...";
  } else {
    return str;
  }
}
