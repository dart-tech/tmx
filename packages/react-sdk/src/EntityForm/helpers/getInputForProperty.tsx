import { DataRecord, ResolversType } from "../../AppContext.js";
import { PROPERTY_TYPE, Property } from "../../Property.js";

const Default = () => {
  return <></>;
};

export const getInputForProperty = (
  property: Property,
  resolvers: ResolversType
) => {
  switch (property.type) {
    case PROPERTY_TYPE.TEXT:
      return resolvers.TextProperty;
    case PROPERTY_TYPE.SINGLE_SELECT:
      return resolvers.SingleSelectProperty;
    case PROPERTY_TYPE.URL:
      return resolvers.UrlProperty;
    case PROPERTY_TYPE.SWITCH:
      return resolvers.SwitchProperty;
    case PROPERTY_TYPE.RICH_TEXT:
      return resolvers.RichTextProperty;
    case PROPERTY_TYPE.FILES:
      return resolvers.FilesProperty;
    default:
      return Default;
  }
};
