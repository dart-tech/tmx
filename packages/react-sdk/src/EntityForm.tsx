import { useAppState } from "@tmx/react-sdk/AppContext";

interface EntityFormProps {
  id: string;
  dataTestId?: string;
}

export const EntityForm = ({ id, dataTestId }: EntityFormProps) => {
  const appState = useAppState();
  console.log("appState", appState);
  return (
    <div data-testid={dataTestId}>
      {appState.app?.name}
      EntityForm
      {` `}
      {id}
    </div>
  );
};
