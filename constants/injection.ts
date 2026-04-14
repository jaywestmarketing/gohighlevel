/**
 * JavaScript injected into the GHL WebView on every page load.
 *
 * Responsibilities:
 *  - Force a desktop-width viewport so GHL renders the full desktop UI
 *  - Patch history API + MutationObserver to report URL changes back to RN
 *  - Inject global mobile CSS fixes (scroll, modals, tap targets)
 *  - Expose window.__GHL with zoom, sidebar-toggle, and navigation helpers
 *    that React Native can call via webViewRef.injectJavaScript()
 */
export const INJECTION_SCRIPT = `
(function () {
  if (window.__GHL_INJECTED) return;
  window.__GHL_INJECTED = true;

  // ─── VIEWPORT ────────────────────────────────────────────────────────────────
  // width=1024 makes GHL render the full desktop layout.
  // initial-scale=0.4 fits it on a phone screen; user can pinch or use our controls.
  function setViewport(width, scale) {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      (document.head || document.documentElement).appendChild(meta);
    }
    meta.content =
      'width=' + width +
      ', initial-scale=' + scale +
      ', minimum-scale=0.1' +
      ', maximum-scale=5.0' +
      ', user-scalable=yes';
  }
  setViewport(1024, 0.4);

  // ─── URL-CHANGE DETECTION ────────────────────────────────────────────────────
  function postMsg(obj) {
    try {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(obj));
    } catch (e) {}
  }

  function notifyUrl() {
    postMsg({ type: 'URL_CHANGE', url: window.location.href });
  }

  var _push = history.pushState;
  var _replace = history.replaceState;
  history.pushState = function () {
    _push.apply(history, arguments);
    setTimeout(notifyUrl, 80);
  };
  history.replaceState = function () {
    _replace.apply(history, arguments);
    setTimeout(notifyUrl, 80);
  };
  window.addEventListener('popstate', notifyUrl);

  // Fallback: MutationObserver catches hash-only or framework-driven navigation
  var _lastUrl = location.href;
  new MutationObserver(function () {
    if (location.href !== _lastUrl) {
      _lastUrl = location.href;
      notifyUrl();
    }
  }).observe(document, { subtree: true, childList: true });

  // ─── MOBILE CSS ──────────────────────────────────────────────────────────────
  var css = [
    '* { -webkit-overflow-scrolling: touch !important; }',

    // Thin, non-intrusive scrollbars
    '::-webkit-scrollbar { width: 3px !important; height: 3px !important; }',
    '::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25) !important; border-radius: 3px !important; }',

    // Modals/dialogs: constrain height so they fit on screen
    '[class*="modal"], [class*="dialog"], [role="dialog"] {',
    '  max-height: 88vh !important;',
    '  overflow-y: auto !important;',
    '}',

    // Prevent accidental text-selection on nav/buttons
    'button, [role="button"], nav, aside, [class*="sidebar"], [class*="side-nav"] {',
    '  -webkit-user-select: none; user-select: none;',
    '}',

    // Sidebar slide transition for smooth hide/show
    '[class*="sidebar"], [class*="side-nav"], [class*="sidenav"], aside {',
    '  transition: transform 0.25s ease, opacity 0.25s ease !important;',
    '}',
  ].join('\\n');

  function injectCSS() {
    if (document.getElementById('__ghl_mobile_css')) return;
    var s = document.createElement('style');
    s.id = '__ghl_mobile_css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }

  // ─── GLOBAL API ──────────────────────────────────────────────────────────────
  window.__GHL = {
    _zoom: 0.4,
    _viewportWidth: 1024,
    _sidebarVisible: true,

    // ── Zoom ──
    zoomIn: function () {
      this._zoom = Math.min(+(this._zoom + 0.1).toFixed(2), 2.0);
      setViewport(this._viewportWidth, this._zoom);
      this._postZoom();
    },
    zoomOut: function () {
      this._zoom = Math.max(+(this._zoom - 0.1).toFixed(2), 0.15);
      setViewport(this._viewportWidth, this._zoom);
      this._postZoom();
    },
    setZoom: function (level) {
      this._zoom = Math.max(0.15, Math.min(2.0, +level.toFixed(2)));
      setViewport(this._viewportWidth, this._zoom);
      this._postZoom();
    },
    fitToScreen: function () {
      // Calculate scale so full viewport width fills the screen
      this._zoom = +(window.screen.width / this._viewportWidth).toFixed(2);
      setViewport(this._viewportWidth, this._zoom);
      this._postZoom();
    },
    _postZoom: function () {
      postMsg({ type: 'ZOOM_CHANGE', zoom: this._zoom });
    },

    // ── Sidebar ──
    toggleSidebar: function () {
      // GHL uses various class names depending on version; try them all
      var selectors = [
        '[class*="sidebar"]',
        '[class*="side-nav"]',
        '[class*="sidenav"]',
        '[class*="left-panel"]',
        '[class*="leftpanel"]',
        '[class*="nav-panel"]',
        '[class*="left-menu"]',
        'aside',
      ];
      for (var i = 0; i < selectors.length; i++) {
        var el = document.querySelector(selectors[i]);
        // Guard: must be reasonably tall to be the real sidebar
        if (el && el.offsetHeight > 80) {
          this._sidebarVisible = !this._sidebarVisible;
          if (this._sidebarVisible) {
            el.style.display = '';
            el.style.transform = 'translateX(0)';
            el.style.opacity = '1';
          } else {
            el.style.transform = 'translateX(-100%)';
            el.style.opacity = '0';
            // Hide after transition
            var _el = el;
            setTimeout(function () { _el.style.display = 'none'; }, 260);
          }
          postMsg({ type: 'SIDEBAR_TOGGLE', visible: this._sidebarVisible });
          return;
        }
      }
    },

    // ── Navigation ──
    navigateTo: function (path) {
      // Extract location ID from current URL so we land in the right sub-account
      var match = window.location.pathname.match(/\\/v2\\/location\\/([^\\/]+)/);
      if (match) {
        window.location.href = '/v2/location/' + match[1] + '/' + path;
      } else {
        window.location.href = '/' + path;
      }
    },
  };

  // ─── READY NOTIFICATION ──────────────────────────────────────────────────────
  function notifyReady() {
    postMsg({ type: 'PAGE_READY', url: window.location.href });
  }

  if (document.readyState === 'complete') {
    setTimeout(notifyReady, 400);
  } else {
    window.addEventListener('load', function () { setTimeout(notifyReady, 400); });
  }

  true; // injectedJavaScript requires a truthy final expression
})();
`;
