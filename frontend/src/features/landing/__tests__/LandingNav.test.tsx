import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingNav from "../LandingNav";

describe("LandingNav Component", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    // Mock window.location
    delete (window as any).location;
    window.location = { ...originalLocation, href: "" } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  it("renders guest navigation links when user is not logged in", () => {
    render(
      <MemoryRouter>
        <LandingNav />
      </MemoryRouter>
    );

    // Verify guest links are visible
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Plan a Celebration")).toBeInTheDocument();
    expect(screen.getByText("Browse Planners")).toBeInTheDocument();
    
    // Dashboard and Sign out should not be visible
    expect(screen.queryByText("Dashboard ➔")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
  });

  it("renders authenticated links when user is logged in", () => {
    localStorage.setItem("access_token", "dummy-token");

    render(
      <MemoryRouter>
        <LandingNav />
      </MemoryRouter>
    );

    // Verify auth links are visible
    expect(screen.getByText("Dashboard ➔")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();

    // Guest links should not be visible
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.queryByText("Plan a Celebration")).not.toBeInTheDocument();
    expect(screen.queryByText("Browse Planners")).not.toBeInTheDocument();
  });

  it("clears tokens and redirects to /login on Sign out click", () => {
    localStorage.setItem("access_token", "dummy-token");
    localStorage.setItem("refresh_token", "dummy-refresh-token");

    render(
      <MemoryRouter>
        <LandingNav />
      </MemoryRouter>
    );

    const signOutBtn = screen.getByText("Sign out");
    fireEvent.click(signOutBtn);

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });
});
