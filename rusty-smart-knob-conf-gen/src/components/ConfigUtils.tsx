import { DetentPosition } from "./ConfigItem";

// Constants for detent strength
export const DETENT_STRENGTH = {
  "No Detents": 0,
  "Weak Detents": 1,
  "Strong Detents": 2,
};

// Default RGB color for led_hue (blue = #0088ff)
export const DEFAULT_COLOR = "#0088ff";

// Default custom detent strength
export const DEFAULT_CUSTOM_DETENT_STRENGTH = "0.5";

// Interface for a configuration item
export interface ConfigItem {
  id: number;
  name: string;
  entityId: string;
  detentOption: string;
  min: string;
  max: string;
  color: string;
  customDetentStrength: string;
  detentPositions: DetentPosition[];
  emphasizeExtremeValues: boolean;
  rotation: string;
}

// Generate a unique ID for new items
export const getNextId = (items: ConfigItem[]): number => {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
};

// Create a new empty config item
export const createEmptyConfigItem = (id: number): ConfigItem => {
  return {
    id,
    name: "",
    entityId: "",
    detentOption: "",
    min: "0",
    max: "-1",
    color: DEFAULT_COLOR,
    customDetentStrength: DEFAULT_CUSTOM_DETENT_STRENGTH,
    detentPositions: [],
    emphasizeExtremeValues: false,
    rotation: "",
  };
};

// Check if a field is valid
export const isFieldValid = (item: any, field: string): boolean => {
  // Name validation
  if (field === "name") {
    return item.name.length > 0 && item.name.length <= 16;
  }

  // Entity ID validation
  if (field === "entityId") {
    return item.entityId.length > 0;
  }

  // Detent option validation
  if (field === "detentOption") {
    return item.detentOption !== "";
  }

  // Custom detent strength validation
  if (field === "customDetentStrength" && item.detentOption === "Custom") {
    const value = parseFloat(item.customDetentStrength);
    return !isNaN(value) && value >= 0 && value <= 9.9;
  }

  // Min/max validation - always required now
  if (field === "min" || field === "max") {
    return item[field] !== "";
  }

  // Detent position validation
  if (field === "detentPosition") {
    const position = parseInt(item.position);
    const min = parseInt(item.min);
    const max = parseInt(item.max);

    // Check if it's a valid number
    if (isNaN(position)) return false;

    // If we have defined min and max (no end stops), check if position is within range
    if (!isNaN(min) && !isNaN(max) && max !== -1) {
      return position >= min && position <= max;
    }

    return true;
  }

  // Rotation field validation
  if (field === "rotation") {
    if (item.rotation === "") return true; // Empty is valid (will use default)

    const value = parseFloat(item.rotation);
    return !isNaN(value) && value > 0; // Must be a positive number
  }

  return true;
};

// Function to check if any custom detent position is invalid
export const hasInvalidDetentPositions = (item: ConfigItem): boolean => {
  if (!item.detentPositions || item.detentPositions.length === 0) return false;
  
  return item.detentPositions.some((pos: DetentPosition) => {
    // Position must be a valid number
    if (pos.position === "" || isNaN(parseInt(pos.position))) {
      return true;
    }

    // Check if position is within min/max range when end stops are enabled
    const posValue: number = parseInt(pos.position);
    const minValue: number = parseInt(item.min);
    const maxValue: number = parseInt(item.max);

    if (!isNaN(minValue) && !isNaN(maxValue) && maxValue !== -1) {
      if (posValue < minValue || posValue > maxValue) {
        return true;
      }
    }

    // Strength must be a valid number between 0 and 9.9
    const strengthValue: number = parseFloat(pos.strength);
    if (isNaN(strengthValue) || strengthValue < 0 || strengthValue > 9.9) {
      return true;
    }

    return false;
  });
};

// Check if all required fields have valid values
export const checkAllItemsValid = (configItems: ConfigItem[]): boolean => {
  return configItems.every((item) => {
    // Basic fields validation
    if (!item.name || !item.entityId || !item.detentOption) {
      return false;
    }

    // Check name length (should be 1-16 characters)
    if (item.name.length === 0 || item.name.length > 16) {
      return false;
    }

    // Custom detent strength validation
    if (item.detentOption === "Custom") {
      const value = parseFloat(item.customDetentStrength);
      if (isNaN(value) || value < 0 || value > 9.9) {
        return false;
      }

      // Check if any custom detent positions are invalid
      if (hasInvalidDetentPositions(item)) {
        return false;
      }
    }

    // Check min/max values - always required
    if (item.min === "" || item.max === "") {
      return false;
    }

    // Validate rotation if provided
    if (item.rotation !== "") {
      const rotationValue = parseFloat(item.rotation);
      if (isNaN(rotationValue) || rotationValue <= 0) {
        return false;
      }
    }

    // All validations passed
    return true;
  });
};

