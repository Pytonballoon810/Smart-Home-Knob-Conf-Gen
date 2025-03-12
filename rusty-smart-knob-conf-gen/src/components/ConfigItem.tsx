import React, { useState } from 'react';
import './ConfigItem.css';

// Define the detent options with Custom option
export const detentOptions = ["No Detents", "Weak Detents", "Strong Detents", "Custom"];

// Define the detent strength values (must match those in App.tsx)
export const DETENT_STRENGTH = {
  "No Detents": 0,
  "Weak Detents": 1,
  "Strong Detents": 2
};

// Interface for detent position entry
export interface DetentPosition {
  position: string;
  strength: string;
}

// Interface for ConfigItem props
export interface ConfigItemProps {
  item: {
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
    step: string; // Add the missing step property
  };
  onUpdate: (id: number, field: string, value: any) => void;
  onDelete: (id: number) => void;
  isFieldValid: (item: any, field: string) => boolean;
  dragHandleProps?: any;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ item, onUpdate, onDelete, isFieldValid, dragHandleProps }) => {
  // Get the numerical value for the selected detent option
  const getDetentStrengthValue = (option: string): string => {
    if (!option || option === "Custom") return "";
    return DETENT_STRENGTH[option as keyof typeof DETENT_STRENGTH].toString();
  };

  // Function to handle changes to a detent position entry
  const handleDetentPositionChange = (index: number, field: 'position' | 'strength', value: string) => {
    const updatedPositions = [...item.detentPositions];
    updatedPositions[index] = { ...updatedPositions[index], [field]: value };
    onUpdate(item.id, "detentPositions", updatedPositions);
  };

  // Function to add a new detent position
  const addDetentPosition = () => {
    const updatedPositions = [...item.detentPositions, { position: "", strength: "0.5" }];
    onUpdate(item.id, "detentPositions", updatedPositions);
  };

  // Function to remove a detent position
  const removeDetentPosition = (index: number) => {
    const updatedPositions = [...item.detentPositions];
    updatedPositions.splice(index, 1);
    onUpdate(item.id, "detentPositions", updatedPositions);
  };

  // Validate position value against min/max if applicable
  const updateDetentPosition = (index: number, field: string, value: string) => {
    const newDetentPositions = [...item.detentPositions];
    newDetentPositions[index] = { 
      ...newDetentPositions[index], 
      [field]: value 
    };
    
    if (field === "position" && value !== "") {
      const position = parseInt(value);
      const min = parseInt(item.min);
      const max = parseInt(item.max);
      
      if (!isNaN(min) && !isNaN(max) && max !== -1) {
        if (position < min) {
          newDetentPositions[index].position = min.toString();
        } else if (position > max) {
          newDetentPositions[index].position = max.toString();
        }
      }
    }
    
    onUpdate(item.id, "detentPositions", newDetentPositions);
  };

  // Check if detent position is valid
  const isDetentPositionValid = (position: string) => {
    if (position === "") return false;
    
    const positionValue = parseInt(position);
    if (isNaN(positionValue)) return false;
    
    const min = parseInt(item.min);
    const max = parseInt(item.max);
    if (!isNaN(min) && !isNaN(max) && max !== -1) {
      return positionValue >= min && positionValue <= max;
    }
    
    return true;
  };
  
  // Check if detent strength is valid
  const isDetentStrengthValid = (strength: string) => {
    if (strength === "") return false;
    
    const strengthValue = parseFloat(strength);
    return !isNaN(strengthValue) && strengthValue >= 0 && strengthValue <= 9.9;
  };

  // Check if the Custom Detent Positions table has any invalid entries
  const hasInvalidDetentPositions = () => {
    if (!item.detentPositions || item.detentPositions.length === 0) return false;
    
    return item.detentPositions.some(pos => 
      !isDetentPositionValid(pos.position) || !isDetentStrengthValid(pos.strength)
    );
  };

  // Conditional class for the Custom Detent Positions section
  const detentSectionClass = 
    `additional-params custom-detent-section ${hasInvalidDetentPositions() ? 'has-invalid-entries' : ''}`;

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
      
      {/* Display the numerical strength value for predefined detent options */}
      {item.detentOption && item.detentOption !== "Custom" && (
        <div className="additional-params">
          <div className="param-info">
            <span className="detent-value-info">
              Detent Strength Value: <strong>{getDetentStrengthValue(item.detentOption)}</strong>
            </span>
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
      
      {/* Custom Detent Positions Table */}
      <div className={detentSectionClass}>
        <div className="custom-detent-header">
          <h3>Custom Detent Positions</h3>
          <div className="emphasize-option">
            <input
              type="checkbox"
              id={`emphasize-extreme-values-${item.id}`}
              checked={item.emphasizeExtremeValues}
              onChange={(e) => onUpdate(item.id, "emphasizeExtremeValues", e.target.checked)}
              className="emphasize-checkbox"
            />
            <label htmlFor={`emphasize-extreme-values-${item.id}`} className="emphasize-label">
              Emphasize extreme values
            </label>
          </div>
        </div>
        
        {item.emphasizeExtremeValues && (
          <div className="emphasize-info">
            This will double the detent strength at min and max positions
          </div>
        )}
        
        {hasInvalidDetentPositions() && (
          <div className="validation-error">
            ⚠️ Some detent positions have invalid values. Please correct them before continuing.
          </div>
        )}
        
        <table className="detent-positions-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Detent Strength (0.0-9.9)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {item.detentPositions.map((entry, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    value={entry.position}
                    onChange={(e) => updateDetentPosition(index, 'position', e.target.value)}
                    className={`detent-position-input ${!isDetentPositionValid(entry.position) ? 'invalid' : ''}`}
                    placeholder="Position"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={entry.strength}
                    onChange={(e) => handleDetentPositionChange(index, 'strength', e.target.value)}
                    className={`detent-strength-input ${!isDetentStrengthValid(entry.strength) ? 'invalid' : ''}`}
                    placeholder="Strength"
                    step="0.1"
                    min="0"
                    max="9.9"
                    required
                  />
                </td>
                <td>
                  <button
                    onClick={() => removeDetentPosition(index)}
                    className="remove-position-button"
                    aria-label="Remove position"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          onClick={addDetentPosition}
          className="add-position-button"
          aria-label="Add detent position"
        >
          Add Position
        </button>
        <div className="detent-positions-info">
          Define custom positions where detents should occur and their individual strength values.
          {item.max !== "-1" && (
            <div>
              <strong>Note:</strong> Positions must be between {item.min} and {item.max} when end stops are enabled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigItem;
