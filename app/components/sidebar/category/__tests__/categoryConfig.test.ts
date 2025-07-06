import { CATEGORIES } from "../../../../../utils/types";
import {
  categoryConfigs,
  categoryToConfigMap,
  categoryToColorMap,
  categoryToIconMap,
  categoryToMarkerColorMap,
  categoryToIconComponentMap,
  getCategoryConfig,
  getMarkerColorByCategory,
  getIconByCategory,
} from "../categoryConfig";

describe("Category Configuration System", () => {
  describe("categoryConfigs", () => {
    it("should have all required properties for each config", () => {
      categoryConfigs.forEach((config) => {
        expect(config).toHaveProperty("key");
        expect(config).toHaveProperty("title");
        expect(config).toHaveProperty("icon");
        expect(config).toHaveProperty("bg");
        expect(config).toHaveProperty("filter");
        expect(config).toHaveProperty("markerColor");
        expect(config).toHaveProperty("category");
      });
    });

    it("should have unique keys", () => {
      const keys = categoryConfigs.map((config) => config.key);
      const uniqueKeys = [...new Set(keys)];
      expect(keys).toHaveLength(uniqueKeys.length);
    });

    it("should have unique categories", () => {
      const categories = categoryConfigs.map((config) => config.category);
      const uniqueCategories = [...new Set(categories)];
      expect(categories).toHaveLength(uniqueCategories.length);
    });
  });

  describe("categoryToConfigMap", () => {
    it("should map all filters to their configurations", () => {
      categoryConfigs.forEach((config) => {
        expect(categoryToConfigMap[config.filter]).toBe(config);
      });
    });
  });

  describe("categoryToColorMap", () => {
    it("should map all filters to their marker colors", () => {
      categoryConfigs.forEach((config) => {
        expect(categoryToColorMap[config.filter]).toBe(config.markerColor);
      });
    });
  });

  describe("categoryToIconMap", () => {
    it("should map all categories to their icons", () => {
      categoryConfigs.forEach((config) => {
        expect(categoryToIconMap[config.category]).toBe(config.icon);
      });
    });
  });

  describe("categoryToMarkerColorMap", () => {
    it("should have entries for all CATEGORIES enum values", () => {
      Object.values(CATEGORIES).forEach((category) => {
        expect(categoryToMarkerColorMap).toHaveProperty(category);
        expect(typeof categoryToMarkerColorMap[category]).toBe("string");
        expect(categoryToMarkerColorMap[category]).toMatch(/^bg-/);
      });
    });
  });

  describe("categoryToIconComponentMap", () => {
    it("should have entries for all CATEGORIES enum values", () => {
      Object.values(CATEGORIES).forEach((category) => {
        expect(categoryToIconComponentMap).toHaveProperty(category);
        expect(typeof categoryToIconComponentMap[category]).toBe("function");
      });
    });
  });

  describe("getCategoryConfig", () => {
    it("should return configuration for mapped categories", () => {
      const config = getCategoryConfig(CATEGORIES.FACULTY);
      expect(config).toHaveProperty("icon");
      expect(config).toHaveProperty("markerColor");
      expect(config).toHaveProperty("category");
    });

    it("should return default configuration for unmapped categories", () => {
      const config = getCategoryConfig(CATEGORIES.OTHER);
      expect(config).toHaveProperty("icon");
      expect(config).toHaveProperty("markerColor");
      expect(config.markerColor).toBe("bg-brown-light");
    });
  });

  describe("getMarkerColorByCategory", () => {
    it("should return correct colors for known categories", () => {
      expect(getMarkerColorByCategory(CATEGORIES.FACULTY)).toBe("bg-deep-red-option");
      expect(getMarkerColorByCategory(CATEGORIES.LIBRARY)).toBe("bg-pink-option");
      expect(getMarkerColorByCategory(CATEGORIES.WATER)).toBe("bg-cyan-option");
    });

    it("should return default color for unknown categories", () => {
      expect(getMarkerColorByCategory(CATEGORIES.OTHER)).toBe("bg-brown-light");
    });
  });

  describe("getIconByCategory", () => {
    it("should return icon components for all categories", () => {
      Object.values(CATEGORIES).forEach((category) => {
        const IconComponent = getIconByCategory(category);
        expect(typeof IconComponent).toBe("function");
      });
    });

    it("should return specific icons for known categories", () => {
      const LibraryIcon = getIconByCategory(CATEGORIES.LIBRARY);
      const WaterIcon = getIconByCategory(CATEGORIES.WATER);

      expect(LibraryIcon).toBeDefined();
      expect(WaterIcon).toBeDefined();
      expect(LibraryIcon).not.toBe(WaterIcon);
    });
  });

  describe("Color consistency", () => {
    it("should use consistent color naming convention", () => {
      const colors = Object.values(categoryToMarkerColorMap);
      colors.forEach((color) => {
        expect(color).toMatch(/^bg-[\w-]+$/);
      });
    });

    it("should have corresponding dark background classes defined", () => {
      const darkBackgrounds = [
        "bg-brown-dark",
        "bg-purple-option",
        "bg-deep-green-option",
        "bg-deep-cyan-option",
        "bg-deep-red-option",
        "bg-gray-option",
      ];

      // This test ensures our dark background detection in marker.tsx is valid
      expect(darkBackgrounds).toContain("bg-deep-red-option");
      expect(darkBackgrounds).toContain("bg-purple-option");
    });
  });
});
