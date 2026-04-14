import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { INJECTION_SCRIPT } from '../constants/injection';

const GHL_URL = 'https://app.gohighlevel.com';

// Desktop Chrome user-agent — forces GHL to serve the full desktop interface
const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

export interface GHLWebViewHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  toggleSidebar: () => void;
  navigateTo: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
}

interface GHLWebViewProps {
  onUrlChange?: (url: string) => void;
  onZoomChange?: (zoom: number) => void;
}

const GHLWebView = forwardRef<GHLWebViewHandle, GHLWebViewProps>(
  ({ onUrlChange, onZoomChange }, ref) => {
    const webViewRef = useRef<WebView>(null);

    /** Safely inject JavaScript without crashing if the ref isn't ready */
    const inject = useCallback((js: string) => {
      webViewRef.current?.injectJavaScript(js + '; true;');
    }, []);

    useImperativeHandle(ref, () => ({
      zoomIn: () => inject('window.__GHL && window.__GHL.zoomIn()'),
      zoomOut: () => inject('window.__GHL && window.__GHL.zoomOut()'),
      fitToScreen: () => inject('window.__GHL && window.__GHL.fitToScreen()'),
      toggleSidebar: () => inject('window.__GHL && window.__GHL.toggleSidebar()'),
      navigateTo: (path: string) =>
        inject(`window.__GHL && window.__GHL.navigateTo(${JSON.stringify(path)})`),
      goBack: () => webViewRef.current?.goBack(),
      goForward: () => webViewRef.current?.goForward(),
      reload: () => webViewRef.current?.reload(),
    }));

    const handleMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          switch (data.type) {
            case 'URL_CHANGE':
            case 'PAGE_READY':
              onUrlChange?.(data.url);
              break;
            case 'ZOOM_CHANGE':
              onZoomChange?.(data.zoom);
              break;
          }
        } catch (_) {}
      },
      [onUrlChange, onZoomChange],
    );

    const handleNavStateChange = useCallback(
      (navState: WebViewNavigation) => {
        if (navState.url) onUrlChange?.(navState.url);
      },
      [onUrlChange],
    );

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: GHL_URL }}
          style={styles.webview}
          // ── Desktop rendering ──────────────────────────────────────────────
          userAgent={DESKTOP_USER_AGENT}
          // ── JS injection ───────────────────────────────────────────────────
          // injectedJavaScriptBeforeContentLoaded runs before the page JS fires
          // so our viewport override wins.
          injectedJavaScriptBeforeContentLoaded={INJECTION_SCRIPT}
          injectedJavaScript={INJECTION_SCRIPT}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavStateChange}
          // ── Media & files ──────────────────────────────────────────────────
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          // Allow camera/mic for any GHL dialers or video features
          mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
          // ── Navigation gestures ────────────────────────────────────────────
          allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
          // ── Scale & zoom ───────────────────────────────────────────────────
          // We control zoom via viewport meta injection; disable native scaling
          // to avoid conflicts.
          scalesPageToFit={false}
          // ── Storage & cookies ──────────────────────────────────────────────
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          // ── Mixed content (some GHL assets are http) ──────────────────────
          mixedContentMode="always"
          // ── Loading indicator ──────────────────────────────────────────────
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#4f8ef7" />
            </View>
          )}
        />
      </View>
    );
  },
);

GHLWebView.displayName = 'GHLWebView';

export default GHLWebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});
