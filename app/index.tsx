import React, { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GHLWebView, { GHLWebViewHandle } from '../components/GHLWebView';
import BottomNav from '../components/BottomNav';
import BuilderModeBar from '../components/BuilderModeBar';
import ZoomControls from '../components/ZoomControls';
import { usePageDetection } from '../hooks/usePageDetection';
import { useOrientation } from '../hooks/useOrientation';

export default function MainScreen() {
  const webViewRef = useRef<GHLWebViewHandle>(null);
  const insets = useSafeAreaInsets();

  // Current zoom level — synced from the WebView via postMessage
  const [zoom, setZoom] = useState(0.4);

  // Toggle the floating zoom panel in non-builder mode
  const [showZoomPanel, setShowZoomPanel] = useState(false);

  // Page / section detection
  const { currentSection, isBuilderSection, handleUrlChange } = usePageDetection();

  // Landscape / orientation control
  const { isLandscapeLocked, toggleLandscape } = useOrientation();

  // ── Handlers forwarded to the WebView ──────────────────────────────────────
  const handleZoomIn = useCallback(() => webViewRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => webViewRef.current?.zoomOut(), []);
  const handleFit = useCallback(() => webViewRef.current?.fitToScreen(), []);
  const handleToggleSidebar = useCallback(() => webViewRef.current?.toggleSidebar(), []);
  const handleNavigate = useCallback(
    (path: string) => webViewRef.current?.navigateTo(path),
    [],
  );
  const handleGoBack = useCallback(() => webViewRef.current?.goBack(), []);
  const handleGoForward = useCallback(() => webViewRef.current?.goForward(), []);
  const handleReload = useCallback(() => webViewRef.current?.reload(), []);

  return (
    <View style={styles.root}>
      {/* ── Builder mode bar (top) — shown only on funnel/workflow/site builders ── */}
      <BuilderModeBar
        visible={isBuilderSection}
        section={currentSection}
        zoom={zoom}
        isLandscapeLocked={isLandscapeLocked}
        onToggleLandscape={toggleLandscape}
        onToggleSidebar={handleToggleSidebar}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
      />

      {/* ── Standard header — shown for all non-builder pages ── */}
      {!isBuilderSection && (
        <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
          {/* Sidebar toggle */}
          <HeaderBtn label="☰" onPress={handleToggleSidebar} />

          {/* Navigation */}
          <HeaderBtn label="‹" onPress={handleGoBack} />
          <HeaderBtn label="›" onPress={handleGoForward} />

          <View style={styles.spacer} />

          {/* Zoom panel toggle */}
          <HeaderBtn
            label="⊕"
            onPress={() => setShowZoomPanel((v) => !v)}
            active={showZoomPanel}
          />

          {/* Reload */}
          <HeaderBtn label="↺" onPress={handleReload} />
        </View>
      )}

      {/* ── WebView — fills remaining space ── */}
      <GHLWebView
        ref={webViewRef}
        onUrlChange={handleUrlChange}
        onZoomChange={setZoom}
      />

      {/* ── Floating zoom controls — visible in builder mode OR when panel toggled ── */}
      <ZoomControls
        visible={isBuilderSection || showZoomPanel}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
      />

      {/* ── Bottom navigation — hidden in builder mode to maximise canvas space ── */}
      <BottomNav
        currentSection={currentSection}
        onNavigate={handleNavigate}
        hidden={isBuilderSection}
      />
    </View>
  );
}

// Small reusable header button
function HeaderBtn({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.hBtn, active && styles.hBtnActive]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <Text style={styles.hBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#13131f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13131f',
    paddingHorizontal: 6,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2d2d44',
    gap: 2,
  },
  spacer: {
    flex: 1,
  },
  hBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  hBtnActive: {
    backgroundColor: '#2d2d44',
  },
  hBtnText: {
    fontSize: 20,
    color: '#e0e0f0',
  },
});
