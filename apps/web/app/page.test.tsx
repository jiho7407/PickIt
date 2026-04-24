import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the PickIt brand area", () => {
    render(<HomePage />);

    expect(screen.getByText("PickIt")).toBeInTheDocument();
  });
});
