// ==UserScript==
// @name         YT SuperTool
// @namespace    https://github.com/CheemsGalaxy/YT-SuperTool
// @version      2.2.1
// @description  All-in-One YouTube enhancer: No Shorts, Clean Homepage, Return Dislike, SponsorBlock, Auto Continue, Playback Speed, PiP, Screenshot, Downloader.
// @author       CheemsGalaxy
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://studio.youtube.com/*
// @noframes
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @connect      returnyoutubedislikeapi.com
// @connect      sponsor.ajay.app
// ==/UserScript==

(function () {
  'use strict';

  if (location.hostname !== 'youtube.com' && !location.hostname.endsWith('.youtube.com')) return;

  const YT = {};

  const SETTING_DEFAULTS = {
    dislike: true,
    noShorts: true,
    cleanHomepage: true,
    nonstop: true,
    sponsorblock: true,
    speed: true,
    downloader: false,
    pip: true,
    screenshot: true
  };

  const SETTING_LABELS = {
    noShorts: 'No Shorts',
    cleanHomepage: 'Clean Homepage',
    dislike: 'Return Dislike',
    nonstop: 'Auto Continue',
    sponsorblock: 'SponsorBlock',
    speed: 'Playback Speed',
    pip: 'Picture in Picture',
    screenshot: 'Screenshot',
    downloader: 'Downloader'
  };

  const store = {
    get(key, fallback) {
      try { return GM_getValue(key, fallback); } catch { return fallback; }
    },
    set(key, value) {
      try { GM_setValue(key, value); } catch (error) { console.warn('YT SuperTool storage:', error); }
    }
  };

  function syncNoShortsRoot() {
    const root = document.documentElement;
    if (!root) return;
    if (store.get('noShorts', SETTING_DEFAULTS.noShorts)) {
      root.dataset.ytSupertoolNoShorts = 'on';
    } else {
      delete root.dataset.ytSupertoolNoShorts;
    }
  }
  syncNoShortsRoot();

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function createSvgIcon(shapes) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('aria-hidden', 'true');
    shapes.forEach(([tag, attrs]) => {
      const el = document.createElementNS(SVG_NS, tag);
      Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
      svg.append(el);
    });
    return svg;
  }

  function showToast(message, duration = 1800) {
    let toast = document.querySelector('.yt-supertool-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'yt-supertool-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.classList.remove('is-visible'), duration);
  }

  function getVideoIdFromUrl(url = location.href) {
    try {
      const parsed = new URL(url, location.origin);
      return (
        parsed.searchParams.get('v') ||
        parsed.pathname.match(/\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] ||
        (parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : '')
      );
    } catch {
      return '';
    }
  }

  function openDownloadTab(url) {
    const videoId = getVideoIdFromUrl(url || location.href);
    const target = videoId
      ? `https://www.youtubepi.com/watch?v=${encodeURIComponent(videoId)}`
      : 'https://y2mate.nu/';
    GM_openInTab(target, { active: true, insert: true });
  }

  function injectStyles() {
    syncNoShortsRoot();
    if (document.querySelector('style[data-yt-supertool="styles"]')) return true;
    const head = document.head;
    if (!head) return false;
    const style = document.createElement('style');
    style.dataset.ytSupertool = 'styles';
    style.textContent = `
      [data-yt-supertool="speed"] {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        align-self: center;
        vertical-align: middle;
        height: auto;
        padding: 0;
        margin: 0 4px 0 0;
        background: transparent;
        border: 0;
        color: #fff;
        font: 500 13px/1 Roboto, Arial, sans-serif;
        pointer-events: auto;
        flex-shrink: 0;
        box-sizing: border-box;
        position: relative;
      }
      [data-yt-supertool="speed"] .yt-supertool-speed-slider {
        width: 100px;
        height: 24px;
        align-self: center;
        margin: 0;
        padding: 0;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        cursor: pointer;
        filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.85));
      }
      [data-yt-supertool="speed"] .yt-supertool-speed-slider::-webkit-slider-runnable-track {
        height: 3px;
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.45);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
      }
      [data-yt-supertool="speed"] .yt-supertool-speed-slider::-moz-range-track {
        height: 3px;
        border-radius: 2px;
        background: rgba(0, 0, 0, 0.45);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
      }
      [data-yt-supertool="speed"] .yt-supertool-speed-slider::-webkit-slider-thumb {
        width: 12px;
        height: 12px;
        margin-top: -4.5px;
        appearance: none;
        -webkit-appearance: none;
        border: 0;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
      }
      [data-yt-supertool="speed"] .yt-supertool-speed-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border: 0;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
      }
      [data-yt-supertool="speed"] .yt-supertool-speed-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 28px;
        min-width: 48px;
        padding: 0 10px;
        border: 0;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #fff;
        font: 500 12px/1 Roboto, Arial, sans-serif;
        cursor: pointer;
        position: relative;
        white-space: nowrap;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
      }
      [data-yt-supertool="speed"] .yt-supertool-speed-trigger:hover { background: rgba(0, 0, 0, 0.65); }
      [data-yt-supertool="speed"] .yt-supertool-speed-trigger.is-open { background: rgba(0, 0, 0, 0.75); }
      .yt-supertool-speed-dropdown {
        position: fixed;
        min-width: 180px;
        max-height: 160px;
        overflow-y: auto;
        background: rgba(28, 28, 28, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 8px 0;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        z-index: 2147483647;
        color: #fff;
        font: 500 13px/1 Roboto, Arial, sans-serif;
        pointer-events: auto;
        box-sizing: border-box;
      }
      .yt-supertool-speed-dropdown::-webkit-scrollbar { width: 6px; }
      .yt-supertool-speed-dropdown::-webkit-scrollbar-track { background: transparent; }
      .yt-supertool-speed-dropdown::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
      .yt-supertool-speed-dropdown .yt-supertool-speed-preset {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 32px;
        padding: 0 16px;
        color: #fff;
        cursor: pointer;
        user-select: none;
      }
      .yt-supertool-speed-dropdown .yt-supertool-speed-preset:hover { background: rgba(255, 255, 255, 0.08); }
      .yt-supertool-speed-dropdown .yt-supertool-speed-preset.is-active { background: rgba(255, 255, 255, 0.12); }
      .yt-supertool-speed-dropdown .yt-supertool-speed-check { color: #3ea6ff; font-size: 14px; opacity: 0; }
      .yt-supertool-speed-dropdown .yt-supertool-speed-preset.is-active .yt-supertool-speed-check { opacity: 1; }
      .yt-supertool-speed-dropdown .yt-supertool-speed-divider { height: 1px; background: rgba(255, 255, 255, 0.1); margin: 6px 12px; }
      .yt-supertool-speed-dropdown .yt-supertool-speed-label {
        font: 500 10px Roboto, Arial, sans-serif;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 8px 16px 4px;
      }
      .yt-supertool-speed-dropdown .yt-supertool-speed-mini-slider {
        display: block;
        width: calc(100% - 32px);
        margin: 4px 16px;
        height: 20px;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        cursor: pointer;
      }
      .yt-supertool-speed-dropdown .yt-supertool-speed-mini-slider::-webkit-slider-runnable-track { height: 3px; border-radius: 2px; background: rgba(255, 255, 255, 0.3); }
      .yt-supertool-speed-dropdown .yt-supertool-speed-mini-slider::-webkit-slider-thumb {
        width: 12px; height: 12px; margin-top: -4.5px; appearance: none; -webkit-appearance: none; border: 0; border-radius: 50%; background: #fff;
      }
      .yt-supertool-speed-dropdown .yt-supertool-speed-reset {
        display: block; height: 32px; margin: 4px 8px 8px; width: calc(100% - 16px); border: 0; border-radius: 8px;
        background: rgba(255, 255, 255, 0.1); color: #fff; font: 500 12px/1 Roboto, Arial, sans-serif; cursor: pointer;
      }
      @media (max-width: 1400px) { [data-yt-supertool="speed"] .yt-supertool-speed-slider { width: 80px; } }
      @media (max-width: 1100px) { [data-yt-supertool="speed"] .yt-supertool-speed-slider { display: none; } }

      .ytp-right-controls .yt-supertool-control {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 auto !important;
        margin: 0 !important;
        padding: 8px !important;
        border: 0 !important;
        background: transparent !important;
        color: #fff !important;
        cursor: pointer !important;
        vertical-align: middle !important;
        box-sizing: border-box !important;
        position: relative !important;
        top: 0 !important;
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        border-radius: 50% !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .ytp-right-controls .yt-supertool-control:hover { background: rgba(255, 255, 255, 0.1) !important; }
      .ytp-right-controls .yt-supertool-control.is-active { color: #3ea6ff !important; }
      .ytp-right-controls .yt-supertool-control svg {
        display: block !important;
        width: 24px !important;
        height: 24px !important;
        min-width: 24px !important;
        min-height: 24px !important;
        margin: auto !important;
        padding: 0 !important;
        fill: none !important;
        stroke: #fff !important;
        stroke-width: 2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        pointer-events: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .ytp-right-controls .yt-supertool-control.is-active svg {
        stroke: #3ea6ff !important;
      }

      .yt-supertool-sb-notice {
        position: absolute;
        left: 12px;
        bottom: 76px;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: min(420px, calc(100% - 24px));
        padding: 8px 10px 8px 12px;
        border-radius: 10px;
        background: rgba(20, 20, 20, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
        color: #fff;
        font: 500 13px/1.2 Roboto, Arial, sans-serif;
        z-index: 60;
        pointer-events: none;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      .yt-supertool-sb-notice.is-visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
      .yt-supertool-sb-bar {
        width: 4px;
        height: 18px;
        border-radius: 2px;
        background: var(--yt-supertool-sb-color, #00d400);
        flex: 0 0 auto;
      }
      .yt-supertool-sb-label { flex: 1 1 auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .yt-supertool-sb-undo {
        flex: 0 0 auto;
        height: 26px;
        padding: 0 10px;
        border: 0;
        border-radius: 13px;
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
        font: 500 12px/1 Roboto, Arial, sans-serif;
        cursor: pointer;
      }
      .yt-supertool-sb-undo:hover { background: rgba(255, 255, 255, 0.28); }

      .yt-supertool-sb-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 2147483647;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.18s ease, visibility 0.18s ease;
        font-family: Roboto, Arial, sans-serif;
        box-sizing: border-box;
      }
      .yt-supertool-sb-overlay.is-visible { opacity: 1; visibility: visible; }
      .yt-supertool-sb-panel {
        width: min(420px, 100%);
        max-height: min(82vh, 680px);
        overflow-y: auto;
        padding: 20px;
        border-radius: 16px;
        background: #1c1c1c;
        color: #f1f1f1;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
        box-sizing: border-box;
      }
      .yt-supertool-sb-panel::-webkit-scrollbar { width: 6px; }
      .yt-supertool-sb-panel::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
      .yt-supertool-sb-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .yt-supertool-sb-panel-title { font: 600 20px/1.2 Roboto, Arial, sans-serif; }
      .yt-supertool-sb-panel-close {
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font: 500 14px/1 Roboto, Arial, sans-serif;
        cursor: pointer;
      }
      .yt-supertool-sb-panel-close:hover { background: rgba(255, 255, 255, 0.2); }
      .yt-supertool-sb-panel-desc {
        margin: 8px 0 14px;
        color: rgba(255, 255, 255, 0.6);
        font: 400 13px/1.5 Roboto, Arial, sans-serif;
      }
      .yt-supertool-sb-category-list { display: flex; flex-direction: column; gap: 2px; }
      .yt-supertool-sb-category {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 38px;
        padding: 0 10px;
        border-radius: 10px;
        cursor: pointer;
        user-select: none;
        font: 400 14px/1.3 Roboto, Arial, sans-serif;
      }
      .yt-supertool-sb-category:hover { background: rgba(255, 255, 255, 0.06); }
      .yt-supertool-sb-category input {
        width: 16px;
        height: 16px;
        margin: 0;
        accent-color: #3ea6ff;
        cursor: pointer;
        flex: 0 0 auto;
      }
      .yt-supertool-sb-dot { width: 10px; height: 10px; border-radius: 50%; flex: 0 0 auto; }
      .yt-supertool-sb-category-name { flex: 1 1 auto; }
      .yt-supertool-sb-divider { height: 1px; margin: 12px 0; background: rgba(255, 255, 255, 0.1); }
      .yt-supertool-sb-panel-footer {
        margin-top: 14px;
        color: rgba(255, 255, 255, 0.42);
        font: 400 11px/1.5 Roboto, Arial, sans-serif;
      }

      .yt-supertool-toast {
        position: fixed;
        bottom: 24px;
        left: 24px;
        padding: 10px 16px;
        border-radius: 8px;
        background: rgba(20, 20, 20, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #fff;
        font: 500 13px/1.4 Roboto, Arial, sans-serif;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
        z-index: 2147483647;
        pointer-events: none;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .yt-supertool-toast.is-visible { opacity: 1; transform: translateY(0); }

      html[data-yt-supertool-no-shorts="on"] ytd-guide-entry-renderer:has(a[title="Shorts"]),
      html[data-yt-supertool-no-shorts="on"] ytd-mini-guide-entry-renderer:has(a[title="Shorts"]),
      html[data-yt-supertool-no-shorts="on"] ytd-guide-entry-renderer:has(a[href^="/shorts"]),
      html[data-yt-supertool-no-shorts="on"] ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
      html[data-yt-supertool-no-shorts="on"] ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
      html[data-yt-supertool-no-shorts="on"] ytd-rich-item-renderer:has(a[href^="/shorts/"]),
      html[data-yt-supertool-no-shorts="on"] ytd-video-renderer:has(a[href^="/shorts/"]),
      html[data-yt-supertool-no-shorts="on"] ytd-grid-video-renderer:has(a[href^="/shorts/"]),
      html[data-yt-supertool-no-shorts="on"] ytm-video-with-context-renderer:has(a[href^="/shorts/"]),
      html[data-yt-supertool-no-shorts="on"] ytm-compact-video-renderer:has(a[href^="/shorts/"]) {
        display: none !important;
      }

      html[data-yt-supertool-no-shorts="on"] [tab-title="Shorts"],
      html[data-yt-supertool-no-shorts="on"] ytd-reel-shelf-renderer,
      html[data-yt-supertool-no-shorts="on"] ytd-rich-shelf-renderer[is-shorts],
      html[data-yt-supertool-no-shorts="on"] ytm-reel-shelf-renderer,
      html[data-yt-supertool-no-shorts="on"] ytm-shorts-lockup-view-model,
      html[data-yt-supertool-no-shorts="on"] ytm-shorts-lockup-view-model-v2,
      html[data-yt-supertool-no-shorts="on"] .pivot-shorts,
      html[data-yt-supertool-no-shorts="on"] a[href="/shorts"] {
        display: none !important;
      }
    `;
    head.append(style);
    return true;
  }

  YT.injectStyles = injectStyles;
  if (!injectStyles()) {
    const tryInject = () => { if (!injectStyles()) setTimeout(tryInject, 50); };
    tryInject();
  }

  const DISLIKE_TTL = 5 * 60 * 1000;
  const DISLIKE_MAX = 500;
  const dislikeCache = new Map();
  const dislikeInflight = new Map();
  const VIDEO_ID_RE = /^[\w-]{6,20}$/;

  function fetchDislikeFromApi(videoId) {
    return new Promise(resolve => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`,
        responseType: 'json',
        timeout: 8000,
        onload: res => {
          if (res.status < 200 || res.status >= 300) return resolve({ ok: false, error: `HTTP ${res.status}` });
          let data = res.response;
          if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = null; } }
          resolve({ ok: true, dislikes: Number(data?.dislikes) || 0 });
        },
        onerror: () => resolve({ ok: false, error: 'Network error' }),
        ontimeout: () => resolve({ ok: false, error: 'Timeout' })
      });
    });
  }

  async function fetchDislikeCached(videoId) {
    if (!VIDEO_ID_RE.test(videoId)) return { ok: false, error: 'Invalid video ID' };
    const hit = dislikeCache.get(videoId);
    if (hit && Date.now() - hit.time < DISLIKE_TTL) return { ok: true, dislikes: hit.dislikes };
    if (dislikeInflight.has(videoId)) return dislikeInflight.get(videoId);

    const promise = fetchDislikeFromApi(videoId).then(result => {
      if (result.ok) {
        dislikeCache.set(videoId, { dislikes: result.dislikes, time: Date.now() });
        if (dislikeCache.size > DISLIKE_MAX) dislikeCache.delete(dislikeCache.keys().next().value);
      }
      return result;
    }).finally(() => dislikeInflight.delete(videoId));
    dislikeInflight.set(videoId, promise);
    return promise;
  }

  YT.api = { fetchDislike: fetchDislikeCached, openDownloadTab };
  YT.store = store;
  YT.createSvgIcon = createSvgIcon;
  YT.showToast = showToast;

  class ObserverManager {
    constructor(target = document.body, delay = 250) {
      this.target = target;
      this.delay = delay;
      this.callbacks = new Set();
      this.timer = 0;
      this.pendingMutations = [];
      this.observer = new MutationObserver(mutations => {
        for (let i = 0; i < mutations.length; i++) {
          this.pendingMutations.push(mutations[i]);
        }
        if (this.pendingMutations.length > 2000) this.pendingMutations.splice(0, 1000);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), this.delay);
      });
    }
    add(callback) { if (typeof callback === 'function') this.callbacks.add(callback); return this; }
    flush() {
      const mutations = this.pendingMutations.filter(m =>
        m.addedNodes.length > 0 || m.removedNodes.length > 0 || m.type === 'attributes'
      );
      this.pendingMutations = [];
      if (!mutations.length) return;
      this.callbacks.forEach(cb => {
        try { cb(mutations); } catch (error) { console.warn('YT SuperTool observer:', error); }
      });
    }
    start() {
      if (this.target) this.observer.observe(this.target, { childList: true, subtree: true });
      return this;
    }
    stop() {
      clearTimeout(this.timer);
      this.observer.disconnect();
      return this;
    }
  }

  YT.ObserverManager = ObserverManager;

  (function () {
    let lastVideoId = '';
    let enabled = false;
    let renderToken = 0;
    let renderTimer = 0;
    let retryTimer = 0;
    let segmentedObserver = null;
    let segmentedObserverTimer = 0;
    let currentBadge = null;
    let currentSegmented = null;
    let themeMedia = null;
    let themeListener = null;
    let docThemeObserver = null;

    const format = value =>
      new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

    function findSegmented() {
      return (
        document.querySelector('ytd-watch-metadata ytd-segmented-like-dislike-button-renderer') ||
        document.querySelector('ytd-segmented-like-dislike-button-renderer') ||
        document.querySelector('segmented-like-dislike-button-view-model') ||
        document.querySelector('ytm-segmented-like-dislike-button-renderer') ||
        document.querySelector('#top-level-buttons-computed')
      );
    }

    function findDislikeButton(segmented) {
      const selectors = [
        'dislike-button-view-model button',
        'ytd-segmented-like-dislike-button-renderer button[aria-label*="dislike" i]',
        'button[aria-label*="dislike" i]',
        'button[aria-label*="không thích" i]',
        '#top-level-buttons-computed ytd-toggle-button-renderer:nth-child(2) button'
      ];
      return selectors.map(s => segmented?.querySelector(s)).find(Boolean) || null;
    }

    function findDislikeHost(segmented) {
      const button = findDislikeButton(segmented);
      return button?.closest('dislike-button-view-model, ytd-toggle-button-renderer, ytm-toggle-button-renderer') || button;
    }

    function removeRenderedCount() {
      document.querySelectorAll('.yt-supertool-dislike-count, .yt-supertool-dislike-badge')
        .forEach(el => el.remove());
      currentBadge = null;
    }

    function createCount(value, videoId, targetHeight = 40) {
      const h = targetHeight >= 28 ? `${Math.round(targetHeight)}px` : '40px';
      const badge = document.createElement('div');
      badge.className = 'yt-supertool-dislike-count yt-supertool-dislike-badge';
      badge.style.cssText = `
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        align-self: stretch !important;
        height: ${h} !important;
        min-height: ${h} !important;
        padding: 0 6px 0 10px !important;
        margin: 0 !important;
        border: 0 !important;
        color: var(--yt-spec-text-primary, #fff) !important;
        font: 500 14px/${h} Roboto, sans-serif !important;
        cursor: default !important;
        user-select: none !important;
        flex-shrink: 0 !important;
        white-space: nowrap !important;
        position: static !important;
        z-index: auto !important;
        box-sizing: border-box !important;
        vertical-align: middle !important;
        transition: background-color 0.15s ease !important;
      `;
      badge.setAttribute('aria-label', 'Dislikes');
      badge.setAttribute('aria-live', 'polite');
      badge.setAttribute('data-yt-supertool', 'dislike');
      badge.setAttribute('data-video-id', videoId);
      badge.textContent = value === '—' ? '—' : format(value);
      return badge;
    }

    function readSegmentedBackground(segmented, fallbackEl) {
      const dislikeBtn = findDislikeButton(segmented);
      const candidates = [dislikeBtn, segmented, fallbackEl].filter(Boolean);
      for (const el of candidates) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return bg;
      }
      return 'rgba(255, 255, 255, 0.1)';
    }

    function syncBadgeBackground() {
      if (!currentBadge || !currentSegmented || !currentBadge.isConnected) return;
      const container = document.querySelector('#top-level-buttons-computed') || currentSegmented.parentElement;
      const bg = readSegmentedBackground(currentSegmented, container);
      if (currentBadge.dataset.lastBg !== bg) {
        currentBadge.style.setProperty('background-color', bg, 'important');
        currentBadge.dataset.lastBg = bg;
      }
      const dislikeBtn = findDislikeButton(currentSegmented);
      if (dislikeBtn) {
        const rectH = dislikeBtn.getBoundingClientRect().height;
        if (rectH >= 28) {
          const hPx = `${Math.round(rectH)}px`;
          currentBadge.style.setProperty('height', hPx, 'important');
          currentBadge.style.setProperty('min-height', hPx, 'important');
          currentBadge.style.setProperty('line-height', hPx, 'important');
        }
      }
      const color = getComputedStyle(currentSegmented).color;
      if (color) currentBadge.style.setProperty('color', color, 'important');
    }

    function observeSegmentedBg() {
      segmentedObserver?.disconnect();
      clearTimeout(segmentedObserverTimer);
      if (!currentSegmented) return;
      segmentedObserver = new MutationObserver(() => syncBadgeBackground());
      segmentedObserver.observe(currentSegmented, { attributes: true, attributeFilter: ['style', 'class'] });
      segmentedObserverTimer = setTimeout(() => {
        segmentedObserver?.disconnect();
        segmentedObserver = null;
      }, 5000);
    }

    function setupThemeListener() {
      if (!themeMedia) {
        try {
          themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
          themeListener = () => syncBadgeBackground();
          themeMedia.addEventListener('change', themeListener);
        } catch {}
      }
      if (!docThemeObserver) {
        docThemeObserver = new MutationObserver(() => syncBadgeBackground());
        docThemeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['dark', 'light', 'dark-theme', 'class']
        });
      }
    }

    function cleanupThemeListener() {
      if (themeMedia && themeListener) {
        try { themeMedia.removeEventListener('change', themeListener); } catch {}
      }
      themeMedia = null;
      themeListener = null;
      docThemeObserver?.disconnect();
      docThemeObserver = null;
    }

    function insertBadge(segmented, value, videoId) {
      const dislikeHost = findDislikeHost(segmented);
      const dislikeBtn = findDislikeButton(segmented);
      const measuredHeight = (dislikeBtn || dislikeHost || segmented)?.getBoundingClientRect?.().height || 40;
      const badge = createCount(value, videoId, measuredHeight);

      if (dislikeBtn && dislikeHost) {
        const parent = dislikeHost.parentElement || segmented;
        parent.insertBefore(badge, dislikeHost);
      } else {
        segmented.appendChild(badge);
      }

      currentBadge = badge;
      currentSegmented = segmented;
      syncBadgeBackground();
      observeSegmentedBg();
      setupThemeListener();
    }

    async function render() {
      if (!enabled) return;
      const id = getVideoIdFromUrl();
      if (!id) {
        removeRenderedCount();
        return;
      }

      const segmented = findSegmented();
      if (!segmented) return;

      const existing = document.querySelector(`.yt-supertool-dislike-count[data-video-id="${id}"]`);
      if (existing && existing.isConnected) return;

      const token = ++renderToken;
      lastVideoId = id;

      const response = await YT.api.fetchDislike(id);
      const value = response?.ok ? response.dislikes : '—';

      if (!enabled || token !== renderToken || id !== getVideoIdFromUrl()) return;

      removeRenderedCount();
      insertBadge(segmented, value, id);
    }

    function scheduleRender() {
      clearTimeout(renderTimer);
      clearTimeout(retryTimer);
      renderTimer = setTimeout(render, 100);
      retryTimer = setTimeout(render, 1200);
    }

    YT.dislike = {
      initDislike() {
        enabled = true;
        lastVideoId = '';
        scheduleRender();
      },
      updateDislike(mutations) {
        if (!enabled) return;
        const videoId = getVideoIdFromUrl();
        if (videoId !== lastVideoId) {
          removeRenderedCount();
          scheduleRender();
          return;
        }
        if (videoId && !document.querySelector(`.yt-supertool-dislike-count[data-video-id="${videoId}"]`)) {
          const hasControls = mutations.some(m =>
            [...m.addedNodes].some(n =>
              n.nodeType === Node.ELEMENT_NODE &&
              (n.id === 'top-level-buttons-computed' ||
               n.tagName?.includes('LIKE-DISLIKE') ||
               n.querySelector?.('#top-level-buttons-computed, ytd-segmented-like-dislike-button-renderer, dislike-button-view-model'))
            )
          );
          if (hasControls) scheduleRender();
        }
      },
      stopDislike() {
        enabled = false;
        lastVideoId = '';
        renderToken = 0;
        clearTimeout(renderTimer);
        clearTimeout(retryTimer);
        clearTimeout(segmentedObserverTimer);
        segmentedObserver?.disconnect();
        segmentedObserver = null;
        cleanupThemeListener();
        currentBadge = null;
        currentSegmented = null;
        removeRenderedCount();
      }
    };
  })();

  (function () {
    const SHORTS_SELECTORS = [
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-shelf-renderer',
      'ytm-shorts-lockup-view-model',
      '[tab-title="Shorts"]',
      '.pivot-shorts',
      'a[href="/shorts"]',
      '.reel-shelf-renderer',
      'ytm-reel-shelf-renderer',
      'ytm-shorts-lockup-view-model-v2'
    ];
    const SHORTS_HAS_RULES = [
      { parent: 'ytd-guide-entry-renderer', child: 'a[title="Shorts"]' },
      { parent: 'ytd-mini-guide-entry-renderer', child: 'a[title="Shorts"]' },
      { parent: 'ytd-rich-section-renderer', child: 'ytd-rich-shelf-renderer[is-shorts]' },
      { parent: 'ytd-rich-item-renderer', child: 'a[href^="/shorts/"]' },
      { parent: 'ytd-video-renderer', child: 'a[href^="/shorts/"]' },
      { parent: 'ytd-grid-video-renderer', child: 'a[href^="/shorts/"]' },
      { parent: 'ytm-video-with-context-renderer', child: 'a[href^="/shorts/"]' },
      { parent: 'ytm-compact-video-renderer', child: 'a[href^="/shorts/"]' }
    ];
    const COMBINED = SHORTS_SELECTORS.join(',');
    const RELEVANT_TAGS = /^(YTD-RICH-ITEM-RENDERER|YTD-VIDEO-RENDERER|YTD-GRID-VIDEO-RENDERER|YTD-RICH-SECTION-RENDERER|YTD-REEL-SHELF-RENDERER|YTD-RICH-SHELF-RENDERER|YTD-GUIDE-ENTRY-RENDERER|YTD-MINI-GUIDE-ENTRY-RENDERER|YTM-)/;

    const elementsFor = (root, selector, includeRoot = true) => [
      ...(includeRoot && root.matches?.(selector) ? [root] : []),
      ...(root.querySelectorAll?.(selector) || [])
    ];

    const removeShortElement = element => {
      const parentSection = element.matches('ytd-rich-shelf-renderer[is-shorts]')
        ? element.closest('ytd-rich-section-renderer') : null;
      (parentSection || element).remove();
    };

    function hideShorts(root = document) {
      const includeRoot = root.nodeType !== Node.ELEMENT_NODE || RELEVANT_TAGS.test(root.tagName);
      const set = new Set();
      elementsFor(root, COMBINED, includeRoot).forEach(el => { if (el.isConnected) set.add(el); });
      SHORTS_HAS_RULES.forEach(({ parent, child }) => {
        elementsFor(root, parent, includeRoot).forEach(el => {
          if (el.isConnected && el.querySelector(child)) set.add(el);
        });
      });
      set.forEach(removeShortElement);
    }

    YT.noShorts = {
      initNoShorts() {
        if (document.documentElement) document.documentElement.dataset.ytSupertoolNoShorts = 'on';
        hideShorts();
      },
      updateNoShorts(mutations) {
        mutations.forEach(m => m.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && RELEVANT_TAGS.test(node.tagName)) hideShorts(node);
        }));
      },
      stopNoShorts() {
        if (document.documentElement) delete document.documentElement.dataset.ytSupertoolNoShorts;
      }
    };
  })();

  (function () {
    const isCleanHomepageSection = section => {
      if (section.querySelector('ytd-inline-survey-renderer, ytd-statement-banner-renderer, ytd-mini-game-card-view-model, mini-game-card-view-model')) return true;
      if (section.querySelector('a[href*="/playables"], a[href*="/mini-game"], a[href*="/feed/storefront"], a[href="/gaming"]')) return true;
      if (section.querySelector('ytd-rich-shelf-renderer[is-live]')) return true;
      const text = section.textContent;
      if (!text) return false;
      return text.includes('Chơi game trên YouTube') || text.includes('Chơi ngay không cần tải') ||
        text.includes('Playables') || text.includes('Play games') || text.includes('Phim & TV') ||
        text.includes('Gaming') || text.includes('Trò chơi') || text.includes('Trực tiếp');
    };

    function hideCleanHomepageSections(root = document) {
      const promos = root.matches?.('yt-mealbar-promo-renderer') ? [root] : root.querySelectorAll?.('yt-mealbar-promo-renderer') || [];
      promos.forEach(promo => {
        if (!promo.isConnected) return;
        (promo.closest('tp-yt-paper-dialog, ytd-popup-container') || promo).remove();
      });

      const sections = root.matches?.('ytd-rich-section-renderer') ? [root] : root.querySelectorAll?.('ytd-rich-section-renderer') || [];
      sections.forEach(section => {
        if (section.isConnected && isCleanHomepageSection(section)) section.remove();
      });

      const banners = root.matches?.('ytd-statement-banner-renderer') ? [root] : root.querySelectorAll?.('ytd-statement-banner-renderer') || [];
      banners.forEach(banner => {
        if (banner.isConnected && !banner.closest('ytd-rich-section-renderer')) banner.remove();
      });
    }

    YT.cleanHomepage = {
      initCleanHomepage() {
        hideCleanHomepageSections();
        setTimeout(hideCleanHomepageSections, 500);
        setTimeout(hideCleanHomepageSections, 1500);
      },
      updateCleanHomepage(mutations) {
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) hideCleanHomepageSections(node);
          });
        });
      },
      stopCleanHomepage() {}
    };
  })();

  (function () {
    const POPUP_SELECTORS = [
      '.yt-confirm-dialog-renderer',
      '[aria-label="Confirm you\'re still watching"]',
      '.ytd-button-renderer[aria-label*="continue watching" i]',
      'ytd-modal-with-title-and-button-renderer'
    ];
    const POPUP_SELECTOR = POPUP_SELECTORS.join(',');
    const PAUSE_TEXT = /continue\s+watching|video\s+paused|tiếp\s+tục\s+xem/i;
    const PLAYBACK_ERROR_TEXT = /sự cố gây gián đoạn|gặp sự cố|playback.*interrupted|something went wrong/i;
    let removed = new WeakSet();

    const containsPauseText = el => {
      const text = el.textContent || '';
      return PAUSE_TEXT.test(text) || PLAYBACK_ERROR_TEXT.test(text);
    };

    function findPopup(root) {
      if (!root?.querySelectorAll) return [];
      const matches = [];
      if (root.matches?.(`${POPUP_SELECTOR}, #dialog, [role="dialog"], ytd-popup-container`) && containsPauseText(root)) matches.push(root);
      root.querySelectorAll(`${POPUP_SELECTOR}, #dialog, [role="dialog"], ytd-popup-container`).forEach(el => {
        if (containsPauseText(el)) matches.push(el);
      });
      return [...new Set(matches)];
    }

    function removePopup(popup) {
      if (removed.has(popup)) return;
      removed.add(popup);
      popup.style.display = 'none';
      const host = popup.closest('#dialog, ytd-popup-container, tp-yt-paper-dialog');
      if (host && host !== popup && containsPauseText(host)) host.remove();
      else popup.remove();

      if (PAUSE_TEXT.test(popup.textContent || '')) {
        const video = document.querySelector('video');
        if (video?.paused) video.play().catch(() => {});
      }
    }

    YT.nonstop = {
      initNonstop() { findPopup(document).forEach(removePopup); },
      updateNonstop(mutations) {
        mutations.forEach(m => {
          if (m.target?.nodeType === Node.ELEMENT_NODE) findPopup(m.target).forEach(removePopup);
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) findPopup(node).forEach(removePopup);
          });
        });
      },
      stopNonstop() { removed = new WeakSet(); }
    };
  })();

  (function () {
    const MIN_SPEED = 0.25;
    const MAX_SPEED = 10;
    const STEP = 0.05;
    const KEY_STEP = 0.25;
    const DEFAULT_SPEED = 1;
    const PRESET_GROUPS = [
      [0.25, 0.5, 0.75],
      [1, 1.25, 1.5, 1.75],
      [2, 2.5, 3],
      [4, 5, 6, 7, 8, 9, 10]
    ];

    let currentSpeed = DEFAULT_SPEED;
    let container = null;
    let video = null;
    let onKeydown = null;
    let onRateChange = null;
    let initRetryTimer = 0;
    let initRetryCount = 0;
    let sliderRef = null;
    let chipRef = null;
    let dropdownEl = null;
    let miniSliderRef = null;
    let presetItems = [];
    let isDropdownOpen = false;
    let saveTimer = 0;
    let clickOutsideHandler = null;
    let escapeHandler = null;
    let positionHandler = null;

    const clampSpeed = v => Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(v) || DEFAULT_SPEED));
    const normalizeSpeed = v => Math.round(clampSpeed(v) / STEP) * STEP;
    const shortSpeed = v => `${Number(Number(v).toFixed(2))}x`;

    function saveSpeed(speed) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => YT.store.set('playbackSpeed', speed), 200);
    }

    function syncPresetStates() {
      for (const item of presetItems) {
        const presetValue = parseFloat(item.dataset.value);
        item.classList.toggle('is-active', Math.abs(presetValue - currentSpeed) < 0.001);
      }
    }

    function syncChipText() {
      if (chipRef) chipRef.textContent = isDropdownOpen ? '✕' : `${shortSpeed(currentSpeed)} ▼`;
    }

    function applySpeed(value, persist = true) {
      const next = Number(normalizeSpeed(value).toFixed(2));
      if (next === currentSpeed) {
        if (persist) saveSpeed(currentSpeed);
        return;
      }
      currentSpeed = next;
      if (video && video.playbackRate !== currentSpeed) video.playbackRate = currentSpeed;
      if (sliderRef) {
        sliderRef.value = String(currentSpeed);
        sliderRef.title = shortSpeed(currentSpeed);
      }
      if (miniSliderRef) miniSliderRef.value = String(currentSpeed);
      syncChipText();
      syncPresetStates();
      if (persist) saveSpeed(currentSpeed);
    }

    function closeDropdown() {
      if (!isDropdownOpen) return;
      isDropdownOpen = false;
      if (dropdownEl) {
        dropdownEl.style.display = 'none';
        if (dropdownEl.parentElement === document.body && container) container.appendChild(dropdownEl);
      }
      chipRef?.classList.remove('is-open');
      syncChipText();
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler, true);
        document.removeEventListener('pointerdown', clickOutsideHandler, true);
        clickOutsideHandler = null;
      }
      if (escapeHandler) {
        document.removeEventListener('keydown', escapeHandler, true);
        escapeHandler = null;
      }
      if (positionHandler) {
        window.removeEventListener('resize', positionHandler);
        window.removeEventListener('scroll', positionHandler, true);
        positionHandler = null;
      }
    }

    function openDropdown() {
      if (isDropdownOpen) return;
      isDropdownOpen = true;
      if (dropdownEl) {
        if (dropdownEl.parentElement !== document.body) document.body.appendChild(dropdownEl);
        dropdownEl.style.display = 'block';
        dropdownEl.style.position = 'fixed';
        dropdownEl.style.zIndex = '2147483647';
      }
      chipRef?.classList.add('is-open');
      syncChipText();

      clickOutsideHandler = e => {
        const path = e.composedPath?.() || [];
        if (path.includes(container) || path.includes(dropdownEl)) return;
        closeDropdown();
      };
      escapeHandler = e => { if (e.key === 'Escape') closeDropdown(); };
      positionHandler = () => {
        if (!isDropdownOpen || !chipRef || !dropdownEl) return;
        const chipRect = chipRef.getBoundingClientRect();
        const ddRect = dropdownEl.getBoundingClientRect();
        dropdownEl.style.top = `${chipRect.top - ddRect.height - 8}px`;
        dropdownEl.style.left = `${Math.max(8, chipRect.right - ddRect.width)}px`;
      };
      positionHandler();
      window.addEventListener('resize', positionHandler, { passive: true });
      window.addEventListener('scroll', positionHandler, { passive: true, capture: true });
      document.addEventListener('click', clickOutsideHandler, true);
      document.addEventListener('pointerdown', clickOutsideHandler, true);
      document.addEventListener('keydown', escapeHandler, true);
    }

    function buildDropdown() {
      const dd = document.createElement('div');
      dd.className = 'yt-supertool-speed-dropdown';
      dd.style.display = 'none';

      PRESET_GROUPS.forEach((group, idx) => {
        group.forEach(value => {
          const item = document.createElement('div');
          item.className = 'yt-supertool-speed-preset';
          item.dataset.value = String(value);
          const label = document.createElement('span');
          label.textContent = shortSpeed(value);
          const check = document.createElement('span');
          check.className = 'yt-supertool-speed-check';
          check.textContent = '✓';
          item.append(label, check);
          item.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            applySpeed(value);
            closeDropdown();
          });
          dd.append(item);
        });
        if (idx < PRESET_GROUPS.length - 1) {
          const div = document.createElement('div');
          div.className = 'yt-supertool-speed-divider';
          dd.append(div);
        }
      });

      const div2 = document.createElement('div');
      div2.className = 'yt-supertool-speed-divider';
      const label = document.createElement('div');
      label.className = 'yt-supertool-speed-label';
      label.textContent = 'Custom';
      const mini = document.createElement('input');
      mini.type = 'range';
      mini.className = 'yt-supertool-speed-mini-slider';
      mini.min = String(MIN_SPEED);
      mini.max = String(MAX_SPEED);
      mini.step = String(STEP);
      mini.value = String(currentSpeed);
      mini.addEventListener('input', e => applySpeed(e.target.value));

      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'yt-supertool-speed-reset';
      reset.textContent = 'Reset 1x';
      reset.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        applySpeed(DEFAULT_SPEED);
        closeDropdown();
      });

      dd.append(div2, label, mini, reset);
      return { dd, mini };
    }

    function initSpeed(player) {
      if (!player) return;
      const anchor = player.querySelector('.ytp-left-controls .ytp-time-display');
      if (!anchor) {
        if (initRetryCount < 40) {
          clearTimeout(initRetryTimer);
          initRetryCount++;
          initRetryTimer = setTimeout(() => initSpeed(player), 250);
        }
        return;
      }
      initRetryCount = 0;

      const existing = document.querySelector('[data-yt-supertool="speed"]');
      if (existing) {
        if (existing.parentElement !== anchor.parentElement) anchor.insertAdjacentElement('afterend', existing);
        video = player.querySelector('video');
        if (video && video.playbackRate !== currentSpeed) video.playbackRate = currentSpeed;
        return;
      }

      stopSpeed();
      video = player.querySelector('video');

      const el = document.createElement('div');
      el.dataset.ytSupertool = 'speed';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'yt-supertool-speed-slider';
      slider.min = String(MIN_SPEED);
      slider.max = String(MAX_SPEED);
      slider.step = String(STEP);
      slider.value = String(currentSpeed);
      slider.addEventListener('input', e => applySpeed(e.target.value));
      slider.addEventListener('dblclick', e => { e.preventDefault(); applySpeed(DEFAULT_SPEED); });

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'yt-supertool-speed-trigger';
      chip.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (isDropdownOpen) closeDropdown(); else openDropdown();
      });

      const { dd, mini } = buildDropdown();
      el.append(slider, chip, dd);
      anchor.insertAdjacentElement('afterend', el);

      container = el;
      sliderRef = slider;
      chipRef = chip;
      dropdownEl = dd;
      miniSliderRef = mini;
      presetItems = Array.from(dd.querySelectorAll('.yt-supertool-speed-preset'));

      syncChipText();
      syncPresetStates();

      onRateChange = () => {
        if (!video) return;
        const rate = Number(video.playbackRate.toFixed(2));
        if (Math.abs(rate - currentSpeed) > 0.001) {
          currentSpeed = rate;
          if (sliderRef) sliderRef.value = String(currentSpeed);
          if (miniSliderRef) miniSliderRef.value = String(currentSpeed);
          syncChipText();
          syncPresetStates();
          saveSpeed(currentSpeed);
        }
      };
      video?.addEventListener('ratechange', onRateChange);

      onKeydown = e => {
        const active = document.activeElement;
        if (active?.matches('input, textarea, [contenteditable="true"]')) return;
        if (e.key !== '>' && e.key !== '<') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        applySpeed(currentSpeed + (e.key === '>' ? KEY_STEP : -KEY_STEP));
      };
      document.addEventListener('keydown', onKeydown, true);

      const saved = Number(YT.store.get('playbackSpeed', DEFAULT_SPEED));
      if (saved >= MIN_SPEED && saved <= MAX_SPEED) applySpeed(saved, false);
    }

    function stopSpeed() {
      clearTimeout(initRetryTimer);
      clearTimeout(saveTimer);
      closeDropdown();
      if (dropdownEl?.parentElement === document.body) dropdownEl.remove();
      if (onKeydown) { document.removeEventListener('keydown', onKeydown, true); onKeydown = null; }
      if (onRateChange && video) { video.removeEventListener('ratechange', onRateChange); onRateChange = null; }
      document.querySelectorAll('[data-yt-supertool="speed"]').forEach(el => el.remove());
      container = sliderRef = chipRef = dropdownEl = miniSliderRef = video = null;
      presetItems = [];
    }

    YT.speed = { initSpeed, stopSpeed };
  })();

  (function () {
    const API_BASE = 'https://sponsor.ajay.app/api';
    const CACHE_TTL = 30 * 60 * 1000;
    const CACHE_MAX = 120;
    const TICK_INTERVAL = 250;
    const MIN_SEGMENT_LENGTH = 0.5;
    const NOTICE_DURATION = 5000;

    const CATEGORY_META = {
      sponsor: { label: 'Tài trợ', color: '#00d400', enabled: true },
      selfpromo: { label: 'Tự quảng cáo', color: '#ffff00', enabled: true },
      interaction: { label: 'Nhắc tương tác', color: '#cc00ff', enabled: true },
      intro: { label: 'Intro', color: '#00ffff', enabled: false },
      outro: { label: 'Outro', color: '#0202ed', enabled: false },
      preview: { label: 'Xem trước', color: '#008fd6', enabled: false },
      music_offtopic: { label: 'Ngoài phần nhạc', color: '#ff9900', enabled: false },
      filler: { label: 'Nội dung thừa', color: '#7300ff', enabled: false }
    };

    let enabled = false;
    let tickTimer = 0;
    let currentVideoId = '';
    let segments = [];
    let skipped = new Set();
    let fetchToken = 0;
    let lastSkip = null;
    let noticeEl = null;
    let noticeTimer = 0;
    let settingsEl = null;
    let settingsKeyHandler = null;
    let seekingBound = false;

    const segmentCache = new Map();
    const inflight = new Map();

    const getPlayer = () => document.querySelector('.html5-video-player') || document.querySelector('#movie_player');
    const getVideo = () => getPlayer()?.querySelector('video') || document.querySelector('video');
    const metaFor = category => CATEGORY_META[category] || { label: category || 'Sponsor', color: '#00d400' };

    function readCategories() {
      let raw = YT.store.get('sponsorblockCategories', null);
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch { raw = null; }
      }
      const result = {};
      Object.keys(CATEGORY_META).forEach(key => {
        result[key] = raw && typeof raw === 'object' && typeof raw[key] === 'boolean'
          ? raw[key]
          : CATEGORY_META[key].enabled;
      });
      return result;
    }

    function activeCategories() {
      const categories = readCategories();
      return Object.keys(CATEGORY_META).filter(key => categories[key]);
    }

    const isNoticeEnabled = () => Boolean(YT.store.get('sponsorblockNotice', true));

    const cacheKey = (videoId, categories) => `${videoId}|${categories.slice().sort().join(',')}`;

    function getCached(videoId, categories) {
      const key = cacheKey(videoId, categories);
      const hit = segmentCache.get(key);
      if (!hit) return null;
      if (Date.now() - hit.time > CACHE_TTL) {
        segmentCache.delete(key);
        return null;
      }
      return hit.segments;
    }

    function setCache(videoId, categories, list) {
      const key = cacheKey(videoId, categories);
      segmentCache.set(key, { segments: list, time: Date.now() });
      while (segmentCache.size > CACHE_MAX) {
        segmentCache.delete(segmentCache.keys().next().value);
      }
    }

    function fetchSegments(videoId, categories) {
      const key = cacheKey(videoId, categories);
      if (inflight.has(key)) return inflight.get(key);

      const url = `${API_BASE}/skipSegments?videoID=${encodeURIComponent(videoId)}` +
        `&categories=${encodeURIComponent(JSON.stringify(categories))}` +
        `&actionTypes=${encodeURIComponent('["skip"]')}`;

      const promise = new Promise(resolve => {
        GM_xmlhttpRequest({
          method: 'GET',
          url,
          responseType: 'json',
          timeout: 8000,
          onload: res => {
            if (res.status === 404) return resolve({ ok: true, segments: [] });
            if (res.status < 200 || res.status >= 300) return resolve({ ok: false, error: `HTTP ${res.status}` });
            let data = res.response;
            if (typeof data === 'string') {
              try { data = JSON.parse(data); } catch { data = null; }
            }
            resolve({ ok: true, segments: Array.isArray(data) ? data : [] });
          },
          onerror: () => resolve({ ok: false, error: 'Network error' }),
          ontimeout: () => resolve({ ok: false, error: 'Timeout' })
        });
      }).finally(() => inflight.delete(key));

      inflight.set(key, promise);
      return promise;
    }

    function normalizeSegments(list) {
      return (Array.isArray(list) ? list : [])
        .filter(seg => seg && Array.isArray(seg.segment))
        .filter(seg => Number.isFinite(Number(seg.segment[0])) && Number.isFinite(Number(seg.segment[1])))
        .filter(seg => Number(seg.segment[1]) - Number(seg.segment[0]) >= MIN_SEGMENT_LENGTH)
        .filter(seg => !seg.actionType || seg.actionType === 'skip')
        .map(seg => ({
          uuid: seg.UUID || `${seg.segment[0]}-${seg.segment[1]}`,
          category: seg.category || 'sponsor',
          start: Number(seg.segment[0]),
          end: Number(seg.segment[1]),
          videoDuration: Number(seg.videoDuration) || 0
        }))
        .sort((a, b) => a.start - b.start);
    }

    function loadSegments(videoId) {
      const token = ++fetchToken;
      segments = [];
      skipped = new Set();
      lastSkip = null;
      hideNotice();
      if (!enabled || !videoId) return;

      const categories = activeCategories();
      if (!categories.length) return;

      const cached = getCached(videoId, categories);
      if (cached) {
        segments = cached;
        return;
      }

      fetchSegments(videoId, categories).then(result => {
        if (!enabled || token !== fetchToken || videoId !== currentVideoId) return;
        if (!result.ok) return;
        const list = normalizeSegments(result.segments);
        setCache(videoId, categories, list);
        segments = list;
      });
    }

    function doSkip(video, seg) {
      skipped.add(seg.uuid);
      lastSkip = seg;
      const end = Math.min(seg.end, Number(video.duration) || seg.end);
      try {
        video.currentTime = end;
      } catch (error) {
        console.warn('YT SuperTool SponsorBlock seek:', error);
      }
      showNotice(seg);
    }

    function tick() {
      if (!enabled) return;
      const video = getVideo();
      if (!video) return;
      if (video.closest('.html5-video-player')?.classList.contains('ad-showing')) return;

      const id = getVideoIdFromUrl();
      if (id !== currentVideoId) {
        currentVideoId = id;
        loadSegments(id);
        return;
      }

      if (!segments.length || video.readyState < 1) return;
      const duration = Number(video.duration);
      if (!Number.isFinite(duration) || duration <= 0) return;

      const time = video.currentTime;
      for (const seg of segments) {
        if (time < seg.start) break;
        if (time >= seg.end) continue;
        if (skipped.has(seg.uuid)) continue;
        if (seg.videoDuration > 0 && Math.abs(seg.videoDuration - duration) > 2) continue;
        doSkip(video, seg);
        return;
      }
    }

    function ensureNotice() {
      if (noticeEl?.isConnected) return noticeEl;
      const player = getPlayer();
      if (!player) return null;

      noticeEl = document.createElement('div');
      noticeEl.className = 'yt-supertool-sb-notice';
      noticeEl.dataset.ytSupertool = 'sb-notice';

      const bar = document.createElement('span');
      bar.className = 'yt-supertool-sb-bar';

      const label = document.createElement('span');
      label.className = 'yt-supertool-sb-label';

      const undo = document.createElement('button');
      undo.type = 'button';
      undo.className = 'yt-supertool-sb-undo';
      undo.textContent = 'Hoàn tác';
      undo.addEventListener('pointerdown', e => e.stopPropagation());
      undo.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        undoSkip();
      });

      noticeEl.append(bar, label, undo);
      player.appendChild(noticeEl);
      return noticeEl;
    }

    function showNotice(seg) {
      if (!isNoticeEnabled()) return;
      const el = ensureNotice();
      if (!el) return;
      const meta = metaFor(seg.category);
      const seconds = Math.max(1, Math.round(seg.end - seg.start));
      el.style.setProperty('--yt-supertool-sb-color', meta.color);
      el.querySelector('.yt-supertool-sb-label').textContent = `Đã bỏ qua: ${meta.label} (${seconds}s)`;
      clearTimeout(noticeTimer);
      el.classList.add('is-visible');
      noticeTimer = setTimeout(hideNotice, NOTICE_DURATION);
    }

    function hideNotice() {
      clearTimeout(noticeTimer);
      noticeTimer = 0;
      noticeEl?.classList.remove('is-visible');
    }

    function undoSkip() {
      const video = getVideo();
      if (video && lastSkip) {
        try {
          video.currentTime = Math.max(0, lastSkip.start);
        } catch (error) {
          console.warn('YT SuperTool SponsorBlock undo:', error);
        }
      }
      hideNotice();
    }

    function onSeeking(event) {
      if (!enabled || !segments.length) return;
      const video = event.target;
      if (!(video instanceof HTMLVideoElement)) return;
      if (getVideo() !== video) return;
      const time = video.currentTime;
      for (const uuid of [...skipped]) {
        const seg = segments.find(item => item.uuid === uuid);
        if (seg && time < seg.start - 0.5) skipped.delete(uuid);
      }
    }

    function bindSeeking() {
      if (seekingBound) return;
      seekingBound = true;
      document.addEventListener('seeking', onSeeking, true);
    }

    function unbindSeeking() {
      if (!seekingBound) return;
      seekingBound = false;
      document.removeEventListener('seeking', onSeeking, true);
    }

    function startTicker() {
      clearInterval(tickTimer);
      tickTimer = setInterval(tick, TICK_INTERVAL);
    }

    function stopTicker() {
      clearInterval(tickTimer);
      tickTimer = 0;
    }

    function buildSettingsPanel() {
      const overlay = document.createElement('div');
      overlay.className = 'yt-supertool-sb-overlay is-visible';
      overlay.dataset.ytSupertool = 'sb-settings';
      overlay.addEventListener('click', e => { if (e.target === overlay) closeSettings(); });

      const panel = document.createElement('div');
      panel.className = 'yt-supertool-sb-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', 'Cài đặt SponsorBlock');

      const header = document.createElement('div');
      header.className = 'yt-supertool-sb-panel-header';

      const title = document.createElement('div');
      title.className = 'yt-supertool-sb-panel-title';
      title.textContent = 'SponsorBlock';

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'yt-supertool-sb-panel-close';
      close.setAttribute('aria-label', 'Đóng');
      close.textContent = '✕';
      close.addEventListener('click', closeSettings);
      header.append(title, close);

      const desc = document.createElement('div');
      desc.className = 'yt-supertool-sb-panel-desc';
      desc.textContent = 'Tự động bỏ qua các đoạn tài trợ và quảng cáo bằng dữ liệu cộng đồng từ SponsorBlock.';

      const list = document.createElement('div');
      list.className = 'yt-supertool-sb-category-list';

      const categories = readCategories();
      Object.keys(CATEGORY_META).forEach(key => {
        const meta = CATEGORY_META[key];
        const row = document.createElement('label');
        row.className = 'yt-supertool-sb-category';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = categories[key];

        const dot = document.createElement('span');
        dot.className = 'yt-supertool-sb-dot';
        dot.style.background = meta.color;

        const name = document.createElement('span');
        name.className = 'yt-supertool-sb-category-name';
        name.textContent = meta.label;

        input.addEventListener('change', () => {
          const next = readCategories();
          next[key] = input.checked;
          YT.store.set('sponsorblockCategories', JSON.stringify(next));
          segmentCache.clear();
          if (enabled) loadSegments(currentVideoId);
        });

        row.append(input, dot, name);
        list.append(row);
      });

      const divider = document.createElement('div');
      divider.className = 'yt-supertool-sb-divider';

      const noticeRow = document.createElement('label');
      noticeRow.className = 'yt-supertool-sb-category';

      const noticeInput = document.createElement('input');
      noticeInput.type = 'checkbox';
      noticeInput.checked = isNoticeEnabled();
      noticeInput.addEventListener('change', () => {
        YT.store.set('sponsorblockNotice', noticeInput.checked);
      });

      const noticeName = document.createElement('span');
      noticeName.className = 'yt-supertool-sb-category-name';
      noticeName.textContent = 'Hiện thông báo khi bỏ qua';

      noticeRow.append(noticeInput, noticeName);

      const footer = document.createElement('div');
      footer.className = 'yt-supertool-sb-panel-footer';
      footer.textContent = 'Dữ liệu từ sponsor.ajay.app · Đổi danh mục sẽ tải lại đoạn cho video hiện tại.';

      panel.append(header, desc, list, divider, noticeRow, footer);
      overlay.append(panel);
      document.body.appendChild(overlay);
      settingsEl = overlay;
      try { close.focus({ preventScroll: true }); } catch {}
    }

    function openSettings() {
      closeSettings();
      buildSettingsPanel();
      settingsKeyHandler = e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeSettings();
        }
      };
      document.addEventListener('keydown', settingsKeyHandler, true);
    }

    function closeSettings() {
      settingsEl?.remove();
      settingsEl = null;
      if (settingsKeyHandler) {
        document.removeEventListener('keydown', settingsKeyHandler, true);
        settingsKeyHandler = null;
      }
    }

    function initSponsorBlock() {
      if (enabled) {
        if (!tickTimer) startTicker();
        const id = getVideoIdFromUrl();
        if (id && id !== currentVideoId) {
          currentVideoId = id;
          loadSegments(id);
        }
        return;
      }
      enabled = true;
      bindSeeking();
      startTicker();
      currentVideoId = getVideoIdFromUrl();
      loadSegments(currentVideoId);
    }

    function stopSponsorBlock() {
      enabled = false;
      stopTicker();
      unbindSeeking();
      ++fetchToken;
      segments = [];
      skipped = new Set();
      lastSkip = null;
      currentVideoId = '';
      hideNotice();
    }

    document.addEventListener('yt-navigate-finish', () => {
      if (!enabled) return;
      currentVideoId = '';
      segments = [];
      skipped = new Set();
      lastSkip = null;
      hideNotice();
    }, { passive: true });

    YT.sponsorblock = { initSponsorBlock, stopSponsorBlock, openSettings };
  })();

  (function () {
    const CAMERA_ICON = [
      ['path', { d: 'M5 7.5h3l1.4-2h5.2l1.4 2h3A2 2 0 0 1 21 9.5v8A2 2 0 0 1 19 19.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z' }],
      ['circle', { cx: '12', cy: '13.5', r: '3.25' }]
    ];
    const PIP_ICON = [
      ['rect', { x: '3', y: '5', width: '18', height: '14', rx: '1.5' }],
      ['rect', { x: '12', y: '12', width: '6', height: '4', rx: '.5' }]
    ];
    const DOWNLOAD_ICON = [['path', { d: 'M12 3v12m0 0 4-4m-4 4-4-4M5 19h14' }]];

    function alignWithNative(button) {
      const native = document.querySelector('.ytp-settings-button')
        || document.querySelector('.ytp-fullscreen-button')
        || document.querySelector('.ytp-right-controls .ytp-button');
      if (!native || !button) return;
      const computed = getComputedStyle(native);
      const w = parseFloat(computed.width);
      const h = parseFloat(computed.height);
      button.style.width = w >= 28 ? computed.width : '40px';
      button.style.height = h >= 28 ? computed.height : '40px';
      button.style.padding = '8px';
      button.style.margin = '0';
      button.style.display = 'inline-flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.borderRadius = '50%';
      button.style.boxSizing = 'border-box';
    }

    function getInsertAnchor(controls) {
      return (
        controls.querySelector('.ytp-subtitles-button') ||
        controls.querySelector('.ytp-settings-button') ||
        controls.querySelector('.ytp-fullscreen-button') ||
        null
      );
    }

    function insertBeforeSettings(controls, button) {
      const anchor = getInsertAnchor(controls);
      if (anchor) anchor.insertAdjacentElement('beforebegin', button);
      else controls.prepend(button);
    }

    YT.screenshot = {
      initScreenshot(player) {
        const controls = player?.querySelector('.ytp-right-controls');
        if (!controls || controls.querySelector('[data-yt-supertool="screenshot"]')) return;
        YT.injectStyles?.();
        const button = document.createElement('button');
        button.className = 'ytp-button yt-supertool-control';
        button.dataset.ytSupertool = 'screenshot';
        button.title = 'Take screenshot';
        button.setAttribute('aria-label', 'Take screenshot');
        button.append(YT.createSvgIcon(CAMERA_ICON));
        button.onclick = () => {
          const video = player.querySelector('video');
          if (!video || !video.videoWidth) return;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          try {
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const link = document.createElement('a');
            link.download = `youtube-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            YT.showToast('📸 Đã chụp màn hình');
          } catch (error) {
            console.warn('YT SuperTool screenshot blocked by CORS:', error);
          }
        };
        alignWithNative(button);
        insertBeforeSettings(controls, button);
      },
      stopScreenshot() {
        document.querySelectorAll('[data-yt-supertool="screenshot"]').forEach(b => b.remove());
      }
    };

    let pipCleanup = null;
    YT.pip = {
      initPiP(player) {
        const controls = player?.querySelector('.ytp-right-controls');
        if (!controls || controls.querySelector('[data-yt-supertool="pip"]')) return;
        pipCleanup?.();
        YT.injectStyles?.();
        const button = document.createElement('button');
        button.className = 'ytp-button yt-supertool-control';
        button.dataset.ytSupertool = 'pip';
        button.title = 'Picture in Picture';
        button.setAttribute('aria-label', 'Picture in Picture');
        button.append(YT.createSvgIcon(PIP_ICON));
        button.onclick = async () => {
          const video = player.querySelector('video');
          if (!video || !document.pictureInPictureEnabled) return;
          try {
            document.pictureInPictureElement
              ? await document.exitPictureInPicture()
              : await video.requestPictureInPicture();
          } catch (error) {
            console.warn('YT SuperTool PiP:', error);
          }
        };
        const onEnter = () => button.classList.add('is-active');
        const onLeave = () => button.classList.remove('is-active');
        document.addEventListener('enterpictureinpicture', onEnter);
        document.addEventListener('leavepictureinpicture', onLeave);
        alignWithNative(button);
        insertBeforeSettings(controls, button);
        pipCleanup = () => {
          document.removeEventListener('enterpictureinpicture', onEnter);
          document.removeEventListener('leavepictureinpicture', onLeave);
          button.remove();
          pipCleanup = null;
        };
      },
      stopPiP() { pipCleanup?.(); }
    };

    YT.downloader = {
      initDownloader(player) {
        const controls = player?.querySelector('.ytp-right-controls');
        if (!controls || controls.querySelector('[data-yt-supertool="download"]')) return;
        YT.injectStyles?.();
        const button = document.createElement('button');
        button.className = 'ytp-button yt-supertool-control';
        button.dataset.ytSupertool = 'download';
        button.title = 'Download video';
        button.setAttribute('aria-label', 'Download video');
        button.append(YT.createSvgIcon(DOWNLOAD_ICON));
        button.onclick = () => YT.api.openDownloadTab(location.href);
        alignWithNative(button);
        insertBeforeSettings(controls, button);
      },
      stopDownloader() {
        document.querySelectorAll('[data-yt-supertool="download"]').forEach(b => b.remove());
      }
    };
  })();

  (function () {
    const defaults = SETTING_DEFAULTS;
    let settings = { ...defaults };
    Object.keys(defaults).forEach(k => { settings[k] = Boolean(store.get(k, defaults[k])); });

    let refreshTimer = 0;
    let playerRetryTimer = 0;
    let playerRetryCount = 0;
    const PLAYER_RETRY_MAX = 20;

    const methodName = (prefix, key) => `${prefix}${key[0].toUpperCase()}${key.slice(1)}`;

    const initPlayerFeaturesWithRetry = () => {
      const player = document.querySelector('.html5-video-player');
      if (!player) {
        if (playerRetryCount < PLAYER_RETRY_MAX) {
          clearTimeout(playerRetryTimer);
          playerRetryCount++;
          playerRetryTimer = setTimeout(initPlayerFeaturesWithRetry, 500);
        }
        return;
      }
      clearTimeout(playerRetryTimer);
      playerRetryCount = 0;
      if (settings.pip) YT.pip.initPiP(player); else YT.pip.stopPiP();
      if (settings.screenshot) YT.screenshot.initScreenshot(player); else YT.screenshot.stopScreenshot();
      if (settings.downloader) YT.downloader.initDownloader(player); else YT.downloader.stopDownloader();
      if (settings.speed) YT.speed.initSpeed(player); else YT.speed.stopSpeed();
    };

    const apply = () => {
      try {
        ['dislike', 'noShorts', 'cleanHomepage', 'nonstop'].forEach(key => {
          const mod = YT[key];
          if (!mod) return;
          if (settings[key]) mod[methodName('init', key)]?.();
          else mod[methodName('stop', key)]?.();
        });
        if (settings.sponsorblock) YT.sponsorblock?.initSponsorBlock?.();
        else YT.sponsorblock?.stopSponsorBlock?.();
        initPlayerFeaturesWithRetry();
      } catch (error) {
        console.warn('YT SuperTool apply:', error);
      }
    };

    const scheduleApply = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(apply, 200);
    };

    const handleMutations = mutations => {
      if (settings.nonstop) YT.nonstop.updateNonstop(mutations);
      if (document.hidden) return;

      if (settings.dislike) YT.dislike.updateDislike(mutations);
      if (settings.noShorts) YT.noShorts.updateNoShorts(mutations);
      if (settings.cleanHomepage) YT.cleanHomepage.updateCleanHomepage(mutations);

      const playerRelated = mutations.some(m => {
        if (m.target?.closest?.('.html5-video-player')) return true;
        return [...m.addedNodes].some(n =>
          n.nodeType === Node.ELEMENT_NODE &&
          (n.matches?.('.html5-video-player, #movie_player, .ytp-right-controls') ||
           n.querySelector?.('.html5-video-player, .ytp-right-controls'))
        );
      });
      if (playerRelated) initPlayerFeaturesWithRetry();
    };

    const observer = new YT.ObserverManager(document.documentElement || document, 300).add(handleMutations).start();
    apply();

    Object.keys(defaults).forEach(key => {
      GM_addValueChangeListener(key, (_name, _old, value) => {
        const next = Boolean(value);
        if (settings[key] === next) return;
        settings[key] = next;
        registerMenu();
        scheduleApply();
      });
    });

    let menuIds = [];
    function registerMenu() {
      if (typeof GM_unregisterMenuCommand === 'function') {
        menuIds.forEach(id => { try { GM_unregisterMenuCommand(id); } catch {} });
      }
      menuIds = Object.keys(SETTING_LABELS).map(key =>
        GM_registerMenuCommand(`${settings[key] ? '✅' : '❌'} ${SETTING_LABELS[key]}`, () => {
          settings[key] = !settings[key];
          store.set(key, settings[key]);
          registerMenu();
          scheduleApply();
        })
      );
      try {
        menuIds.push(GM_registerMenuCommand('⚙️ SponsorBlock: chọn danh mục', () => {
          YT.sponsorblock.openSettings();
        }));
      } catch {}
    }
    registerMenu();

    document.addEventListener('yt-navigate-finish', () => {
      playerRetryCount = 0;
      clearTimeout(playerRetryTimer);
      setTimeout(() => YT.cleanHomepage.initCleanHomepage(), 500);
      scheduleApply();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) scheduleApply();
    }, { passive: true });
  })();

})();