import {
  loadMilestones,
  saveMilestones,
  clearMilestones,
  generateMilestoneId,
  sortMilestonesByDate,
  formatDate,
  getYear,
  validateMilestone,
  parseImagePaths,
  imagesToString,
} from "@/utils/milestoneUtils";
import { defaultMilestones, STORAGE_KEY } from "@/data/milestones";
import { Milestone } from "@/types/milestone";

// Helper to reset localStorage mock
const mockLocalStorage = window.localStorage as jest.Mocked<Storage>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("milestoneUtils", () => {
  describe("loadMilestones", () => {
    it("should return default milestones when localStorage is empty", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = loadMilestones();

      expect(result).toEqual(defaultMilestones);
    });

    it("should return milestones from localStorage when valid", () => {
      const storedMilestones: Milestone[] = [
        {
          id: "test1",
          date: "2020-01-01",
          title: "Test",
          description: "Test description",
          images: [],
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(storedMilestones),
      );

      const result = loadMilestones();

      expect(result).toEqual(storedMilestones);
    });

    it("should return default milestones when localStorage has invalid JSON", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid json");

      const result = loadMilestones();

      expect(result).toEqual(defaultMilestones);
    });

    it("should return default milestones when localStorage has empty array", () => {
      mockLocalStorage.getItem.mockReturnValue("[]");

      const result = loadMilestones();

      expect(result).toEqual(defaultMilestones);
    });
  });

  describe("saveMilestones", () => {
    it("should save milestones to localStorage", () => {
      const milestones: Milestone[] = [
        {
          id: "test1",
          date: "2020-01-01",
          title: "Test",
          description: "Test description",
          images: [],
        },
      ];

      const result = saveMilestones(milestones);

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(milestones),
      );
    });

    it("should return false when localStorage throws", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });

      const result = saveMilestones([]);

      expect(result).toBe(false);
    });
  });

  describe("clearMilestones", () => {
    it("should remove milestones from localStorage and return defaults", () => {
      const result = clearMilestones();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual(defaultMilestones);
    });
  });

  describe("generateMilestoneId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateMilestoneId();
      const id2 = generateMilestoneId();

      expect(id1).not.toEqual(id2);
      expect(id1).toMatch(/^m_\d+_[a-z0-9]+$/);
    });
  });

  describe("sortMilestonesByDate", () => {
    it("should sort milestones by date (oldest first)", () => {
      const milestones: Milestone[] = [
        {
          id: "2",
          date: "2022-01-01",
          title: "Second",
          description: "",
          images: [],
        },
        {
          id: "3",
          date: "2023-01-01",
          title: "Third",
          description: "",
          images: [],
        },
        {
          id: "1",
          date: "2021-01-01",
          title: "First",
          description: "",
          images: [],
        },
      ];

      const sorted = sortMilestonesByDate(milestones);

      expect(sorted[0].id).toBe("1");
      expect(sorted[1].id).toBe("2");
      expect(sorted[2].id).toBe("3");
    });

    it("should not mutate the original array", () => {
      const milestones: Milestone[] = [
        {
          id: "2",
          date: "2022-01-01",
          title: "Second",
          description: "",
          images: [],
        },
        {
          id: "1",
          date: "2021-01-01",
          title: "First",
          description: "",
          images: [],
        },
      ];

      const sorted = sortMilestonesByDate(milestones);

      expect(milestones[0].id).toBe("2");
      expect(sorted).not.toBe(milestones);
    });
  });

  describe("formatDate", () => {
    it('should format date as "day month year"', () => {
      const result = formatDate("2019-06-15");

      // The format depends on locale, but should include day, month, year
      expect(result).toContain("15");
      expect(result).toContain("June");
      expect(result).toContain("2019");
    });
  });

  describe("getYear", () => {
    it("should extract year from date string", () => {
      expect(getYear("2019-06-15")).toBe(2019);
      expect(getYear("2023-12-31")).toBe(2023);
    });
  });

  describe("validateMilestone", () => {
    it("should return no errors for valid milestone", () => {
      const milestone = {
        title: "Test Title",
        date: "2020-01-01",
        description: "Test description",
      };

      const errors = validateMilestone(milestone);

      expect(errors).toHaveLength(0);
    });

    it("should return error for missing title", () => {
      const milestone = {
        title: "",
        date: "2020-01-01",
        description: "Test description",
      };

      const errors = validateMilestone(milestone);

      expect(errors).toContain("Title is required");
    });

    it("should return error for missing date", () => {
      const milestone = {
        title: "Test",
        date: "",
        description: "Test description",
      };

      const errors = validateMilestone(milestone);

      expect(errors).toContain("Date is required");
    });

    it("should return error for invalid date", () => {
      const milestone = {
        title: "Test",
        date: "not-a-date",
        description: "Test description",
      };

      const errors = validateMilestone(milestone);

      expect(errors).toContain("Invalid date format");
    });

    it("should return error for missing description", () => {
      const milestone = {
        title: "Test",
        date: "2020-01-01",
        description: "   ",
      };

      const errors = validateMilestone(milestone);

      expect(errors).toContain("Description is required");
    });

    it("should return multiple errors", () => {
      const milestone = {
        title: "",
        date: "",
        description: "",
      };

      const errors = validateMilestone(milestone);

      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("parseImagePaths", () => {
    it("should parse comma-separated paths", () => {
      const input = "images/a.jpg, images/b.jpg, images/c.jpg";

      const result = parseImagePaths(input);

      expect(result).toEqual(["images/a.jpg", "images/b.jpg", "images/c.jpg"]);
    });

    it("should handle single path", () => {
      const result = parseImagePaths("images/single.jpg");

      expect(result).toEqual(["images/single.jpg"]);
    });

    it("should filter empty strings", () => {
      const result = parseImagePaths("images/a.jpg, , images/b.jpg");

      expect(result).toEqual(["images/a.jpg", "images/b.jpg"]);
    });

    it("should handle empty input", () => {
      const result = parseImagePaths("");

      expect(result).toEqual([]);
    });
  });

  describe("imagesToString", () => {
    it("should convert array to comma-separated string", () => {
      const images = ["images/a.jpg", "images/b.jpg"];

      const result = imagesToString(images);

      expect(result).toBe("images/a.jpg, images/b.jpg");
    });

    it("should handle single image", () => {
      const result = imagesToString(["images/single.jpg"]);

      expect(result).toBe("images/single.jpg");
    });

    it("should handle empty array", () => {
      const result = imagesToString([]);

      expect(result).toBe("");
    });
  });
});
