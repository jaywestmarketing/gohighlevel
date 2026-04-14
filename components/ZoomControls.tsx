import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ZoomControlsProps {
  visible: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export default function ZoomControls({
  visible,
  zoom,
  onZoomIn,
  onZoomOut,
  onFit,
}: ZoomControlsProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={onZoomIn}
        activeOpacity={0.7}
        accessibilityLabel="Zoom in"
      >
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pctBtn}
        onPress={onFit}
        activeOpacity={0.7}
        accessibilityLabel="Fit to screen"
      >
        <Text style={styles.pctText}>{Math.round(zoom * 100)}%</Text>
        <Text style={styles.fitLabel}>fit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={onZoomOut}
        activeOpacity={0.7}
        accessibilityLabel="Zoom out"
      >
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -72 }],
    backgroundColor: 'rgba(19, 19, 31, 0.92)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2d2d44',
  },
  btn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    borderRadius: 10,
  },
  btnText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
    lineHeight: 28,
  },
  pctBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
  },
  pctText: {
    fontSize: 11,
    color: '#4f8ef7',
    fontWeight: '700',
  },
  fitLabel: {
    fontSize: 9,
    color: '#555577',
    marginTop: 1,
  },
});
