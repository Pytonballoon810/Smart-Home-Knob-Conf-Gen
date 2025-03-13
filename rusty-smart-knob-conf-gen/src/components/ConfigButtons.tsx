import React from 'react';
import './ConfigButtons.css';
import { ConfigItem, formatConfigItems } from './ConfigUtils';

interface ConfigButtonsProps {
  configItems: ConfigItem[];
  isValid: boolean;
  onAddItem: () => void;
  onNotification: (message: string) => void;
}

const ConfigButtons: React.FC<ConfigButtonsProps> = ({ 
  configItems, 
  isValid, 
  onAddItem,
  onNotification
}) => {

  const generateConfig = () => {
    const formattedConfig = formatConfigItems(configItems);
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
    const formattedConfig = formatConfigItems(configItems);
    // Use compact JSON without indentation for clipboard copy
    const compactConfigText = JSON.stringify(formattedConfig);
    navigator.clipboard
      .writeText(compactConfigText)
      .then(() => {
        onNotification("Compact configuration copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy config: ", err);
        onNotification("Failed to copy configuration!");
      });
  };

  return (
    <>
      <button
        onClick={onAddItem}
        className={`add-button ${!isValid ? "disabled" : ""}`}
        disabled={!isValid}
      >
        Add New Item
      </button>

      <div className="button-group">
        <button
          onClick={generateConfig}
          className={`generate-button ${!isValid ? "disabled" : ""}`}
          disabled={!isValid}
        >
          Generate Config
        </button>

        <button
          onClick={copyConfigToClipboard}
          className={`copy-button ${!isValid ? "disabled" : ""}`}
          disabled={!isValid}
        >
          Copy Config
        </button>
      </div>
    </>
  );
};

export default ConfigButtons;
