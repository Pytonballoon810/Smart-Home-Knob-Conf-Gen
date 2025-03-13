import React from 'react';
import './ConfigItemList.css';
import ConfigItem from './ConfigItem';
import { ConfigItem as ConfigItemType, isFieldValid } from './ConfigUtils';

interface ConfigItemListProps {
  items: ConfigItemType[];
  onUpdate: (id: number, field: string, value: any) => void;
  onDelete: (id: number) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

const ConfigItemList: React.FC<ConfigItemListProps> = ({ items, onUpdate, onDelete, onReorder }) => {
  return (
    <div className="config-items">
      <div className="drag-container">
        {items.map((item, index) => (
          <div key={item.id} className="draggable-item">
            <ConfigItem
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
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
                  clone.style.width = `${dragElement.clientWidth}px`;
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
                  (dragElement as HTMLElement).style.visibility = 'hidden';
                  dragElement.parentNode?.insertBefore(placeholder, dragElement);

                  let currentIndex = initialIndex;

                  const onMouseMove = (e: MouseEvent) => {
                    const deltaY = e.clientY - initialY;
                    clone.style.transform = `translateY(${deltaY}px)`;

                    // Calculate the new index
                    const newIndex = Math.max(
                      0,
                      Math.min(
                        Math.floor(
                          (e.clientY - container.getBoundingClientRect().top) / itemHeight
                        ),
                        items.length - 1
                      )
                    );

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
                    (dragElement as HTMLElement).style.visibility = 'visible';
                    placeholder.parentNode?.removeChild(placeholder);

                    // Reorder the items if position changed
                    if (currentIndex !== initialIndex) {
                      onReorder(initialIndex, currentIndex);
                    }
                  };

                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigItemList;
