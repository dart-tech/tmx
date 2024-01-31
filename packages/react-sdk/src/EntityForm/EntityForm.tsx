import { useEffect, useMemo, useState } from "react";
import { DataRecord, useAppState } from "../AppContext.js";
import { useForm, SubmitHandler } from "react-hook-form";
import { PROPERTY_TYPE, Property } from "../Property.js";
import { buildPropsForProperty } from "./helpers/buildProps.js";
import { getInputForProperty } from "./helpers/getInputForProperty.js";
import { formValueDiff } from "./helpers/formValueDiff.js";
import { valuesForRecord } from "../helpers/valuesForRecord.js";
import { Entity } from "../Entity.js";

interface EntityFormProps {
  id: string;
  record?: {
    id: string;
  };
  dataTestId?: string;
  omitWrapper?: boolean;
  overrides?: EntityFormOverrides;
}

export interface EntityFormOverrides {
  properties?: Record<string, Property>;
  entity?: Entity;
}
export const EntityForm = ({
  id,
  record,
  dataTestId,
  omitWrapper,
  overrides,
}: EntityFormProps) => {
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    app,
    Resolvers,
    setDataBlockRecord,
    backendProvider,
    getDataBlockRecord,
  } = useAppState();
  const entity = app?.entities[id];

  const { control, handleSubmit, reset, ...formProps } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    if (!entity) {
      return;
    }
    if (record?.id) {
      const getDataRecord = async () => {
        const dataRecord = await backendProvider.getSingleRecord(
          entity,
          record.id
        );
        setDataBlockRecord(id, dataRecord);
        const values = valuesForRecord(entity, dataRecord);
        reset(values);
        setBusy(false);
      };
      getDataRecord();
    }
  }, [entity, record?.id]);

  useEffect(() => {
    reset(undefined);
  }, [record?.id]);

  const currentRecord = record?.id ? getDataBlockRecord(id, record?.id) : null;
  const properties = useMemo(() => {
    return entity?.properties
      ?.filter(
        (property: Property) => property.type !== PROPERTY_TYPE.AUTO_INCREMENT
      )
      .map((property: Property) => {
        return {
          ...property,
          inputProps: {
            ...buildPropsForProperty(
              entity,
              property,
              currentRecord as DataRecord,
              app!,
              overrides!
            ),
            formProps,
          },
        };
      });
  }, [entity, currentRecord]);

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      setIsSubmitting(true);
      if (record?.id) {
        const currentRecord = getDataBlockRecord(id, record?.id);

        const toSave = formValueDiff({
          defaultValues: valuesForRecord(entity!, currentRecord),
          values: data,
        });
        const [savedRecord, error] = await backendProvider.saveRecord(entity, {
          id: data.id,
          ...toSave,
        });
        if (error) {
          setError(error);
        }
        if (savedRecord) {
          setDataBlockRecord(id, {
            id: savedRecord.id,
            ...toSave,
          });
        }
      }
    } catch (error) {
      let message = "An error occurred.";
      if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Wrapper = omitWrapper
    ? "div"
    : ({ children }: { children: React.ReactNode }) => (
        <Resolvers.Card
          style={{
            maxWidth: "95%",
          }}
        >
          <Resolvers.CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <h1 className="text-md">{entity.name}</h1>
              <p className="text-small text-default-500">
                {entity?.description}
              </p>
            </div>
          </Resolvers.CardHeader>
          <Resolvers.Divider />
          <Resolvers.CardBody>{children}</Resolvers.CardBody>
        </Resolvers.Card>
      );

  return (
    <div data-testid={dataTestId}>
      <Wrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          {properties?.map((property: Property) => {
            const Input = getInputForProperty(property, Resolvers);
            return (
              <div
                style={{
                  marginBottom: "1rem",
                }}
              >
                {" "}
                <Resolvers.Skeleton isLoaded={!busy} className="rounded-lg">
                  <Input
                    key={property.id}
                    recordId={record?.id}
                    inputProps={property.inputProps}
                    control={control}
                  />
                </Resolvers.Skeleton>
              </div>
            );
          })}
          {error && (
            <Resolvers.Card
              style={{
                marginBottom: "1rem",
              }}
              className="text-red-500"
            >
              <Resolvers.CardBody>{error}</Resolvers.CardBody>
            </Resolvers.Card>
          )}
          <div>
            <Resolvers.Button
              type="submit"
              style={{
                marginTop: "1rem",
              }}
              isLoading={isSubmitting}
            >
              Save
            </Resolvers.Button>
          </div>
        </form>
      </Wrapper>
    </div>
  );
};