// Helper function to convert hex color to hue value (0-360)
export const hexToHue = (hex: string): number => {
  // Remove the # from the beginning
  hex = hex.replace(/^#/, "");

  // Parse the RGB components
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;

  if (max === min) {
    h = 0; // achromatic
  } else {
    const d = max - min;
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return Math.round(h);
};

// Calculate width_radians based on rotation field or default calculation
export const calculateWidthRadians = (item: ConfigItem): number => {
  // If rotation is explicitly set, use it to calculate width_radians
  if (item.rotation && item.rotation !== "") {
    const rotationValue = parseFloat(item.rotation);
    if (!isNaN(rotationValue) && rotationValue > 0) {
      return (2 * Math.PI) / (100 / rotationValue);
    }
  }

  // Calculate total steps
  const min = parseInt(item.min);
  const max = parseInt(item.max);

  // If min and max are valid and max is not -1 (unlimited)
  if (!isNaN(min) && !isNaN(max) && max !== -1) {
    const totalSteps = max - min + 1;

    // For min=0 and max=1 (2 steps), use 20% of full circle
    if (min === 0 && max === 1) {
      return 2 * Math.PI * 0.2;
    }

    // Otherwise use 80% of full circle divided by number of steps
    return (2 * Math.PI * 0.8) / totalSteps;
  }

  // Default value for unlimited rotation
  return 2 * Math.PI * 0.01; // Small value for unlimited rotation
};

// Format config items with detent_positions and snap_point_bias
export const formatConfigItems = (configItems: ConfigItem[]) => {
  return configItems.map((item) => {
    const minPosition = item.min !== "" ? parseInt(item.min) : 0;
    const maxPosition = item.max !== "" ? parseInt(item.max) : -1;

    // Calculate width_radians based on the rotation field or default calculation
    const widthRadians = calculateWidthRadians(item);

    // Process detent positions based on the selected option
    let detentPositions: number[] = [];
    let snapPointBias: number[] = [];

    if (item.detentOption === "Custom") {
      // If using custom detent option
      const baseDetentStrength = parseFloat(item.customDetentStrength) || 0;

      // If custom positions are defined, use them
      if (item.detentPositions.length > 0) {
        detentPositions = item.detentPositions
          .filter((pos) => pos.position !== "")
          .map((pos) => parseInt(pos.position));

        snapPointBias = item.detentPositions
          .filter((pos) => pos.position !== "")
          .map((pos) => parseFloat(pos.strength) || 0);
      } else {
        // If "emphasize extreme values" is checked but no custom positions,
        // Create detent positions at min, max, and middle
        if (
          item.emphasizeExtremeValues &&
          minPosition !== -1 &&
          maxPosition !== -1
        ) {
          // Determine a middle position if min and max are defined
          const middlePosition = Math.floor((minPosition + maxPosition) / 2);

          // Add min, middle, max positions
          detentPositions = [minPosition, middlePosition, maxPosition];
          snapPointBias = [
            baseDetentStrength * 2, // Double strength at min
            baseDetentStrength, // Normal strength in the middle
            baseDetentStrength * 2, // Double strength at max
          ];
        }
      }
    } else {
      // For predefined detent options
      const detentStrength =
        DETENT_STRENGTH[item.detentOption as keyof typeof DETENT_STRENGTH] ||
        0;

      // For predefined options with "emphasize extreme values" checked
      if (
        item.emphasizeExtremeValues &&
        minPosition !== -1 &&
        maxPosition !== -1
      ) {
        const middlePosition = Math.floor((minPosition + maxPosition) / 2);
        detentPositions = [minPosition, middlePosition, maxPosition];
        snapPointBias = [
          detentStrength * 2, // Double strength at min
          detentStrength, // Normal strength in the middle
          detentStrength * 2, // Double strength at max
        ];
      }
    }

    const baseConfig = {
      position: 0,
      min_position: minPosition,
      max_position: maxPosition,
      width_radians: widthRadians,
      detent_strength:
        parseFloat(item.customDetentStrength) ||
        DETENT_STRENGTH[item.detentOption as keyof typeof DETENT_STRENGTH] ||
        0,
      endstop_strength: 1,
      text: `${item.name}\n${
        item.detentOption === "Custom"
          ? `Custom (${item.customDetentStrength})`
          : item.detentOption
      }`,
      led_hue: hexToHue(item.color),
      entity_id: item.entityId,
    };

    // Add detent_positions and snap_point_bias if they exist
    if (detentPositions.length > 0) {
      return {
        ...baseConfig,
        detent_positions: detentPositions,
        snap_point_bias: snapPointBias,
      };
    }

    return baseConfig;
  });
};
