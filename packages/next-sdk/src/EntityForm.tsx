"use client";

interface EntityFormProps {
  entity: string;
}

export const EntityForm = ({ entity }: EntityFormProps) => {
  return (
    <div>
      Entity Form Component
      {` `}
      {entity}
    </div>
  );
};
