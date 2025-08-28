# Drag and Drop List

A list component that can be dragged and dropped anywhere on the page. Each item displays a title and subtitle. Supports grouping, tap events, and custom titles.

## Features

- Draggable list that can be positioned anywhere on the screen
- Supports grouping of items
- Customizable appearance with style props
- Event handlers for tap and drop actions
- Optional title display

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| data | Array | Yes | Array of items to render in the list. Each item must have a unique 'key' or 'id' property (string or number). |
| title | String | No | Optional title to display at the top of the list. |
| groupBy | String/Function | No | Property name or function to group items by. Can be a string (property name) or a function that returns a group key. |
| style | Object | No | Custom style for the list container. |

## Events

| Event | Description |
|-------|-------------|
| onTap | Callback when a list item is tapped. Returns the item and its index. |
| onDrop | Callback when the list is dropped. Returns the new position (x, y). |

## Usage Example

```jsx
import React from 'react';
import { View } from 'react-native';
import DraggableList from '@wavemaker/draganddroplist';

const MyComponent = () => {
  const listData = [
    { id: '1', title: 'Item 1', subtitle: 'Description 1', category: 'Group A' },
    { id: '2', title: 'Item 2', subtitle: 'Description 2', category: 'Group A' },
    { id: '3', title: 'Item 3', subtitle: 'Description 3', category: 'Group B' },
    { id: '4', title: 'Item 4', subtitle: 'Description 4', category: 'Group B' },
  ];

  const handleItemTap = (item, index) => {
    console.log('Item tapped:', item, 'at index:', index);
  };

  const handleListDrop = (position) => {
    console.log('List dropped at position:', position);
  };

  return (
    <View style={{ flex: 1 }}>
      <DraggableList
        data={listData}
        title="My Draggable List"
        groupBy="category"
        onTap={handleItemTap}
        onDrop={handleListDrop}
        style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}
      />
    </View>
  );
};

export default MyComponent;
```

## Requirements

- WaveMaker Studio with React Native support
- Compatible with both web preview and native mobile applications