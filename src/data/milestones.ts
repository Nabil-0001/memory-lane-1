import { Milestone } from "@/types/milestone";

export const defaultMilestones: Milestone[] = [
  {
    id: "m1",
    date: "2017-09-04",
    title: "Test Entry 01",
    description: "Hello.",
    images: ["test_entry_01.jpg"],
    tags: ["test", "sample"],
  },
  {
    id: "m2",
    date: "2018-06-12",
    title: "Test Entry 02",
    description: "My name is Steve.",
    images: ["test_entry_02.jpg"],
    tags: ["test", "hello"],
  },
  {
    id: "m3",
    date: "2019-11-08",
    title: "Test Entry 03",
    description: "This is a sample milestone.",
    images: ["test_entry_03.jpg"],
    tags: ["test", "demo"],
  },
  {
    id: "m4",
    date: "2020-05-30",
    title: "Test Entry 04",
    description: "Testing the timeline layout.",
    images: ["test_entry_04.jpg"],
    tags: ["layout", "sample"],
  },
  {
    id: "m5",
    date: "2021-02-01",
    title: "Test Entry 05",
    description: "More generic placeholder content.",
    images: ["test_entry_05.jpg"],
    tags: ["placeholder", "test"],
  },
  {
    id: "m6",
    date: "2022-07-18",
    title: "Test Entry 06",
    description: "Another sample record for development.",
    images: ["test_entry_06.jpg"],
    tags: ["development", "sample"],
  },
  {
    id: "m7",
    date: "2023-04-09",
    title: "Test Entry 07",
    description: "Checking image rendering with sample data.",
    images: ["test_entry_07.jpg"],
    tags: ["images", "test"],
  },
  {
    id: "m8",
    date: "2024-10-21",
    title: "Test Entry 08",
    description: "Generic content for admin panel testing.",
    images: ["test_entry_08.jpg"],
    tags: ["admin", "demo"],
  },
  {
    id: "m9",
    date: "2025-12-05",
    title: "Test Entry 09",
    description: "Final placeholder entry.",
    images: ["test_entry_09.jpg"],
    tags: ["final", "sample"],
  },
];

export const STORAGE_KEY = "memory_lane_milestones";
