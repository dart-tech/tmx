import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EntityForm } from "../EntityForm";

describe("EntityForm", () => {
  it("renders a EntityForm", () => {
    render(
      <EntityForm entity="My entity" dataTestId="renders_a_entity_form" />
    );

    expect(screen.getByTestId("renders_a_entity_form")).toBeInTheDocument();
    expect(screen.getByTestId("renders_a_entity_form")).toHaveTextContent(
      "My entity"
    );
  });
});
