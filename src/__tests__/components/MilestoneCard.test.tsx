import React from "react";
import { render, screen } from "@testing-library/react";
import MilestoneCard from "@/components/memory-lane/MilestoneCard";
import { Milestone } from "@/types/milestone";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  },
}));

describe("MilestoneCard", () => {
  const mockMilestone: Milestone = {
    id: "m1",
    date: "2019-06-15",
    title: "Test milestone",
    description: "This is a test description.",
    images: ["images/test-image.jpg"],
    tags: ["test", "demo"],
  };

  it("should render the milestone title", () => {
    render(<MilestoneCard milestone={mockMilestone} index={0} />);

    expect(screen.getByText("Test milestone")).toBeInTheDocument();
  });

  it("should render the milestone description", () => {
    render(<MilestoneCard milestone={mockMilestone} index={0} />);

    expect(
      screen.getByText("This is a test description."),
    ).toBeInTheDocument();
  });

  it("should render formatted date", () => {
    render(<MilestoneCard milestone={mockMilestone} index={0} />);

    // Should show "15 June 2019" (format may vary by locale)
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/June/)).toBeInTheDocument();
    expect(screen.getByText(/2019/)).toBeInTheDocument();
  });

  it("should render images", () => {
    render(<MilestoneCard milestone={mockMilestone} index={0} />);

    const img = screen.getByAltText("Test milestone - Photo 1");
    expect(img).toBeInTheDocument();
    // Image src is transformed by getImageUrl() to Firebase Storage URL
    expect(img).toHaveAttribute("src");
    expect(img.getAttribute("src")).toMatch(
      /firebasestorage\.googleapis\.com|\/images\//,
    );
  });

  it("should render tags", () => {
    render(<MilestoneCard milestone={mockMilestone} index={0} />);

    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("demo")).toBeInTheDocument();
  });

  it("should not show delete button when not in admin mode", () => {
    render(<MilestoneCard milestone={mockMilestone} index={0} />);

    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("should show delete button in admin mode", () => {
    render(
      <MilestoneCard milestone={mockMilestone} index={0} isAdminMode={true} />,
    );

    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should handle milestone without tags", () => {
    const milestoneNoTags: Milestone = {
      ...mockMilestone,
      tags: undefined,
    };

    render(<MilestoneCard milestone={milestoneNoTags} index={0} />);

    expect(screen.getByText("Test milestone")).toBeInTheDocument();
    expect(screen.queryByText("test")).not.toBeInTheDocument();
  });

  it("should handle milestone without images", () => {
    const milestoneNoImages: Milestone = {
      ...mockMilestone,
      images: [],
    };

    render(<MilestoneCard milestone={milestoneNoImages} index={0} />);

    expect(screen.getByText("Test milestone")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
