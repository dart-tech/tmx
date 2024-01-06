"use client";

interface EntityFormProps {
  id: string;
  dataTestId?: string;
}

export const EntityForm = ({ id, dataTestId }: EntityFormProps) => {
  return (
    <div data-testid={dataTestId}>
      Entity Form Component
      {` `}
      {id}
    </div>
  );
};
