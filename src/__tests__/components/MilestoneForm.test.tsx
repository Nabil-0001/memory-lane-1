import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MilestoneForm from "@/components/memory-lane/MilestoneForm";
import { Milestone } from "@/types/milestone";

// Mock the gcsStorage module
jest.mock("@/utils/gcsStorage", () => ({
  uploadImage: jest.fn(),
  isStorageConfigured: jest.fn(() => true),
  getImageFilename: jest.fn((path: string) => path.split("/").pop() || path),
}));

describe("MilestoneForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render empty form for new milestone", () => {
    render(<MilestoneForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue("");
    expect(screen.getByLabelText(/date/i)).toHaveValue("");
    expect(screen.getByLabelText(/description/i)).toHaveValue("");
  });

  it("should render pre-filled form when editing", () => {
    const milestone: Milestone = {
      id: "test1",
      title: "Test Title",
      date: "2020-06-15",
      description: "Test description",
      images: ["images/test.jpg"],
      tags: ["test", "demo"],
    };

    render(
      <MilestoneForm
        milestone={milestone}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue("Test Title");
    expect(screen.getByLabelText(/date/i)).toHaveValue("2020-06-15");
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      "Test description",
    );
  });

  it("should show validation errors for empty required fields", () => {
    render(<MilestoneForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /add milestone/i }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Date is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with form data when valid", () => {
    render(<MilestoneForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "New Title" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2023-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "New description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add milestone/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: "New Title",
      date: "2023-01-01",
      description: "New description",
      images: [],
      tags: [],
    });
  });

  it("should call onCancel when Cancel button is clicked", () => {
    render(<MilestoneForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should parse image paths correctly from manual input", () => {
    render(<MilestoneForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2023-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/enter image paths manually/i),
      {
        target: { value: "images/a.jpg, images/b.jpg" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: /add milestone/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        images: ["images/a.jpg", "images/b.jpg"],
      }),
    );
  });

  it("should parse tags correctly", () => {
    render(<MilestoneForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2023-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: "career, travel, reflection" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add milestone/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ["career", "travel", "reflection"],
      }),
    );
  });

  it('should show "Save Changes" button when editing', () => {
    const milestone: Milestone = {
      id: "test1",
      title: "Test",
      date: "2020-01-01",
      description: "Test",
      images: [],
    };

    render(
      <MilestoneForm
        milestone={milestone}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("should render upload button", () => {
    render(<MilestoneForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText(/^Upload Images$/)).toBeInTheDocument();
  });

  it("should show image previews when milestone has images", () => {
    const milestone: Milestone = {
      id: "test1",
      title: "Test",
      date: "2020-01-01",
      description: "Test",
      images: ["photo1.jpg", "photo2.jpg"],
    };

    render(
      <MilestoneForm
        milestone={milestone}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    // Should show the image filenames
    expect(screen.getByText("photo1.jpg")).toBeInTheDocument();
    expect(screen.getByText("photo2.jpg")).toBeInTheDocument();
  });

  it("should have remove buttons for each image", () => {
    const milestone: Milestone = {
      id: "test1",
      title: "Test",
      date: "2020-01-01",
      description: "Test",
      images: ["photo1.jpg", "photo2.jpg"],
    };

    render(
      <MilestoneForm
        milestone={milestone}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const removeButtons = screen.getAllByTitle(/remove image/i);
    expect(removeButtons).toHaveLength(2);
  });
});
