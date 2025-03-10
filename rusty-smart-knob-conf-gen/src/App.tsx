import { useState, useEffect } from "react";
import "./App.css";
import ConfigItem, {
  requiresMinMax, 
  canHaveStep 
} from "./components/ConfigItem";

function App() {
  // Constants for width_radians calculations
  const WIDTH_RADIANS = {
    "Unbound": 10 * Math.PI / 180,
    "Bounded / Course Values": 8.225806452 * Math.PI / 180,
    "Multi Rev": 10 * Math.PI / 180,
    "On/Off": 60 * Math.PI / 180,
    "Return to Center": 60 * Math.PI / 180,
    "Magnetic Detents": 7 * Math.PI / 180,
    "Fine Values": 1 * Math.PI / 180
  };

  // Constants for detent strength
  const DETENT_STRENGTH = {
    "No Detents": 0,
    "Weak Detents": 1,
    "Strong Detents": 2
  };

  // Default RGB color for led_hue (blue = 200)
  const DEFAULT_COLOR = "#0088ff"; // This approximately corresponds to hue 200

  // Expanded config item structure with color for led_hue
  const [configItems, setConfigItems] = useState([
    { id: 1, name: "", entityId: "", interfaceType: "", detentOption: "", min: "0", max: "-1", step: "", color: DEFAULT_COLOR }
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
      { id: getNextId(), name: "", entityId: "", interfaceType: "", detentOption: "", min: "0", max: "-1", step: "", color: DEFAULT_COLOR }
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
    
    // Interface type validation
    if (field === "interfaceType") {
      return item.interfaceType !== "";
    }
    
    // Detent option validation
    if (field === "detentOption") {
      return item.detentOption !== "";
    }
    
    // Min/max validation for specific interface types
    if ((field === "min" || field === "max") && requiresMinMax.includes(item.interfaceType)) {
      return item[field] !== "";
    }
    
    // Step is optional, so always valid
    if (field === "step") {
      return true;
    }
    
    return true;
  };

  // Check if all required fields have valid values
  const checkAllItemsValid = () => {
    return configItems.every(item => {
      // Basic fields validation
      if (!item.name || !item.entityId || !item.interfaceType || !item.detentOption) {
        return false;
      }
      
      // Check name length (should be 1-16 characters)
      if (item.name.length === 0 || item.name.length > 16) {
        return false;
      }
      
      // Check min/max values for types that require them
      if (requiresMinMax.includes(item.interfaceType)) {
        if (item.min === "" || item.max === "") {
          return false;
        }
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

  // Format config items according to the specified JSON structure
  const formatConfigItems = () => {
    return configItems.map(item => {
      let minPosition = item.min !== "" ? item.min : "0";
      let maxPosition = item.max !== "" ? item.max : "-1";
      
      // Override min and max for On/Off type
      if (item.interfaceType === "On/Off") {
        minPosition = "0";
        maxPosition = "1";
      }
      
      let widthRadians = WIDTH_RADIANS[item.interfaceType as keyof typeof WIDTH_RADIANS] || WIDTH_RADIANS["Unbound"];
      
      // Adjust width_radians for Fine Values by multiplying with 255/max
      if (item.interfaceType === "Fine Values" && maxPosition !== "-1") {
        const maxVal = parseInt(maxPosition);
        if (!isNaN(maxVal) && maxVal > 0) {
          widthRadians = widthRadians * (255 / maxVal);
        }
      }
      
      const detentStrength = DETENT_STRENGTH[item.detentOption as keyof typeof DETENT_STRENGTH] || 0;
      
      return {
        position: 0,
        min_position: parseInt(minPosition),
        max_position: parseInt(maxPosition),
        width_radians: widthRadians,
        detent_strength: detentStrength,
        endstop_strength: 1,
        snap_point: 0.55,
        text: `${item.name}\n${item.detentOption}`,
        led_hue: hexToHue(item.color),
        entity_id: item.entityId
      };
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
    const configText = JSON.stringify(formattedConfig, null, 2);
    navigator.clipboard.writeText(configText).then(() => {
      setNotification({ visible: true, message: "Configuration copied to clipboard!" });
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

  // Note: This function is no longer needed since we implemented custom drag handling
  // but we're keeping the reorderItems function for use within our custom implementation

  return (
    <main className="container">
      <h1>Smart Knob Config Creator</h1>
      
      <div className="config-items">
        {/* Use a drag and drop library like react-beautiful-dnd */}
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
                  <strong>{item.name || "Unnamed"}</strong>: {item.interfaceType || "No interface selected"}, 
                  {item.detentOption || "No detent option selected"}
                  {requiresMinMax.includes(item.interfaceType) && (
                    <span>, Min: {item.min || "not set"}, Max: {item.max || "not set"}</span>
                  )}
                  {canHaveStep.includes(item.interfaceType) && item.step && (
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
