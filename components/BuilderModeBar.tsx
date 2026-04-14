import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GHLSection, BUILDER_LABELS } from '../constants/sections';

interface BuilderModeBarProps {
  visible: boolean;
  section: GHLSection;
  zoom: number;
  isLandscapeLocked: boolean;
  onToggleLandscape: () => void;
  onToggleSidebar: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export default function BuilderModeBar({
  visible,
  section,
  zoom,
  isLandscapeLocked,
  onToggleLandscape,
  onToggleSidebar,
  onZoomIn,
  onZoomOut,
  onFit,
}: BuilderModeBarProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const label = BUILDER_LABELS[section] ?? 'Builder';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        {/* Section label */}
        <Text style={styles.title}>{label}</Text>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Sidebar toggle */}
          <TouchableOpacity
            style={styles.ctrl}
            onPress={onToggleSidebar}
            activeOpacity={0.7}
            accessibilityLabel="Toggle sidebar"
          >
            <Text style={styles.ctrlText}>☰</Text>
          </TouchableOpacity>

          {/* Zoom out */}
          <TouchableOpacity
            style={styles.ctrl}
            onPress={onZoomOut}
            activeOpacity={0.7}
            accessibilityLabel="Zoom out"
          >
            <Text style={styles.ctrlText}>−</Text>
          </TouchableOpacity>

          {/* Zoom % — tap to fit */}
          <TouchableOpacity
            style={styles.zoomPill}
            onPress={onFit}
            activeOpacity={0.7}
            accessibilityLabel="Fit to screen"
          >
            <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          </TouchableOpacity>

          {/* Zoom in */}
          <TouchableOpacity
            style={styles.ctrl}
            onPress={onZoomIn}
            activeOpacity={0.7}
            accessibilityLabel="Zoom in"
          >
            <Text style={styles.ctrlText}>+</Text>
          </TouchableOpacity>

          {/* Landscape lock */}
          <TouchableOpacity
            style={[styles.ctrl, isLandscapeLocked && styles.ctrlActive]}
            onPress={onToggleLandscape}
            activeOpacity={0.7}
            accessibilityLabel={isLandscapeLocked ? 'Unlock orientation' : 'Lock landscape'}
          >
            <Text style={styles.ctrlText}>⟳</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.hint}>
        Pinch to zoom • Tap % to fit screen • ⟳ locks landscape
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(19, 19, 31, 0.97)',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2d2d44',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#e0e0f0',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctrl: {
    width: 36,
    height: 36,
    backgroundColor: '#2d2d44',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlActive: {
    backgroundColor: '#4f8ef7',
  },
  ctrlText: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '400',
  },
  zoomPill: {
    paddingHorizontal: 10,
    height: 36,
    backgroundColor: '#13131f',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  zoomText: {
    fontSize: 12,
    color: '#4f8ef7',
    fontWeight: '700',
  },
  hint: {
    color: '#444466',
    fontSize: 10,
    marginTop: 4,
  },
});
