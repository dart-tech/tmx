import { useState } from "react";
import { AUTHORIZER_ACTION, DataRecord, useAppState } from "../AppContext.js";
import { DeleteRecordIcon } from "../Icons/DeleteRecordIcon.js";
import { Entity } from "../Entity.js";

export enum RECORD_ACTION_TYPE {
  "NEW_RECORD" = "newRecord",
  "DUPLICATE_RECORD" = "duplicateRecord",
  "DELETE_RECORD" = "deleteRecord",
  "CUSTOM_ACTION" = "customAction",
}

export interface EntityRecordCustomAction {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  color?: string;
  onClick: (record: DataRecord) => void;
}

export function EntityRecordActions(props: {
  entity: Entity;
  record: DataRecord;
  customActions?: EntityRecordCustomAction[];
  onActionComplete: ({ action }: { action: RECORD_ACTION_TYPE }) => void;
}) {
  const { Resolvers, can } = useAppState();
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";
  const [triggeredAction, setTriggeredAction] =
    useState<RECORD_ACTION_TYPE | null>(null);
  const [canDeleteRecord] = can(AUTHORIZER_ACTION.DELETE_RECORD, {
    entity: props.entity,
    record: props.record,
  });
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "1rem",
      }}
    >
      <Resolvers.Dropdown>
        <Resolvers.DropdownTrigger>
          <Resolvers.Button variant="bordered">Actions</Resolvers.Button>
        </Resolvers.DropdownTrigger>
        <Resolvers.DropdownMenu
          variant="faded"
          aria-label="Dropdown menu with description"
          onAction={(action: RECORD_ACTION_TYPE) => {
            setTriggeredAction(action);
          }}
          disabledKeys={[
            ...[canDeleteRecord ? "" : RECORD_ACTION_TYPE.DELETE_RECORD],
          ]}
        >
          {props.customActions?.map((action) => (
            <Resolvers.DropdownItem
              key={action.id}
              shortcut={action.shortcut}
              description={action.description}
              color={action.color}
              onClick={() => {
                action.onClick(props.record);
              }}
            >
              {action.label}
            </Resolvers.DropdownItem>
          )) ?? []}
          <Resolvers.DropdownItem
            key={RECORD_ACTION_TYPE.NEW_RECORD}
            shortcut="⌘N"
            description="Create a new record"
          >
            New record
          </Resolvers.DropdownItem>
          <Resolvers.DropdownItem
            key={RECORD_ACTION_TYPE.DUPLICATE_RECORD}
            shortcut="⌘C"
            description="Duplicate the record"
            showDivider
          >
            Duplicate
          </Resolvers.DropdownItem>

          <Resolvers.DropdownItem
            key={RECORD_ACTION_TYPE.DELETE_RECORD}
            className="text-danger"
            color="danger"
            shortcut="⌘⇧D"
            description="Permanently delete the record"
            startContent={
              <DeleteRecordIcon className={iconClasses + " text-danger"} />
            }
          >
            Delete
          </Resolvers.DropdownItem>
        </Resolvers.DropdownMenu>
      </Resolvers.Dropdown>
      {triggeredAction == RECORD_ACTION_TYPE.DELETE_RECORD && (
        <DeleteRecordAction
          onClose={(actionCompleted) => {
            setTriggeredAction(null);
            if (actionCompleted) {
              props.onActionComplete({
                action: RECORD_ACTION_TYPE.DELETE_RECORD,
              });
            }
          }}
          entity={props.entity}
          record={props.record}
        />
      )}
    </div>
  );
}

function DeleteRecordAction(props: {
  entity: Entity;
  record: DataRecord;
  onClose: (actionCompleted?: boolean) => void;
}) {
  const { Resolvers, backendProvider, removeDataBlockRecord } = useAppState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    const performAction = async () => {
      try {
        setBusy(true);
        setError("");
        const [success, error] = await backendProvider.deleteRecord(
          props.entity,
          props.record
        );

        if (success) {
          removeDataBlockRecord(props.entity.id, props.record.id);
          props.onClose(true);
        } else if (error) {
          setError(error);
        } else {
          setError("Something went wrong");
        }
        setBusy(false);
      } catch (error) {
        setBusy(false);
        setError((error as Error).message);
      }
    };

    performAction();
  };
  return (
    <Resolvers.Modal
      isOpen
      onOpenChange={() => {
        props.onClose();
      }}
      isDismissable={false}
    >
      <Resolvers.ModalContent>
        {(onClose: { onClose: () => void }) => (
          <>
            <Resolvers.ModalHeader className="flex flex-col gap-1">
              Confirm
            </Resolvers.ModalHeader>
            <Resolvers.ModalBody>
              <p>Are you sure you want to delete this record?</p>
              <p>
                <b>Note:</b> This action cannot be undone. Also make sure that
                you have deleted all the related records.
              </p>
              {error && <p className="text-danger">{error}</p>}
            </Resolvers.ModalBody>
            <Resolvers.ModalFooter>
              <Resolvers.Button
                color="danger"
                variant="light"
                onPress={onClose}
              >
                Close
              </Resolvers.Button>
              <Resolvers.Button
                color="danger"
                onPress={onSubmit}
                isLoading={busy}
              >
                Yes, Delete
              </Resolvers.Button>
            </Resolvers.ModalFooter>
          </>
        )}
      </Resolvers.ModalContent>
    </Resolvers.Modal>
  );
}
