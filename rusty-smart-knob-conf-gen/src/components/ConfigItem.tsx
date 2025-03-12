import React from 'react';
import './ConfigItem.css';

// Define the detent options with Custom option
export const detentOptions = ["No Detents", "Weak Detents", "Strong Detents", "Custom"];

// Interface for ConfigItem props
export interface ConfigItemProps {
  item: {
    id: number;
    name: string;
    entityId: string;
    detentOption: string;
    min: string;
    max: string;
    step: string;
    color: string;
    snapPoint: string;
    customDetentStrength: string; // Add custom detent strength field
  };
  onUpdate: (id: number, field: string, value: any) => void;
  onDelete: (id: number) => void;
  isFieldValid: (item: any, field: string) => boolean;
  dragHandleProps?: any;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ item, onUpdate, onDelete, isFieldValid, dragHandleProps }) => {
  return (
    <div className="config-item-wrapper">
      <div className="config-item">
        {/* Drag handle */}
        <div className="drag-handle" {...dragHandleProps}>
          ≡
        </div>
        
        <input
          type="text"
          placeholder="Item Name (max 16 chars)"
          value={item.name}
          onChange={(e) => onUpdate(item.id, "name", e.target.value)}
          className={`name-input ${!isFieldValid(item, "name") ? 'invalid' : ''}`}
          maxLength={16}
        />
        
        <input
          type="text"
          placeholder="Entity ID"
          value={item.entityId}
          onChange={(e) => onUpdate(item.id, "entityId", e.target.value)}
          className={`entity-id-input ${!isFieldValid(item, "entityId") ? 'invalid' : ''}`}
        />
        
        <select
          value={item.detentOption}
          onChange={(e) => onUpdate(item.id, "detentOption", e.target.value)}
          className={`select-dropdown ${!item.detentOption ? 'placeholder' : ''} ${!isFieldValid(item, "detentOption") ? 'invalid' : ''}`}
        >
          <option value="" disabled>Detent Option</option>
          {detentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        
        <button 
          onClick={() => onDelete(item.id)}
          className="delete-button"
          aria-label="Delete item"
        >
          Delete
        </button>
      </div>
      
      {/* Display input for custom detent strength when Custom is selected */}
      {item.detentOption === "Custom" && (
        <div className="additional-params">
          <div className="param-container">
            <label>Detent Strength:</label>
            <input
              type="number"
              value={item.customDetentStrength}
              onChange={(e) => onUpdate(item.id, "customDetentStrength", e.target.value)}
              placeholder="0.0-9.9"
              className={`param-input ${!isFieldValid(item, "customDetentStrength") ? 'invalid' : ''}`}
              step="0.1"
              min="0"
              max="9.9"
              required
            />
          </div>
          <div className="param-hint">
            Enter a value between 0.0 (no detents) and 9.9 (very strong)
          </div>
        </div>
      )}
      
      {/* Display warning for Strong Detents */}
      {item.detentOption === "Strong Detents" && (
        <div className="detent-warning">
          ⚠️ Strong detents are not recommended. Consider using "Weak Detents" for better experience.
        </div>
      )}
      
      <div className="additional-params">
        <div className="param-container">
          <label>LED Color:</label>
          <input
            type="color"
            value={item.color}
            onChange={(e) => onUpdate(item.id, "color", e.target.value)}
            className="color-picker"
          />
        </div>
      </div>
      
      {/* Always show min/max inputs */}
      <div className="additional-params">
        <div className="param-container">
          <label>Min Value:</label>
          <input
            type="number"
            value={item.min}
            onChange={(e) => onUpdate(item.id, "min", e.target.value)}
            placeholder="Min"
            className={`param-input ${!isFieldValid(item, "min") ? 'invalid' : ''}`}
            required
          />
        </div>
        <div className="param-container">
          <label>Max Value:</label>
          <input
            type="number"
            value={item.max}
            onChange={(e) => onUpdate(item.id, "max", e.target.value)}
            placeholder="Max"
            className={`param-input ${!isFieldValid(item, "max") ? 'invalid' : ''}`}
            required
          />
        </div>
      </div>
      
      {/* Warning for default min/max values */}
      {item.min === "0" && item.max === "-1" && (
        <div className="param-warning">
          ℹ️ Using default values (Min: 0, Max: -1) means there will be no end stops. Rotation will be unlimited.
        </div>
      )}
      
      {/* Show step input for all items */}
      <div className="additional-params">
        <div className="param-container">
          <label>Step Size (Optional):</label>
          <input
            type="number"
            value={item.step}
            onChange={(e) => onUpdate(item.id, "step", e.target.value)}
            placeholder="Step"
            className="param-input"
          />
        </div>
      </div>
      
      {/* Advanced section for snap point override */}
      <div className="additional-params advanced-params">
        <div className="param-container">
          <label>Snap Point (Optional):</label>
          <input
            type="number"
            value={item.snapPoint}
            onChange={(e) => onUpdate(item.id, "snapPoint", e.target.value)}
            placeholder="Auto"
            className="param-input"
            min="0"
            max="1"
            step="0.01"
          />
        </div>
      </div>
      
      {/* Warning for snap point override */}
      {item.snapPoint && (
        <div className="advanced-warning">
          ⚠️ Modifying the snap point is for advanced users only. Default value: 0.55
        </div>
      )}
    </div>
  );
};

export default ConfigItem;
