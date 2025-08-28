// NOTE: This component requires 'react-native' types for development. Install '@types/react-native' as a dev dependency if you see type errors in your IDE.
// NOTE: This component requires 'react-native-svg' to be installed. Run: npm install react-native-svg
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

// Try to import react-native-svg, fallback to null if not available
let Svg: any = null;
let G: any = null;
let Circle: any = null;
let Path: any = null;

try {
  const svgModule = require('react-native-svg');
  Svg = svgModule.default;
  G = svgModule.G;
  Circle = svgModule.Circle;
  Path = svgModule.Path;
} catch (error) {
  console.warn('react-native-svg not installed. Using fallback implementation.');
}

interface ColorPickerProps {
  value?: string;
  onColorChange?: (color: string) => void;
  size?: number;
  strokeWidth?: number;
  showPreview?: boolean;
  showHexInput?: boolean;
  style?: object;
}

// Color conversion utilities
function hsvToRgb(h: number, s: number, v: number) {
  let f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  let r = Math.round(f(5) * 255);
  let g = Math.round(f(3) * 255);
  let b = Math.round(f(1) * 255);
  return { r, g, b };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToHsv(hex: string) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, v };
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#ff0000',
  onColorChange,
  size = 220,
  strokeWidth = 28,
  showPreview = true,
  showHexInput = false,
  style = {},
}) => {
  const [selectedColor, setSelectedColor] = useState(value);
  const center = size / 2;
  const radius = center - strokeWidth / 2;

  // Check if react-native-svg is available
  const isSvgAvailable = Svg !== null;

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  // Draw the color wheel as many arcs
  const segments = 60;
  const wheelPaths = [];
  
  if (isSvgAvailable) {
    for (let i = 0; i < segments; i++) {
      const startAngle = (i * 360) / segments;
      const endAngle = ((i + 1) * 360) / segments;
      const start = polarToCartesian(center, center, radius, startAngle);
      const end = polarToCartesian(center, center, radius, endAngle);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const path = [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      ].join(' ');
      const { r, g, b } = hsvToRgb(startAngle, 1, 1);
      const color = `rgb(${r},${g},${b})`;
      wheelPaths.push(
        <Path
          key={i}
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
        />
      );
    }
  }

  // Compute marker angle from value prop (hex color)
  let markerAngle = 0;
  if (/^#([0-9a-f]{6})$/i.test(selectedColor)) {
    const { h } = hexToHsv(selectedColor);
    markerAngle = h;
  }
  
  // Marker position
  const marker = polarToCartesian(center, center, radius, markerAngle);

  function handlePress(evt: any) {
    if (!isSvgAvailable) return;
    
    const { offsetX: x, offsetY: y } = evt.nativeEvent;
    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius - strokeWidth / 2 || dist > radius + strokeWidth / 2) return;
    let theta = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (theta < 0) theta += 360;
    const { r, g, b } = hsvToRgb(theta, 1, 1);
    const hex = rgbToHex({ r, g, b });
    handleColorChange(hex);
  }

  // Predefined colors for fallback
  const predefinedColors = [
    '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', 
    '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff',
    '#ff00ff', '#ff0080', '#ff4040', '#ff8040', '#ffff40'
  ];

  return (
    <View style={[styles.container, style]}>
      {isSvgAvailable ? (
        <Svg
          width={size}
          height={size}
          onPress={handlePress}
        >
          <G>{wheelPaths}</G>
          {/* Marker */}
          <Circle
            cx={marker.x}
            cy={marker.y}
            r={strokeWidth / 2 - 2}
            fill={selectedColor}
            stroke="#fff"
            strokeWidth={3}
          />
        </Svg>
      ) : (
        // Fallback implementation when react-native-svg is not available
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Color Picker</Text>
          <View style={styles.colorGrid}>
            {predefinedColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption
                ]}
                onPress={() => handleColorChange(color)}
              />
            ))}
          </View>
        </View>
      )}
      
      {showPreview && (
        <View style={styles.previewContainer}>
          <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
          {showHexInput && (
            <Text style={styles.hexValue}>{selectedColor.toUpperCase()}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  fallbackContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 200,
  },
  colorOption: {
    width: 30,
    height: 30,
    margin: 4,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedColorOption: {
    borderColor: '#007bff',
    borderWidth: 3,
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 8,
  },
  hexValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ColorPicker; 
