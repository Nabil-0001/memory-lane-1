import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteConfirmation from "@/components/memory-lane/DeleteConfirmation";

describe("DeleteConfirmation", () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const testTitle = "Test milestone";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the milestone title", () => {
    render(
      <DeleteConfirmation
        title={testTitle}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText(/Test milestone/)).toBeInTheDocument();
  });

  it("should render confirmation message", () => {
    render(
      <DeleteConfirmation
        title={testTitle}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(
      screen.getByText(/are you sure you want to delete/i),
    ).toBeInTheDocument();
  });

  it("should render Cancel and Delete buttons", () => {
    render(
      <DeleteConfirmation
        title={testTitle}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should call onCancel when Cancel is clicked", () => {
    render(
      <DeleteConfirmation
        title={testTitle}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should call onConfirm when Delete is clicked", () => {
    render(
      <DeleteConfirmation
        title={testTitle}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("should call onCancel when overlay is clicked", () => {
    const { container } = render(
      <DeleteConfirmation
        title={testTitle}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );

    // Click on the overlay (the outer div)
    const overlay = container.firstChild as HTMLElement;
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
