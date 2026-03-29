import { defaultMilestones, STORAGE_KEY } from "@/data/milestones";

describe("milestones data", () => {
  describe("defaultMilestones", () => {
    it("should have at least one milestone", () => {
      expect(defaultMilestones.length).toBeGreaterThan(0);
    });

    it("should have unique IDs for all milestones", () => {
      const ids = defaultMilestones.map((m) => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid date format for all milestones", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      defaultMilestones.forEach((milestone) => {
        expect(milestone.date).toMatch(dateRegex);
        expect(new Date(milestone.date).toString()).not.toBe("Invalid Date");
      });
    });

    it("should have required fields for all milestones", () => {
      defaultMilestones.forEach((milestone) => {
        expect(milestone.id).toBeDefined();
        expect(milestone.title).toBeDefined();
        expect(milestone.title.length).toBeGreaterThan(0);
        expect(milestone.description).toBeDefined();
        expect(milestone.description.length).toBeGreaterThan(0);
        expect(milestone.date).toBeDefined();
        expect(milestone.images).toBeDefined();
        expect(Array.isArray(milestone.images)).toBe(true);
      });
    });

    it("should have at least one image path for most milestones", () => {
      const milestonesWithImages = defaultMilestones.filter(
        (m) => m.images.length > 0,
      );

      // At least 80% should have images
      expect(
        milestonesWithImages.length / defaultMilestones.length,
      ).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("STORAGE_KEY", () => {
    it("should be defined", () => {
      expect(STORAGE_KEY).toBeDefined();
      expect(typeof STORAGE_KEY).toBe("string");
    });

    it("should be a valid key name", () => {
      expect(STORAGE_KEY.length).toBeGreaterThan(0);
      expect(STORAGE_KEY).not.toContain(" ");
    });
  });
});
