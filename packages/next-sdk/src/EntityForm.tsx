"use client";

interface EntityFormProps {
  entity: string;
  dataTestId?: string;
}

export const EntityForm = ({ entity, dataTestId }: EntityFormProps) => {
  return (
    <div data-testid={dataTestId}>
      Entity Form Component
      {` `}
      {entity}
    </div>
  );
};
