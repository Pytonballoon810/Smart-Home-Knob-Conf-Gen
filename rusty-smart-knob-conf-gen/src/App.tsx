import { useState, useEffect } from "react";
import "./App.css";
import ConfigItem, { DetentPosition } from "./components/ConfigItem";

function App() {
  // Use a standard width_radians value (10 degrees in radians)
  const DEFAULT_WIDTH_RADIANS = 10 * Math.PI / 180;

  // Constants for detent strength
  const DETENT_STRENGTH = {
    "No Detents": 0,
    "Weak Detents": 1,
    "Strong Detents": 2
  };

  // Default RGB color for led_hue (blue = 200)
  const DEFAULT_COLOR = "#0088ff"; // This approximately corresponds to hue 200

  // Default custom detent strength
  const DEFAULT_CUSTOM_DETENT_STRENGTH = "0.5";

  // Simplified config item structure with customDetentStrength and detent positions
  const [configItems, setConfigItems] = useState([
    { 
      id: 1, 
      name: "", 
      entityId: "", 
      detentOption: "", 
      min: "0", 
      max: "-1", 
      color: DEFAULT_COLOR, 
      customDetentStrength: DEFAULT_CUSTOM_DETENT_STRENGTH,
      detentPositions: [] as DetentPosition[],
      emphasizeExtremeValues: false,
      step: "" // Add the step property to match the interface
    }
  ]);

  // State for notification
  const [notification, setNotification] = useState({ visible: false, message: "" });

  // Hide notification after 5 seconds
  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        setNotification({ visible: false, message: "" });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.visible]);

  // Generate a unique ID for new items
  const getNextId = () => {
    return configItems.length > 0 
      ? Math.max(...configItems.map(item => item.id)) + 1 
      : 1;
  };

  const addConfigItem = () => {
    setConfigItems([
      ...configItems, 
      { 
        id: getNextId(), 
        name: "", 
        entityId: "", 
        detentOption: "", 
        min: "0", 
        max: "-1", 
        color: DEFAULT_COLOR, 
        customDetentStrength: DEFAULT_CUSTOM_DETENT_STRENGTH,
        detentPositions: [] as DetentPosition[],
        emphasizeExtremeValues: false,
        step: "" // Add the step property for new items as well
      }
    ]);
  };

  const deleteConfigItem = (id:number) => {
    setConfigItems(configItems.filter(item => item.id !== id));
  };

  const updateConfigItem = (id:number, field:string, value:any) => {
    // Limit name to 16 characters
    if (field === "name" && value.length > 16) {
      value = value.slice(0, 16);
    }
    
    // For customDetentStrength, ensure it's a valid number with one decimal place
    if (field === "customDetentStrength" && value !== "") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Round to 1 decimal place
        value = Math.min(9.9, Math.max(0, numValue)).toFixed(1);
      }
    }
    
    setConfigItems(
      configItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Check if a field is valid
  const isFieldValid = (item: any, field: string) => {
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
    
    return true;
  };

  // Check if all required fields have valid values
  const checkAllItemsValid = () => {
    return configItems.every(item => {
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
        
        // Validate all custom detent positions if any exist
        if (item.detentPositions.length > 0) {
          // Check if all positions have valid values
          const allPositionsValid = item.detentPositions.every(pos => {
            // Position must be a valid number
            if (pos.position === "" || isNaN(parseInt(pos.position))) {
              return false;
            }
            
            // Check if position is within min/max range when end stops are enabled
            const posValue = parseInt(pos.position);
            const minValue = parseInt(item.min);
            const maxValue = parseInt(item.max);
            
            if (!isNaN(minValue) && !isNaN(maxValue) && maxValue !== -1) {
              if (posValue < minValue || posValue > maxValue) {
                return false;
              }
            }
            
            // Strength must be a valid number between 0 and 9.9
            const strengthValue = parseFloat(pos.strength);
            if (isNaN(strengthValue) || strengthValue < 0 || strengthValue > 9.9) {
              return false;
            }
            
            return true;
          });
          
          if (!allPositionsValid) {
            return false;
          }
        }
      }
      
      // Check min/max values - always required
      if (item.min === "" || item.max === "") {
        return false;
      }
      
      // All validations passed
      return true;
    });
  };

  const allItemsValid = checkAllItemsValid();
  
  // Helper function to convert hex color to hue value (0-360)
  const hexToHue = (hex: string): number => {
    // Remove the # from the beginning
    hex = hex.replace(/^#/, '');
    
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

  // Format config items with detent_positions and snap_point_bias
  const formatConfigItems = () => {
    return configItems.map(item => {
      const minPosition = item.min !== "" ? parseInt(item.min) : 0;
      const maxPosition = item.max !== "" ? parseInt(item.max) : -1;
      
      // Use default width_radians
      const widthRadians = DEFAULT_WIDTH_RADIANS;
      
      // Process detent positions based on the selected option
      let detentPositions: number[] = [];
      let snapPointBias: number[] = [];
      
      if (item.detentOption === "Custom") {
        // If using custom detent option
        const baseDetentStrength = parseFloat(item.customDetentStrength) || 0;
        
        // If custom positions are defined, use them
        if (item.detentPositions.length > 0) {
          detentPositions = item.detentPositions
            .filter(pos => pos.position !== "")
            .map(pos => parseInt(pos.position));
          
          snapPointBias = item.detentPositions
            .filter(pos => pos.position !== "")
            .map(pos => parseFloat(pos.strength) || 0);
        } else {
          // If "emphasize extreme values" is checked but no custom positions,
          // Create detent positions at min, max, and middle
          if (item.emphasizeExtremeValues && minPosition !== -1 && maxPosition !== -1) {
            // Determine a middle position if min and max are defined
            const middlePosition = Math.floor((minPosition + maxPosition) / 2);
            
            // Add min, middle, max positions
            detentPositions = [minPosition, middlePosition, maxPosition];
            snapPointBias = [
              baseDetentStrength * 2, // Double strength at min
              baseDetentStrength,     // Normal strength in the middle
              baseDetentStrength * 2  // Double strength at max
            ];
          }
        }
      } else {
        // For predefined detent options
        const detentStrength = DETENT_STRENGTH[item.detentOption as keyof typeof DETENT_STRENGTH] || 0;
        
        // For predefined options with "emphasize extreme values" checked
        if (item.emphasizeExtremeValues && minPosition !== -1 && maxPosition !== -1) {
          const middlePosition = Math.floor((minPosition + maxPosition) / 2);
          detentPositions = [minPosition, middlePosition, maxPosition];
          snapPointBias = [
            detentStrength * 2,  // Double strength at min
            detentStrength,      // Normal strength in the middle
            detentStrength * 2   // Double strength at max
          ];
        }
      }
      
      const baseConfig = {
        position: 0,
        min_position: minPosition,
        max_position: maxPosition,
        width_radians: widthRadians,
        detent_strength: parseFloat(item.customDetentStrength) || DETENT_STRENGTH[item.detentOption as keyof typeof DETENT_STRENGTH] || 0,
        endstop_strength: 1,
        text: `${item.name}\n${item.detentOption === "Custom" ? `Custom (${item.customDetentStrength})` : item.detentOption}`,
        led_hue: hexToHue(item.color),
        entity_id: item.entityId
      };

      // Add detent_positions and snap_point_bias if they exist
      if (detentPositions.length > 0) {
        return {
          ...baseConfig,
          detent_positions: detentPositions,
          snap_point_bias: snapPointBias
        };
      }
      
      return baseConfig;
    });
  };
  
  const generateConfig = () => {
    const formattedConfig = formatConfigItems();
    const configText = JSON.stringify(formattedConfig, null, 2);
    const blob = new Blob([configText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smart_knob_conf.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyConfigToClipboard = () => {
    const formattedConfig = formatConfigItems();
    // Use compact JSON without indentation for clipboard copy
    const compactConfigText = JSON.stringify(formattedConfig);
    navigator.clipboard.writeText(compactConfigText).then(() => {
      setNotification({ visible: true, message: "Compact configuration copied to clipboard!" });
    }).catch(err => {
      console.error("Failed to copy config: ", err);
      setNotification({ visible: true, message: "Failed to copy configuration!" });
    });
  };

  // Function to handle reordering items
  const reorderItems = (startIndex: number, endIndex: number) => {
    const result = Array.from(configItems);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    setConfigItems(result);
  };

  return (
    <main className="container">
      <h1>Smart Knob Config Creator</h1>
      
      <div className="config-items">
        <div className="drag-container">
          {configItems.map((item, index) => (
            <div key={item.id} className="draggable-item">
              <ConfigItem 
                item={item}
                onUpdate={updateConfigItem}
                onDelete={deleteConfigItem}
                isFieldValid={isFieldValid}
                dragHandleProps={{
                  onMouseDown: (e: React.MouseEvent) => {
                    e.preventDefault();
                    const dragElement = e.currentTarget.closest('.draggable-item');
                    if (!dragElement) return;
                    
                    const container = document.querySelector('.drag-container');
                    if (!container) return;
                    
                    // Store initial values for calculating position changes
                    const initialY = e.clientY;
                    const initialIndex = index;
                    const itemHeight = dragElement.getBoundingClientRect().height;
                    const items = Array.from(container.children) as HTMLElement[];
                    
                    // Create a clone for dragging visual
                    const clone = dragElement.cloneNode(true) as HTMLElement;
                    clone.style.position = 'absolute';
                    clone.style.zIndex = '1000';
                    // @ts-ignore
                    clone.style.width = `${dragElement.offsetWidth}px`;
                    clone.style.opacity = '0.8';
                    clone.style.pointerEvents = 'none';
                    document.body.appendChild(clone);
                    
                    // Position the clone at the initial position
                    clone.style.top = `${dragElement.getBoundingClientRect().top}px`;
                    clone.style.left = `${dragElement.getBoundingClientRect().left}px`;
                    
                    // Hide the original element during drag
                    const placeholder = document.createElement('div');
                    placeholder.style.height = `${itemHeight}px`;
                    placeholder.className = 'drag-placeholder';
                    // @ts-ignore
                    dragElement.style.visibility = 'hidden';
                    dragElement.parentNode?.insertBefore(placeholder, dragElement);
                    
                    let currentIndex = initialIndex;
                    
                    const onMouseMove = (e: MouseEvent) => {
                      const deltaY = e.clientY - initialY;
                      clone.style.transform = `translateY(${deltaY}px)`;
                      
                      // Calculate the new index
                      const newIndex = Math.max(0, Math.min(
                        Math.floor((e.clientY - container.getBoundingClientRect().top) / itemHeight),
                        items.length - 1
                      ));
                      
                      if (newIndex !== currentIndex) {
                        // Move the placeholder
                        if (newIndex < currentIndex) {
                          container.insertBefore(placeholder, items[newIndex]);
                        } else {
                          const nextSibling = items[newIndex].nextSibling;
                          if (nextSibling) {
                            container.insertBefore(placeholder, nextSibling);
                          } else {
                            container.appendChild(placeholder);
                          }
                        }
                        
                        // Update indices
                        currentIndex = newIndex;
                      }
                    };
                    
                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                      
                      // Remove clone and show original
                      document.body.removeChild(clone);
                      // @ts-ignore
                      dragElement.style.visibility = 'visible';
                      placeholder.parentNode?.removeChild(placeholder);
                      
                      // Reorder the items if position changed
                      if (currentIndex !== initialIndex) {
                        reorderItems(initialIndex, currentIndex);
                      }
                    };
                    
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={addConfigItem}
        className={`add-button ${!allItemsValid ? 'disabled' : ''}`}
        disabled={!allItemsValid}
      >
        Add New Item
      </button>

      <div className="config-preview">
        <h2>Configuration Preview</h2>
        <div className="config-details">
          {configItems.length === 0 ? (
            <p>No items configured yet</p>
          ) : (
            <ul>
              {configItems.map(item => (
                <li key={item.id}>
                  <strong>{item.name || "Unnamed"}</strong>: 
                  {item.detentOption === "Custom" ? 
                    `Custom Detent (${item.customDetentStrength})` : 
                    (item.detentOption || "No detent option selected")}
                  <span>, Min: {item.min || "not set"}, Max: {item.max || "not set"}</span>
                  {item.step && (
                    <span>, Step: {item.step}</span>
                  )}
                  <span>, Entity ID: {item.entityId || "not set"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="button-group">
        <button 
          onClick={generateConfig}
          className={`generate-button ${!allItemsValid ? 'disabled' : ''}`}
          disabled={!allItemsValid}
        >
          Generate Config
        </button>
        
        <button 
          onClick={copyConfigToClipboard}
          className={`copy-button ${!allItemsValid ? 'disabled' : ''}`}
          disabled={!allItemsValid}
        >
          Copy Config
        </button>
      </div>
      
      {/* Notification component */}
      {notification.visible && (
        <div className="notification">
          {notification.message}
        </div>
      )}
    </main>
  );
}

export default App;
