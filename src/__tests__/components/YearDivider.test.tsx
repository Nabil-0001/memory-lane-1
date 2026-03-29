import React from "react";
import { render, screen } from "@testing-library/react";
import YearDivider from "@/components/memory-lane/YearDivider";

describe("YearDivider", () => {
  it("should render the year", () => {
    render(<YearDivider year={2023} />);

    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("should render different years correctly", () => {
    const { rerender } = render(<YearDivider year={2019} />);
    expect(screen.getByText("2019")).toBeInTheDocument();

    rerender(<YearDivider year={2025} />);
    expect(screen.getByText("2025")).toBeInTheDocument();
  });
});
