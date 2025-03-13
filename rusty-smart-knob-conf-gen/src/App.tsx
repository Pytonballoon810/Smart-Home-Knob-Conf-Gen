import { useState } from "react";
import "./App.css";
import ConfigItemList from "./components/ConfigItemList";
import ConfigButtons from "./components/ConfigButtons";
import Notification from "./components/Notification";
import {
  createEmptyConfigItem,
  getNextId,
  checkAllItemsValid,
  ConfigItem
} from "./components/ConfigUtils";

function App() {
  // State for configuration items
  const [configItems, setConfigItems] = useState<ConfigItem[]>([
    createEmptyConfigItem(1),
  ]);

  // State for notification
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });

  const addConfigItem = () => {
    setConfigItems([
      ...configItems,
      createEmptyConfigItem(getNextId(configItems)),
    ]);
  };

  const deleteConfigItem = (id: number) => {
    setConfigItems(configItems.filter((item) => item.id !== id));
  };

  const updateConfigItem = (id: number, field: string, value: any) => {
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

    // For rotation, allow only valid float values
    if (field === "rotation" && value !== "") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        value = numValue.toString();
      }
    }

    setConfigItems(
      configItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Function to handle reordering items
  const reorderItems = (startIndex: number, endIndex: number) => {
    const result = Array.from(configItems);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setConfigItems(result);
  };

  // Show notification message
  const showNotification = (message: string) => {
    setNotification({
      visible: true,
      message,
    });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification({
      visible: false,
      message: "",
    });
  };

  // Check if all items are valid
  const allItemsValid = checkAllItemsValid(configItems);

  return (
    <main className="container">
      <h1>Smart Knob Config Creator</h1>

      <ConfigItemList 
        items={configItems}
        onUpdate={updateConfigItem}
        onDelete={deleteConfigItem}
        onReorder={reorderItems}
      />

      <ConfigButtons
        configItems={configItems}
        isValid={allItemsValid}
        onAddItem={addConfigItem}
        onNotification={showNotification}
      />

      <Notification
        visible={notification.visible}
        message={notification.message}
        onHide={hideNotification}
      />
    </main>
  );
}

export default App;
