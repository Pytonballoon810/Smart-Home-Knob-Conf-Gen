import React from 'react';
import './ConfigButtons.css';
import { ConfigItem, formatConfigItems, checkAllItemsValid } from './ConfigUtils';

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
    // Double-check validity before generating config
    if (!checkAllItemsValid(configItems)) {
      onNotification("Cannot generate config: Some items have invalid values");
      return;
    }

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
    // Double-check validity before copying config
    if (!checkAllItemsValid(configItems)) {
      onNotification("Cannot copy config: Some items have invalid values");
      return;
    }

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

  // Compute button classes only once
  const buttonClass = `button add ${!isValid ? "disabled" : ""}`;
  const generateButtonClass = `button generate ${!isValid ? "disabled" : ""}`;
  const copyButtonClass = `button copy ${!isValid ? "disabled" : ""}`;

  return (
    <>
      <button
        onClick={onAddItem}
        className={buttonClass}
        disabled={!isValid}
      >
        Add New Item
      </button>

      <div className="button-group">
        <button
          onClick={generateConfig}
          className={generateButtonClass}
          disabled={!isValid}
        >
          Generate Config
        </button>

        <button
          onClick={copyConfigToClipboard}
          className={copyButtonClass}
          disabled={!isValid}
        >
          Copy Config
        </button>
      </div>
    </>
  );
};

export default ConfigButtons;
