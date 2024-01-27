import { ResolversType } from "../../AppContext.js";
import { PROPERTY_TYPE, Property } from "../../Property.js";

const Default = ({ type }: { type: string }) => {
  return (
    <div
      style={{
        color: "white",
        fontWeight: 400,
        fontSize: "0.8rem",
        padding: "0.5rem",
        backgroundColor: "#F87171",
      }}
    >
      {" "}
      Property <b>{type}</b> input not implemented
    </div>
  );
};

const PropertyTypeInputMap = (resolvers: ResolversType) => ({
  [PROPERTY_TYPE.CHECKBOX]: resolvers.CheckboxPropertyInput,
  [PROPERTY_TYPE.CURRENCY]: resolvers.CurrencyPropertyInput,
  [PROPERTY_TYPE.DATE]: resolvers.DatePropertyInput,
  [PROPERTY_TYPE.EMAIL]: resolvers.EmailPropertyInput,
  [PROPERTY_TYPE.FILES]: resolvers.FilesPropertyInput,
  [PROPERTY_TYPE.FORMULA]: resolvers.FormulaPropertyInput,
  [PROPERTY_TYPE.MULTIPLE_SELECT]: resolvers.MultipleSelectPropertyInput,
  [PROPERTY_TYPE.NUMBER]: resolvers.NumberPropertyInput,
  [PROPERTY_TYPE.PHONE_NUMBER]: resolvers.PhoneNumberPropertyInput,
  [PROPERTY_TYPE.RADIO]: resolvers.RadioPropertyInput,
  [PROPERTY_TYPE.RICH_TEXT]: resolvers.RichTextPropertyInput,
  [PROPERTY_TYPE.SINGLE_SELECT]: resolvers.SingleSelectPropertyInput,
  [PROPERTY_TYPE.TEXT]: resolvers.TextPropertyInput,
  [PROPERTY_TYPE.URL]: resolvers.UrlPropertyInput,
  [PROPERTY_TYPE.SWITCH]: resolvers.SwitchPropertyInput,
  [PROPERTY_TYPE.RANGE]: resolvers.RangePropertyInput,
  [PROPERTY_TYPE.RELATION]: resolvers.RelationPropertyInput,
  [PROPERTY_TYPE.JSON]: () => <></>,
});

export const getInputForProperty = (
  property: Property,
  resolvers: ResolversType
) => {
  const input = PropertyTypeInputMap(resolvers)[property.type];
  return input ? input : () => <Default type={property.type} />;
};
