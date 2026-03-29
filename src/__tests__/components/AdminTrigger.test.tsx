import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminTrigger from "@/components/memory-lane/AdminTrigger";

describe("AdminTrigger", () => {
  const mockOnTrigger = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the trigger button", () => {
    render(<AdminTrigger onTrigger={mockOnTrigger} isAdminMode={false} />);

    expect(
      screen.getByRole("button", { name: /toggle admin panel/i }),
    ).toBeInTheDocument();
  });

  it("should call onTrigger when clicked", () => {
    render(<AdminTrigger onTrigger={mockOnTrigger} isAdminMode={false} />);

    fireEvent.click(screen.getByRole("button"));

    expect(mockOnTrigger).toHaveBeenCalledTimes(1);
  });

  it("should show gear icon", () => {
    render(<AdminTrigger onTrigger={mockOnTrigger} isAdminMode={false} />);

    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument();
  });

  it("should have title with hint", () => {
    render(<AdminTrigger onTrigger={mockOnTrigger} isAdminMode={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", expect.stringContaining("admin"));
  });
});
