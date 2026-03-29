import React from "react";
import { render, screen } from "@testing-library/react";
import Hero from "@/components/memory-lane/Hero";

describe("Hero", () => {
  it("should render the main title", () => {
    render(<Hero />);

    expect(screen.getByText("My Journal")).toBeInTheDocument();
  });

  it("should render the scroll hint button", () => {
    render(<Hero />);

    const scrollButton = screen.getByRole("button", {
      name: /scroll to timeline/i,
    });
    expect(scrollButton).toBeInTheDocument();
  });

  it("should render the leading icon", () => {
    render(<Hero />);

    expect(document.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("should have scroll text", () => {
    render(<Hero />);

    expect(screen.getByText("Scroll to begin")).toBeInTheDocument();
  });
});
