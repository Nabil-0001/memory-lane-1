import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminPanel from "@/components/memory-lane/AdminPanel";
import { Milestone } from "@/types/milestone";

// Mock MilestoneForm to simplify testing
jest.mock("@/components/memory-lane/MilestoneForm", () => {
  return function MockMilestoneForm({ onCancel }: { onCancel: () => void }) {
    return (
      <div data-testid="milestone-form">
        <button onClick={onCancel}>Cancel Form</button>
      </div>
    );
  };
});

describe("AdminPanel", () => {
  const mockMilestones: Milestone[] = [
    {
      id: "m1",
      date: "2019-06-15",
      title: "First Milestone",
      description: "First description",
      images: [],
    },
    {
      id: "m2",
      date: "2020-03-10",
      title: "Second Milestone",
      description: "Second description",
      images: [],
    },
  ];

  const defaultProps = {
    milestones: mockMilestones,
    onAdd: jest.fn().mockResolvedValue(undefined),
    onUpdate: jest.fn().mockResolvedValue(undefined),
    onDelete: jest.fn().mockResolvedValue(undefined),
    onReset: jest.fn().mockResolvedValue(undefined),
    onClose: jest.fn(),
    isAuthenticated: false,
    onAuthenticate: jest.fn().mockResolvedValue(null),
    onLogout: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Admin sign-in screen", () => {
    it("should render email and password form when not authenticated", () => {
      render(<AdminPanel {...defaultProps} />);

      expect(screen.getByText("Admin Access")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/enter admin email/i),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/enter admin password/i),
      ).toBeInTheDocument();
    });

    it("should show error for failed sign-in", async () => {
      const mockAuth = jest
        .fn()
        .mockResolvedValue("Invalid email or password.");
      render(<AdminPanel {...defaultProps} onAuthenticate={mockAuth} />);

      fireEvent.change(screen.getByPlaceholderText(/admin email/i), {
        target: { value: "admin@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/admin password/i), {
        target: { value: "wrongpassword" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /sign in as admin/i }),
      );

      expect(
        await screen.findByText(/invalid email or password/i),
      ).toBeInTheDocument();
    });

    it("should call onAuthenticate with email and password", async () => {
      const mockAuth = jest.fn().mockResolvedValue(null);
      render(<AdminPanel {...defaultProps} onAuthenticate={mockAuth} />);

      fireEvent.change(screen.getByPlaceholderText(/admin email/i), {
        target: { value: "admin@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/admin password/i), {
        target: { value: "testpassword" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: /sign in as admin/i }),
      );

      await waitFor(() => {
        expect(mockAuth).toHaveBeenCalledWith(
          "admin@example.com",
          "testpassword",
        );
      });
    });

    it("should close panel when close button clicked", () => {
      render(<AdminPanel {...defaultProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: /close admin panel/i }),
      );

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Authenticated admin panel", () => {
    const authProps = { ...defaultProps, isAuthenticated: true };

    it("should render admin panel when authenticated", () => {
      render(<AdminPanel {...authProps} />);

      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    });

    it("should show list of milestones", () => {
      render(<AdminPanel {...authProps} />);

      expect(screen.getByText("First Milestone")).toBeInTheDocument();
      expect(screen.getByText("Second Milestone")).toBeInTheDocument();
    });

    it("should show milestone count", () => {
      render(<AdminPanel {...authProps} />);

      expect(screen.getByText(/milestones \(2\)/i)).toBeInTheDocument();
    });

    it("should show Add New Milestone button", () => {
      render(<AdminPanel {...authProps} />);

      expect(
        screen.getByRole("button", { name: /add new milestone/i }),
      ).toBeInTheDocument();
    });

    it("should show Sign Out button", () => {
      render(<AdminPanel {...authProps} />);

      expect(
        screen.getByRole("button", { name: /sign out/i }),
      ).toBeInTheDocument();
    });

    it("should show edit form when Add New Milestone clicked", () => {
      render(<AdminPanel {...authProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: /add new milestone/i }),
      );

      expect(screen.getByTestId("milestone-form")).toBeInTheDocument();
    });

    it("should show Reset to Defaults button", () => {
      render(<AdminPanel {...authProps} />);

      expect(
        screen.getByRole("button", { name: /reset to defaults/i }),
      ).toBeInTheDocument();
    });

    it("should show confirmation before reset", () => {
      render(<AdminPanel {...authProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: /reset to defaults/i }),
      );

      expect(
        screen.getByText(/reset all milestones to defaults/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /yes, reset/i }),
      ).toBeInTheDocument();
    });

    it("should call onReset when confirmed", () => {
      render(<AdminPanel {...authProps} />);

      fireEvent.click(
        screen.getByRole("button", { name: /reset to defaults/i }),
      );
      fireEvent.click(screen.getByRole("button", { name: /yes, reset/i }));

      expect(authProps.onReset).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete when delete button clicked", () => {
      render(<AdminPanel {...authProps} />);

      const deleteButtons = screen.getAllByRole("button", {
        name: /delete milestone/i,
      });
      fireEvent.click(deleteButtons[0]);

      expect(authProps.onDelete).toHaveBeenCalledWith("m1");
    });
  });
});
