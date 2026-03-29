import React from "react";
import { render, screen } from "@testing-library/react";
import Timeline from "@/components/memory-lane/Timeline";
import { Milestone } from "@/types/milestone";

// Mock the child components
jest.mock("@/components/memory-lane/MilestoneCard", () => {
  return function MockMilestoneCard({ milestone }: { milestone: Milestone }) {
    return (
      <div data-testid={`milestone-${milestone.id}`}>{milestone.title}</div>
    );
  };
});

jest.mock("@/components/memory-lane/YearDivider", () => {
  return function MockYearDivider({ year }: { year: number }) {
    return <div data-testid={`year-${year}`}>{year}</div>;
  };
});

describe("Timeline", () => {
  const mockMilestones: Milestone[] = [
    {
      id: "m1",
      date: "2019-06-15",
      title: "First",
      description: "First description",
      images: [],
    },
    {
      id: "m2",
      date: "2020-03-10",
      title: "Second",
      description: "Second description",
      images: [],
    },
    {
      id: "m3",
      date: "2020-09-01",
      title: "Third",
      description: "Third description",
      images: [],
    },
  ];

  it("should render all milestones", () => {
    render(<Timeline milestones={mockMilestones} />);

    expect(screen.getByTestId("milestone-m1")).toBeInTheDocument();
    expect(screen.getByTestId("milestone-m2")).toBeInTheDocument();
    expect(screen.getByTestId("milestone-m3")).toBeInTheDocument();
  });

  it("should render year dividers for different years", () => {
    render(<Timeline milestones={mockMilestones} />);

    expect(screen.getByTestId("year-2019")).toBeInTheDocument();
    expect(screen.getByTestId("year-2020")).toBeInTheDocument();
  });

  it("should not duplicate year dividers for same year", () => {
    render(<Timeline milestones={mockMilestones} />);

    // There should be only one 2020 divider even though there are two 2020 milestones
    const year2020Dividers = screen.getAllByTestId("year-2020");
    expect(year2020Dividers).toHaveLength(1);
  });

  it("should render empty state when no milestones", () => {
    render(<Timeline milestones={[]} />);

    expect(screen.getByText(/no milestones yet/i)).toBeInTheDocument();
  });

  it("should have timeline section with id", () => {
    render(<Timeline milestones={mockMilestones} />);

    expect(document.getElementById("timeline")).toBeInTheDocument();
  });
});
