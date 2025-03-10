import React from 'react';
import './ConfigItem.css';

// Define the interface types and options as constants for reuse
export const interfaceTypes = [
  "Unbound",
  "Bounded / Course Values",
  "Multi Rev",
  "On/Off",
  "Return to Center",
  "Magnetic Detents",
  "Fine Values"
];

export const detentOptions = ["No Detents", "Weak Detents", "Strong Detents"];

// Types that require min/max values
export const requiresMinMax = [
  "Bounded / Course Values", 
  "Multi Rev", 
  "Fine Values",
  "Magnetic Detents"
];

// Types that require min/max values and are editable
export const requiresMinMaxEditable = [
  "Bounded / Course Values", 
  "Multi Rev", 
  "Fine Values",
  "Magnetic Detents"
];

// Types that require min/max values but are not user-editable
export const requiresMinMaxFixed = [
  "On/Off"
];

// Types that can have step size
export const canHaveStep = ["Magnetic Detents"];

// Interface for ConfigItem props
export interface ConfigItemProps {
  item: {
    id: number;
    name: string;
    entityId: string;
    interfaceType: string;
    detentOption: string;
    min: string;
    max: string;
    step: string;
    color: string;
  };
  onUpdate: (id: number, field: string, value: any) => void;
  onDelete: (id: number) => void;
  isFieldValid: (item: any, field: string) => boolean;
  dragHandleProps?: any; // Add drag handle props
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
          value={item.interfaceType} 
          onChange={(e) => onUpdate(item.id, "interfaceType", e.target.value)}
          className={`select-dropdown ${!item.interfaceType ? 'placeholder' : ''} ${!isFieldValid(item, "interfaceType") ? 'invalid' : ''}`}
        >
          <option value="" disabled>Interface Type</option>
          {interfaceTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        
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
      
      {/* Show min/max inputs for specific interface types that need user input */}
      {item.interfaceType && requiresMinMaxEditable.includes(item.interfaceType) && (
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
      )}
      
      {/* Warning for default min/max values */}
      {item.interfaceType && 
       requiresMinMaxEditable.includes(item.interfaceType) && 
       item.min === "0" && 
       item.max === "-1" && (
        <div className="param-warning">
          ℹ️ Using default values (Min: 0, Max: -1) means there will be no end stops. Rotation will be unlimited.
        </div>
      )}
      
      {/* Show info message for types with fixed min/max values */}
      {item.interfaceType && requiresMinMaxFixed.includes(item.interfaceType) && (
        <div className="additional-params">
          <div className="param-container info-message">
            <span>This type uses fixed values: Min = 0, Max = 1</span>
          </div>
        </div>
      )}
      
      {/* Show step input for magnetic detents */}
      {item.interfaceType && canHaveStep.includes(item.interfaceType) && (
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
      )}
    </div>
  );
};

export default ConfigItem;
