import { useEffect, useState } from "react";
import { useAppState } from "../AppContext.js";
import { EntityForm } from "../index.js";
import { RecordFormatter } from "../Formatter/RecordFormatter.js";

interface EntityViewProps {
  id: string;
  dataTestId?: string;
}

export function EntityView(props: EntityViewProps) {
  const { Resolvers, backendProvider, app, setDataBlock, getDataBlock } =
    useAppState();
  const entityId = props.id;
  const entity = app?.entities[entityId];
  const [activeRecord, setActiveRecord] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const records = getDataBlock(entityId);

  useEffect(() => {
    if (!entity) {
      return;
    }
    const getDataBlock = async () => {
      try {
        setBusy(true);
        const list = await backendProvider.getRecords(entity);
        setDataBlock(entityId, list);
        setActiveRecord(list[0]?.id || null);
      } catch (e) {
        console.error(e);
      } finally {
        setBusy(false);
      }
    };
    getDataBlock();
  }, [entity]);
  return (
    <div
      style={{
        maxWidth: "95%",
      }}
    >
      <div className="flex gap-3 p-3 z-10 w-full justify-start items-center shrink-0 overflow-inherit color-inherit subpixel-antialiased rounded-t-large flex gap-3">
        <div className="flex flex-col">
          <h1 className="text-md">{entity.name}</h1>
          <p className="text-small text-default-500">{entity?.description}</p>
        </div>
      </div>
      <Resolvers.Divider />

      {busy ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Resolvers.Spinner />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexBasis: "100%",
              flex: 1,
            }}
          >
            {records.length ? (
              <Resolvers.Listbox
                aria-label="Actions"
                style={{
                  paddingRight: 0,
                  marginTop: "0.8rem",
                }}
                selectionMode="single"
                selectedKeys={[`key-${activeRecord}` || ""]}
                defaultSelectedKeys={[`key-${activeRecord}` || ""]}
              >
                {records.map((record) => {
                  return (
                    <Resolvers.ListboxItem
                      key={`key-${record.id}`}
                      onClick={() => setActiveRecord(record.id)}
                      isActive={activeRecord === record.id}
                      style={{
                        marginBottom: "0.4rem",
                        padding: "1rem",
                      }}
                    >
                      <RecordFormatter entity={entity} record={record} />
                    </Resolvers.ListboxItem>
                  );
                })}
              </Resolvers.Listbox>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexBasis: "100%",
              flex: 3,
            }}
          >
            {!activeRecord ? (
              <NoRecordSelected />
            ) : (
              <div
                style={{
                  padding: "1rem",
                }}
              >
                <EntityForm
                  id={entityId}
                  record={{
                    id: activeRecord,
                  }}
                  omitWrapper
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NoRecordSelected() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <p
        style={{
          color: "#9CA3AF",
        }}
      >
        Select a record to start editing
      </p>
    </div>
  );
}
