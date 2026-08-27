import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LookbookPage from "../LookbookPage";

describe("LookbookPage Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lookbook header and category filters", () => {
    render(
      <MemoryRouter>
        <LookbookPage />
      </MemoryRouter>
    );

    // Verify page header titles
    expect(screen.getByText("Celebration Lookbook Gallery")).toBeInTheDocument();
    expect(screen.getByText("Luxury Event Photography")).toBeInTheDocument();
    expect(
      screen.getByText(/Browse real event styling portfolios, floral arches/)
    ).toBeInTheDocument();

    // Verify gallery filter tabs are rendered by role and name
    expect(screen.getByRole("button", { name: "All Celebrations" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Birthdays" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anniversaries" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Love Surprises" })).toBeInTheDocument();
  });

  it("renders default gallery items", () => {
    render(
      <MemoryRouter>
        <LookbookPage />
      </MemoryRouter>
    );

    // Verify some default items are rendered
    expect(screen.getByText("Luxury Rooftop Gala")).toBeInTheDocument();
    expect(screen.getByText("Candlelight Anniversary Table")).toBeInTheDocument();
    expect(screen.getByText("Romantic Suite Decoration")).toBeInTheDocument();
  });
});
