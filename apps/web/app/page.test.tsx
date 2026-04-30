import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the product-00 splash screen first", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "PICKIT" })).toBeInTheDocument();
    expect(screen.queryByText("오늘의 소비 고민")).not.toBeInTheDocument();
  });
});
