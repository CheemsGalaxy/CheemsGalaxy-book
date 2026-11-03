// ==UserScript==
// @name              Script Finder+ | Modified by: CheemsGalaxy
// @description       Script Finder allows you to find userscripts from Greasy Fork / SleazyFork on any website.
// @namespace         https://github.com/CheemsGalaxy
// @version           2026.10.27.5
// @author            Original: shiquda & 人民的勤务员 <china.qinwuyuan@gmail.com> | Modified by: CheemsGalaxy
// @supportURL        https://github.com/CheemsGalaxy/Script-Finder-Modified-by-CheemsGalaxy/issues
// @homepageURL       https://github.com/CheemsGalaxy/Script-Finder-Modified-by-CheemsGalaxy
// @match             *://*/*
// @noframes
// @connect           greasyfork.org
// @connect           sleazyfork.org
// @connect           api.greasyfork.org
// @connect           api.sleazyfork.org
// @connect           raw.githubusercontent.com
// @connect           cdn.jsdelivr.net
// @grant             GM_xmlhttpRequest
// @grant             GM_getValue
// @grant             GM_setValue
// @grant             GM_registerMenuCommand
// @grant             GM_openInTab
// @run-at            document-idle
// @license           MIT
// @downloadURL https://update.greasyfork.org/scripts/600159/Script%20Finder%2B%20%7C%20Modified%20by%3A%20CheemsGalaxy.user.js
// @updateURL https://update.greasyfork.org/scripts/600159/Script%20Finder%2B%20%7C%20Modified%20by%3A%20CheemsGalaxy.meta.js
// ==/UserScript==
(function () {
  "use strict";
  try {
    if (window.self !== window.top) return;
    if (window.__scriptFinderPlus) return;
    window.__scriptFinderPlus = true;
  } catch (e) {
    return;
  }
  const translations = {
    "en,en-GB": {
      Author: "Author",
      Installs: "Installs",
      DailyInstalls: "Daily Installs",
      Created: "Created",
      Updated: "Updated",
      Rating: "Rating",
      LoadingScripts: "Loading scripts...",
      LoadMore: "Load more",
      Retry: "Retry",
      AllScriptsLoaded: "All scripts loaded",
      SearchPlaceholder: "Search scripts...",
      ViewOnGreasyfork: "View on Greasyfork",
      errorMessage:
        "Failed to retrieve script information or there are no available scripts for this domain.",
      NoScripts: "No scripts found for this domain.",
      LoadFailed: "Failed to load scripts",
      TTBlocked:
        "This page blocks safe HTML parsing. Please try again later.",
      Loading: "Loading...",
      Scripts: "Scripts",
      Install: "Install",
      Close: "Close",
      MenuToggle: "Open/Close",
      MenuResetPos: "Reset tab position",
      RateLimited: "Too many requests: the server is limiting us. Retry in {n}s.",
      RateLimitedDone: "You can retry now.",
      SortDaily: "Daily installs",
      SortUpdated: "Recently updated",
      SortTotal: "Total installs",
      SortRating: "Top rated",
      UpdateAvailable: "A new version is available: {v}",
      UpdateNow: "Update now",
      SkipVersion: "Skip this version",
      ClearCache: "Clear cache",
      Feedback: "Feedback",
    },
    "zh-CN,zh,zh-SG": {
      Author: "作者",
      Installs: "安装数量",
      DailyInstalls: "每日安装",
      Created: "创建日期",
      Updated: "更新时间",
      Rating: "评分",
      LoadingScripts: "正在加载脚本...",
      LoadMore: "加载更多",
      Retry: "重试",
      AllScriptsLoaded: "所有脚本已加载",
      SearchPlaceholder: "搜索脚本...",
      ViewOnGreasyfork: "在Greasyfork查看",
      errorMessage: "无法检索脚本信息或该域没有可用的脚本。",
      NoScripts: "该域名下没有找到脚本。",
      LoadFailed: "加载脚本失败",
      TTBlocked: "此页面阻止了安全的 HTML 解析，请稍后再试。",
      Loading: "载入中...",
      Scripts: "脚本",
      Install: "安装",
      Close: "关闭",
      MenuToggle: "打开/关闭",
      MenuResetPos: "重置标签位置",
      RateLimited: "请求过多，服务器正在限流。{n} 秒后可重试。",
      RateLimitedDone: "现在可以重试了。",
      SortDaily: "每日安装",
      SortUpdated: "最近更新",
      SortTotal: "总安装量",
      SortRating: "评分最高",
      UpdateAvailable: "有新版本可用：{v}",
      UpdateNow: "立即更新",
      SkipVersion: "跳过此版本",
      ClearCache: "清除缓存",
      Feedback: "反馈",
    },
    "zh-TW,zh-HK,zh-MO": {
      Author: "作者",
      Installs: "安裝數量",
      DailyInstalls: "每日安裝",
      Created: "創建日期",
      Updated: "更新日期",
      Rating: "評分",
      LoadingScripts: "正在載入腳本...",
      LoadMore: "載入更多",
      Retry: "重試",
      AllScriptsLoaded: "所有腳本已載入",
      SearchPlaceholder: "搜尋腳本...",
      ViewOnGreasyfork: "在Greasyfork查看",
      errorMessage: "無法檢索腳本信息或該域沒有可用的腳本。",
      NoScripts: "此網域下沒有找到腳本。",
      LoadFailed: "載入腳本失敗",
      TTBlocked: "此頁面阻擋了安全的 HTML 解析，請稍後再試。",
      Loading: "載入中...",
      Scripts: "腳本",
      Install: "安裝",
      Close: "關閉",
      MenuToggle: "開啟/關閉",
      MenuResetPos: "重設標籤位置",
      RateLimited: "請求過多，伺服器正在限流。{n} 秒後可重試。",
      RateLimitedDone: "現在可以重試了。",
      SortDaily: "每日安裝",
      SortUpdated: "最近更新",
      SortTotal: "總安裝量",
      SortRating: "評分最高",
      UpdateAvailable: "有新版本可用：{v}",
      UpdateNow: "立即更新",
      SkipVersion: "略過此版本",
      ClearCache: "清除快取",
      Feedback: "回饋",
    },
    ja: {
      Author: "著者",
      Installs: "インストール数",
      DailyInstalls: "日次インストール数",
      Created: "作成日",
      Updated: "更新日",
      Rating: "評価",
      LoadingScripts: "スクリプトを読み込んでいます...",
      LoadMore: "もっと読む",
      Retry: "再試行",
      AllScriptsLoaded: "すべてのスクリプトが読み込まれました",
      SearchPlaceholder: "スクリプトを検索...",
      ViewOnGreasyfork: "Greasyforkで見る",
      errorMessage:
        "スクリプト情報の取得に失敗するか、またはこのドメインには利用可能なスクリプトがありません。",
      NoScripts: "このドメインのスクリプトは見つかりませんでした。",
      LoadFailed: "スクリプトの読み込みに失敗しました",
      TTBlocked:
        "このページは安全な HTML 解析をブロックしています。後でもう一度お試しください。",
      Loading: "読み込み中...",
      Scripts: "スクリプト",
      Install: "インストール",
      Close: "閉じる",
      MenuToggle: "開く/閉じる",
      MenuResetPos: "タブ位置をリセット",
      RateLimited: "リクエストが多すぎます。サーバーが制限中です。{n}秒後に再試行できます。",
      RateLimitedDone: "再試行できます。",
      SortDaily: "日次インストール",
      SortUpdated: "最近更新",
      SortTotal: "総インストール",
      SortRating: "高評価",
      UpdateAvailable: "新しいバージョンがあります：{v}",
      UpdateNow: "今すぐ更新",
      SkipVersion: "このバージョンをスキップ",
      ClearCache: "キャッシュをクリア",
      Feedback: "フィードバック",
    },
    vi: {
      Author: "Tác giả",
      Installs: "Số lượt cài đặt",
      DailyInstalls: "Cài đặt hàng ngày",
      Created: "Ngày tạo",
      Updated: "Ngày cập nhật",
      Rating: "Đánh giá",
      LoadingScripts: "Đang tải các tập lệnh...",
      LoadMore: "Tải thêm",
      Retry: "Thử lại",
      AllScriptsLoaded: "Đã tải tất cả các tập lệnh",
      SearchPlaceholder: "Tìm kiếm tập lệnh...",
      ViewOnGreasyfork: "Xem trên Greasyfork",
      errorMessage:
        "Không thể truy xuất thông tin tập lệnh hoặc không có tập lệnh nào có sẵn cho miền này.",
      NoScripts: "Không tìm thấy tập lệnh nào cho miền này.",
      LoadFailed: "Không tải được tập lệnh",
      TTBlocked:
        "Trang này chặn phân tích HTML an toàn, vui lòng thử lại sau.",
      Loading: "Đang tải...",
      Scripts: "Tập lệnh",
      Install: "Cài đặt",
      Close: "Đóng",
      MenuToggle: "Mở/Đóng",
      MenuResetPos: "Xoá cache vị trí tab",
      RateLimited: "Máy chủ đang giới hạn tốc độ. Thử lại sau {n} giây.",
      RateLimitedDone: "Bạn có thể thử lại ngay.",
      SortDaily: "Cài đặt hàng ngày",
      SortUpdated: "Mới cập nhật",
      SortTotal: "Tổng lượt cài",
      SortRating: "Đánh giá cao",
      UpdateAvailable: "Đã có bản cập nhật mới: {v}",
      UpdateNow: "Cập nhật ngay",
      SkipVersion: "Bỏ qua bản này",
      ClearCache: "Xoá cache",
      Feedback: "Phản hồi",
    },
  };
  const FALLBACK = translations["en,en-GB"];
  function getTranslations(lang) {
    const norm = String(lang || "en").toLowerCase();
    const base = norm.split("-")[0];
    let baseMatch = null;
    for (const key in translations) {
      const codes = key.toLowerCase().split(",");
      if (codes.includes(norm)) return translations[key];
      if (!baseMatch && codes.includes(base)) baseMatch = translations[key];
    }
    return baseMatch || FALLBACK;
  }
  function bootstrap() {
    try {
      init();
    } catch (e) {
      console.error("[Script Finder+] init error", e);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    setTimeout(bootstrap, 0);
  }
  function init() {
    const userLang =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      "en";
    const strings = getTranslations(userLang);
    const t = (key) => strings[key] ?? FALLBACK[key] ?? key;
    const SECOND_LEVEL_SUFFIXES = new Set([
      "co.uk", "org.uk", "com.au", "co.jp", "co.kr", "com.br", "com.vn",
      "com.cn", "com.tw", "com.hk", "com.sg", "com.my", "com.ph", "com.id",
      "com.th", "com.tr", "com.ru", "com.ua", "com.pl", "com.de", "com.fr",
      "com.es", "com.it", "com.nl", "com.be", "com.ch", "com.at", "com.se",
      "com.no", "com.dk", "com.fi", "com.ie", "com.pt", "com.gr", "com.cz",
      "com.hu", "com.ro", "com.bg", "com.hr", "com.rs", "com.sk", "com.si",
      "com.lt", "com.lv", "com.ee",
      "co.nz", "co.za", "com.ar", "com.mx", "com.co", "com.pe",
    ]);
    function getSiteDomain(hostname) {
      const host = String(hostname || "").toLowerCase().replace(/\.$/, "");
      if (!host) return hostname;
      if (/^[\d.]+$/.test(host) || host.includes(":")) return hostname;
      const parts = host.split(".");
      if (parts.length <= 2) return host;
      const three = parts.slice(-3).join(".");
      if (SECOND_LEVEL_SUFFIXES.has(three)) return three;
      const two = parts.slice(-2).join(".");
      if (SECOND_LEVEL_SUFFIXES.has(two)) return parts.slice(-3).join(".");
      return two;
    }
    const domain = getSiteDomain(window.location.hostname || "");
    if (!domain) return;
    const store = {
      get(k, d) {
        try {
          return typeof GM_getValue === "function" ? GM_getValue(k, d) : d;
        } catch (e) {
          return d;
        }
      },
      set(k, v) {
        try {
          if (typeof GM_setValue === "function") GM_setValue(k, v);
        } catch (e) {}
      },
    };
    const SERVICES = {
      greasyfork: { name: "Greasyfork", base: "https://greasyfork.org", api: "https://api.greasyfork.org" },
      sleazyfork: { name: "SleazyFork", base: "https://sleazyfork.org", api: "https://api.sleazyfork.org" },
    };
    let serviceKey = store.get("sf_service", "greasyfork");
    if (!SERVICES[serviceKey]) serviceKey = "greasyfork";
    const svc = () => SERVICES[serviceKey];
    const PAGE_SIZE = 100;
    let nf = null;
    try {
      nf = new Intl.NumberFormat();
    } catch (e) {
      nf = null;
    }
    const fmtNum = (v) => {
      if (v === null || v === undefined || v === "") return "–";
      const n = Number(v);
      if (!Number.isFinite(n)) return "–";
      return nf ? nf.format(n) : n.toLocaleString();
    };
    const fmtDate = (v) => {
      if (!v) return "–";
      const s = String(v).slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "–";
    };
    const fmtRating = (v) => {
      if (v === null || v === undefined || v === "") return "–";
      const n = Number(v);
      return Number.isFinite(n) ? String(Math.round(n * 10) / 10) : "–";
    };
    const HOST_OK = /(^|\.)(greasyfork|sleazyfork)\.org$/i;
    function safeUrl(u, fallback) {
      try {
        const x = new URL(String(u), svc().base);
        if (x.protocol === "https:" && HOST_OK.test(x.hostname)) return x.href;
      } catch (e) {}
      return fallback;
    }
    const isId = (v) => /^\d+$/.test(String(v));
    let ttPolicy = null;
    try {
      if (window.trustedTypes && window.trustedTypes.createPolicy) {
        ttPolicy = window.trustedTypes.createPolicy("sf-policy", {
          createHTML: (s) => s,
        });
      }
    } catch (e) {
      ttPolicy = null;
    }
    const toTrustedHTML = (s) => (ttPolicy ? ttPolicy.createHTML(s) : s);
    let page = 0;
    let hasMore = true;
    let loading = false;
    let isOpen = false;
    let gen = 0;
    const seen = new Set();
    let queryTerm = "";
    let pendingReplace = false;
    let requeryOnRetry = false;
    let pendingUpdate = "";
    let updateChecked = false;
    let filterRaf = 0;
    const SORTS = [
      ["", "SortDaily"],
      ["updated", "SortUpdated"],
      ["total_installs", "SortTotal"],
      ["ratings", "SortRating"],
    ];
    let sortKey = String(store.get("sf_sort", ""));
    if (!SORTS.some(([k]) => k === sortKey)) sortKey = "";
    const CACHE_TTL = 5 * 60 * 1000;
    const cache = new Map();
    const CDN_URL =
      "https://raw.githubusercontent.com/CheemsGalaxy/Script-Finder-Modified-by-CheemsGalaxy/main/Script_Finder_Modified_by_CheemsGalaxy.user.js";
    const CDN_FALLBACK =
      "https://cdn.jsdelivr.net/gh/CheemsGalaxy/Script-Finder-Modified-by-CheemsGalaxy@main/Script_Finder_Modified_by_CheemsGalaxy.user.js";
    const ISSUES_URL =
      "https://github.com/CheemsGalaxy/Script-Finder-Modified-by-CheemsGalaxy/issues";
    const INSTALLED_VERSION =
      (typeof GM_info !== "undefined" &&
        GM_info.script &&
        GM_info.script.version) ||
      "2026.10.27.5";
    const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
    const STORE_UPDATE_CHECKED = "sf_update_checked";
    const STORE_UPDATE_SKIP = "sf_update_skip";
    let lastReq = 0;
    let cooldownUntil = 0;
    let cdTimer = 0;
    let topPct = Number(store.get("sf_top", 70)) || 70;
    const CSS = `
    :host {
        all: initial;
        color-scheme: light dark;
        --bg: #ffffff; --fg: #0a0a0a; --muted: #6b6b6b; --border: #e5e5e5;
        --card: #fafafa; --hover: #f4f4f5; --accent: #2563eb; --accent-fg: #ffffff;
        --primary: #18181b; --primary-fg: #fafafa; --ok: #15803d; --ok-fg: #ffffff;
        --ring: rgba(37, 99, 235, .35); --scrim: rgba(10, 10, 10, .35);
        --shadow: 0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.12), 0 24px 64px rgba(0,0,0,.14);
        --chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        --tab-h: 42px;
        --sp-1: 2px; --sp-2: 4px; --sp-3: 6px; --sp-4: 8px; --sp-5: 10px;
        --sp-6: 12px; --sp-7: 14px; --sp-8: 16px; --sp-9: 24px;
        --fs-1: 11px; --fs-2: 12px; --fs-3: 12.5px; --fs-4: 13px;
        --fs-5: 14px; --fs-6: 15px; --fs-7: 16px;
        --r-1: 6px; --r-2: 8px; --r-3: 10px; --r-4: 12px; --r-5: 14px; --r-pill: 999px;
        --dur-0: .1s; --dur-1: .15s; --dur-2: .2s; --dur-3: .28s;
        --ease-out: cubic-bezier(.2,.8,.2,1);
        --radius: var(--r-5);
    }
    @media (prefers-color-scheme: dark) {
        :host {
            --bg: #09090b; --fg: #fafafa; --muted: #a1a1aa; --border: #27272a;
            --card: #111113; --hover: #18181b; --accent: #60a5fa; --accent-fg: #0a0a0a;
            --primary: #fafafa; --primary-fg: #18181b; --ok: #16a34a; --ok-fg: #052e16;
            --ring: rgba(96, 165, 250, .4); --scrim: rgba(0, 0, 0, .55);
            --shadow: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.5), 0 24px 64px rgba(0,0,0,.5);
        }
    }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }
    .stack { display: flex; flex-direction: column; gap: var(--stack-gap, var(--sp-5)); }
    .cluster { display: flex; flex-wrap: wrap; align-items: center; gap: var(--cluster-gap, var(--sp-4)); }
    .tab, .panel, .scrim { font: var(--fs-5)/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
    button, input, select { font: inherit; color: inherit; }
    .tab {
        position: fixed; right: 0; top: 70%;
        transform: translate(calc(100% - 34px), -50%);
        display: flex; align-items: center; gap: var(--sp-4);
        height: var(--tab-h); padding: 0 var(--sp-7) 0 var(--sp-4); margin: 0;
        border: 1px solid var(--border); border-right: 0;
        border-radius: calc(var(--tab-h) / 2) 0 0 calc(var(--tab-h) / 2);
        background: color-mix(in srgb, var(--bg) 82%, transparent);
        -webkit-backdrop-filter: saturate(180%) blur(14px); backdrop-filter: saturate(180%) blur(14px);
        color: var(--fg); font-weight: 600; font-size: var(--fs-4); white-space: nowrap; cursor: pointer;
        opacity: .85; box-shadow: var(--shadow);
        transition: transform var(--dur-3) var(--ease-out), opacity var(--dur-2) ease;
        touch-action: none; user-select: none; -webkit-user-select: none;
        z-index: 2147483646;
    }
    .tab svg { flex: none; margin-left: var(--sp-2); color: var(--accent); }
    .tab:hover, .tab:focus-visible, .tab.dragging, .tab[aria-expanded="true"] { transform: translate(0, -50%); opacity: 1; }
    .tab:focus-visible { outline: 2px solid var(--accent); outline-offset: -3px; }
    .tab.dragging { cursor: grabbing; transition: opacity var(--dur-2) ease; }
    .badge {
        min-width: 22px; height: 20px; padding: 0 var(--sp-3); border-radius: var(--r-pill);
        background: var(--accent); color: var(--accent-fg);
        font-size: var(--fs-1); font-weight: 700; line-height: 20px; text-align: center;
    }
    .scrim {
        position: fixed; inset: 0; background: var(--scrim);
        -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
        opacity: 0; visibility: hidden; pointer-events: none;
        transition: opacity var(--dur-2) ease, visibility var(--dur-2);
        z-index: 2147483646;
    }
    .scrim.open { opacity: 1; visibility: visible; pointer-events: auto; }
    .panel {
        position: fixed; top: 50%; left: 50%;
        width: min(700px, calc(100vw - var(--sp-9))); max-height: min(78vh, 760px);
        display: flex; flex-direction: column; overflow: hidden;
        background: var(--bg); color: var(--fg);
        border: 1px solid var(--border); border-radius: var(--radius);
        box-shadow: var(--shadow);
        opacity: 0; visibility: hidden; pointer-events: none;
        transform: translate(-50%, -47%) scale(.97);
        transition: opacity var(--dur-2) ease, transform var(--dur-3) var(--ease-out), visibility var(--dur-2);
        z-index: 2147483647; outline: none;
    }
    .panel.open { opacity: 1; visibility: visible; pointer-events: auto; transform: translate(-50%, -50%) scale(1); }
    header.stack { --stack-gap: var(--sp-6); padding: var(--sp-8) var(--sp-8) var(--sp-6); border-bottom: 1px solid var(--border); }
    .title-row { display: flex; align-items: center; gap: var(--sp-4); min-width: 0; }
    h2 { margin: 0; font-size: var(--fs-7); font-weight: 650; letter-spacing: -.01em; }
    .count { background: var(--hover); color: var(--fg); border: 1px solid var(--border); border-radius: var(--r-pill); padding: 1px var(--sp-4); font-size: var(--fs-2); font-weight: 600; }
    .domain { color: var(--muted); font-size: var(--fs-2); background: var(--card); border: 1px solid var(--border); border-radius: var(--r-1); padding: 1px var(--sp-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .close {
        margin-left: auto; display: grid; place-items: center; width: 30px; height: 30px;
        border: 0; background: transparent; color: var(--muted); font-size: var(--fs-6); line-height: 1;
        border-radius: var(--r-2); cursor: pointer; transition: background var(--dur-1), color var(--dur-1);
    }
    .close:hover { background: var(--hover); color: var(--fg); }
    .banner { display: flex; align-items: center; gap: var(--sp-5); padding: var(--sp-5) var(--sp-8); border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--accent) 10%, var(--bg)); }
    .banner-text { flex: 1; min-width: 0; font-size: var(--fs-3); font-weight: 600; overflow-wrap: anywhere; }
    .banner-actions.cluster { --cluster-gap: var(--sp-3); flex: 0 0 auto; }
    .banner .btn { padding: var(--sp-3) var(--sp-5); font-size: var(--fs-2); }
    .toolbar.cluster { --cluster-gap: var(--sp-4); }
    .seg { display: inline-flex; align-items: center; padding: var(--sp-1); gap: var(--sp-1); background: var(--hover); border: 1px solid var(--border); border-radius: var(--r-3); }
    .seg-btn { border: 0; background: transparent; color: var(--muted); padding: var(--sp-2) var(--sp-6); border-radius: var(--r-1); font-size: var(--fs-3); font-weight: 600; cursor: pointer; transition: background var(--dur-1), color var(--dur-1), box-shadow var(--dur-1); }
    .seg-btn:hover { color: var(--fg); }
    .seg-btn[aria-pressed="true"] { background: var(--bg); color: var(--fg); box-shadow: 0 1px 2px rgba(0,0,0,.12), 0 0 0 1px var(--border); }
    .gf { margin-left: auto; }
    .btn {
        display: inline-flex; align-items: center; justify-content: center; gap: var(--sp-3);
        border: 1px solid transparent; border-radius: var(--r-3); padding: var(--sp-3) var(--sp-7);
        background: var(--primary); color: var(--primary-fg); font-size: var(--fs-4); font-weight: 600; cursor: pointer;
        transition: opacity var(--dur-1), background var(--dur-1), transform var(--dur-0);
    }
    .toolbar .btn, .toolbar .sel, .seg { min-height: 34px; }
    .btn:hover { opacity: .88; }
    .btn:active { transform: scale(.98); }
    .btn.ghost { background: transparent; color: var(--fg); border-color: var(--border); }
    .btn.ghost:hover { background: var(--hover); opacity: 1; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn:focus-visible, .seg-btn:focus-visible, .close:focus-visible, .install:focus-visible, .name:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .search {
        width: 100%; padding: var(--sp-5) var(--sp-6) var(--sp-5) 36px; font: inherit; color: var(--fg);
        background: var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M21 21l-4.3-4.3'/%3E%3C/svg%3E") no-repeat var(--sp-6) center;
        border: 1px solid var(--border); border-radius: var(--r-3); outline: none;
        transition: border-color var(--dur-1), box-shadow var(--dur-1);
    }
    .search::placeholder { color: var(--muted); }
    .search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
    .sel {
        font: inherit; font-size: var(--fs-3); font-weight: 600; color: var(--fg);
        appearance: none; -webkit-appearance: none;
        background-color: var(--bg);
        background-image: var(--chevron);
        background-position: right var(--sp-5) center;
        background-size: 14px 14px;
        background-repeat: no-repeat;
        border: 1px solid var(--border); border-radius: var(--r-3);
        padding: var(--sp-3) 30px var(--sp-3) var(--sp-5);
        max-width: 170px; cursor: pointer; text-overflow: ellipsis;
        transition: border-color var(--dur-1), box-shadow var(--dur-1), background-color var(--dur-1);
    }
    .sel:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); background-color: color-mix(in srgb, var(--accent) 5%, var(--bg)); }
    .sel:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }
    .sel:disabled { opacity: .5; cursor: not-allowed; }
    .sel option { background: var(--bg); color: var(--fg); }
    .list.stack { --stack-gap: var(--sp-5); list-style: none; margin: 0; padding: var(--sp-7) var(--sp-8); overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
    .list:empty { display: none; }
    .item { border: 1px solid var(--border); background: var(--card); border-radius: var(--r-4); padding: var(--sp-6) var(--sp-7); transition: border-color var(--dur-1), box-shadow var(--dur-1), background var(--dur-1); }
    .item:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); background: var(--bg); box-shadow: 0 2px 10px rgba(0,0,0,.06); }
    .name { font-size: var(--fs-6); font-weight: 650; color: var(--fg); text-decoration: none; letter-spacing: -.01em; }
    .name:hover { color: var(--accent); }
    .desc { margin: var(--sp-2) 0 var(--sp-5); color: var(--muted); font-size: var(--fs-4); overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .meta.cluster { --cluster-gap: var(--sp-3); margin-bottom: var(--sp-6); }
    .meta div { display: inline-flex; align-items: baseline; gap: var(--sp-3); border: 1px solid var(--border); border-radius: var(--r-pill); padding: var(--sp-1) var(--sp-5); background: var(--bg); }
    .meta small { color: var(--muted); font-size: var(--fs-1); }
    .meta b { font-size: var(--fs-2); font-weight: 600; overflow-wrap: anywhere; }
    .install { display: inline-flex; align-items: center; background: var(--ok); color: var(--ok-fg); padding: var(--sp-3) var(--sp-7); border-radius: var(--r-3); text-decoration: none; font-size: var(--fs-4); font-weight: 600; transition: filter var(--dur-1), transform var(--dur-0); }
    .install:hover { filter: brightness(1.08); }
    .install:active { transform: scale(.98); }
    .skeletons.stack { --stack-gap: var(--sp-5); padding: var(--sp-7) var(--sp-8); }
    .sk { height: 92px; border-radius: var(--r-4); background: linear-gradient(90deg, var(--card) 25%, var(--hover) 50%, var(--card) 75%); background-size: 200% 100%; border: 1px solid var(--border); animation: shimmer 1.3s linear infinite; }
    @keyframes shimmer { to { background-position: -200% 0; } }
    footer.stack { --stack-gap: var(--sp-4); align-items: center; padding: var(--sp-6) var(--sp-8); border-top: 1px solid var(--border); }
    .status { margin: 0; color: var(--muted); font-size: var(--fs-4); text-align: center; overflow-wrap: anywhere; }
    .status:empty { display: none; }
    .status.loading { animation: blink 1.2s ease-in-out infinite; }
    @keyframes blink { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }
    .feedback { color: var(--muted); font-size: var(--fs-2); text-decoration: none; }
    .feedback:hover, .feedback:focus-visible { color: var(--accent); text-decoration: underline; }
    @media (max-width: 600px) {
        .panel { top: auto; bottom: 0; left: 0; width: 100%; max-height: 88vh; border-radius: var(--r-5) var(--r-5) 0 0; transform: translateY(16px); }
        .panel.open { transform: none; }
        .gf { font-size: var(--fs-2); padding: var(--sp-3) var(--sp-5); margin-left: 0; flex: 1 1 100%; }
    }
    @media (prefers-reduced-motion: reduce) {
        .tab, .panel, .scrim, .item, .btn, .install, .sel { transition: none; }
        .status.loading, .sk { animation: none; }
    }
    `;
    const host = document.createElement("div");
    host.id = "sf-host";
    const shadow = host.attachShadow({ mode: "open" });
    const el = (tag, props = {}, ...kids) => {
      const n = document.createElement(tag);
      for (const [k, v] of Object.entries(props)) {
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else n.setAttribute(k, v);
      }
      n.append(...kids);
      return n;
    };
    const SVG_NS = "http://www.w3.org/2000/svg";
    const icon = document.createElementNS(SVG_NS, "svg");
    for (const [k, v] of Object.entries({
      viewBox: "0 0 24 24",
      width: "20",
      height: "20",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    }))
      icon.setAttribute(k, v);
    const iconPath = document.createElementNS(SVG_NS, "path");
    iconPath.setAttribute("d", "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16");
    icon.appendChild(iconPath);
    const styleEl = document.createElement("style");
    styleEl.textContent = CSS;
    const segBtns = {};
    const seg = el("div", { class: "seg", role: "group", "aria-label": "Service" });
    for (const [key, sv] of Object.entries(SERVICES)) {
      const bt = el("button", {
        type: "button",
        class: "seg-btn",
        "data-svc": key,
        text: sv.name,
      });
      segBtns[key] = bt;
      seg.appendChild(bt);
    }
    const syncSeg = () => {
      for (const k in segBtns)
        segBtns[k].setAttribute("aria-pressed", String(k === serviceKey));
    };
    syncSeg();
    const sortSel = el("select", { class: "sel", "aria-label": "Sort" });
    for (const [val, lbl] of SORTS) {
      const o = el("option", { value: val, text: t(lbl) });
      if (val === sortKey) o.selected = true;
      sortSel.appendChild(o);
    }
    shadow.append(
      styleEl,
      el("div", { class: "scrim" }),
      el(
        "button",
        {
          class: "tab",
          type: "button",
          "aria-haspopup": "dialog",
          "aria-expanded": "false",
        },
        icon,
        el("span", { class: "tab-label" }),
        el("span", { class: "badge", hidden: "" }),
      ),
      el(
        "section",
        {
          class: "panel",
          role: "dialog",
          "aria-label": "Script Finder",
          tabindex: "-1",
        },
        el(
          "header",
          { class: "stack" },
          el(
            "div",
            { class: "title-row" },
            el("h2", { text: "Script Finder" }),
            el("span", { class: "count", hidden: "" }),
            el("span", { class: "domain", text: domain, title: domain }),
            el("button", { class: "close", type: "button", text: "✕" }),
          ),
          el(
            "div",
            { class: "toolbar cluster" },
            seg,
            sortSel,
            el("button", { class: "btn ghost gf", type: "button" }),
          ),
          el("input", {
            class: "search",
            type: "search",
            autocomplete: "off",
            spellcheck: "false",
          }),
        ),
        el(
          "div",
          { class: "banner", hidden: "" },
          el("span", { class: "banner-text" }),
          el(
            "div",
            { class: "banner-actions cluster" },
            el("button", { class: "btn banner-update", type: "button" }),
            el("button", { class: "btn ghost banner-skip", type: "button" }),
          ),
        ),
        el("ul", { class: "list stack" }),
        el(
          "div",
          { class: "skeletons stack", hidden: "" },
          el("div", { class: "sk" }),
          el("div", { class: "sk" }),
          el("div", { class: "sk" }),
        ),
        el(
          "footer",
          { class: "stack" },
          el("p", { class: "status", role: "status", "aria-live": "polite" }),
          el("button", { class: "btn more", type: "button", hidden: "" }),
          el("a", {
            class: "feedback",
            href: ISSUES_URL,
            target: "_blank",
            rel: "noopener noreferrer",
          }),
        ),
      ),
    );
    const $ = (sel) => shadow.querySelector(sel);
    const tab = $(".tab"),
      badge = $(".badge"),
      panel = $(".panel");
    const count = $(".count"),
      gfBtn = $(".gf"),
      closeBtn = $(".close");
    const search = $(".search"),
      list = $(".list"),
      status = $(".status"),
      more = $(".more"),
      skel = $(".skeletons"),
      scrim = $(".scrim");
    const banner = $(".banner"),
      bannerText = $(".banner-text"),
      bannerUpdate = $(".banner-update"),
      bannerSkip = $(".banner-skip"),
      feedback = $(".feedback");
    const refreshLabels = () => {
      $(".tab-label").textContent = t("Scripts");
      tab.setAttribute("aria-label", "Script Finder – " + t("Scripts"));
      gfBtn.textContent = t("ViewOnGreasyfork").replace(
        "Greasyfork",
        svc().name,
      );
      closeBtn.setAttribute("aria-label", t("Close"));
      closeBtn.title = t("Close");
      search.placeholder = t("SearchPlaceholder");
      more.textContent = t("LoadMore");
      bannerUpdate.textContent = t("UpdateNow");
      bannerSkip.textContent = t("SkipVersion");
      feedback.textContent = t("Feedback");
      if (pendingUpdate)
        bannerText.textContent = t("UpdateAvailable").replace(
          "{v}",
          pendingUpdate,
        );
    };
    refreshLabels();
    function renderItem(s) {
      const base = svc().base;
      const li = document.createElement("li");
      li.className = "item";
      li._q = `${s.name} ${s.description} ${s.author}`.toLowerCase();
      const a = document.createElement("a");
      a.className = "name";
      a.textContent = s.name || "—";
      const href = safeUrl(s.url, `${base}/scripts/${s.id}`);
      if (href) {
        a.setAttribute("href", href);
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      const p = document.createElement("p");
      p.className = "desc";
      p.textContent = s.description;
      const meta = document.createElement("div");
      meta.className = "meta cluster";
      const rows = [
        [t("Author"), s.author || "–"],
        [t("Installs"), fmtNum(s.installs)],
        [t("DailyInstalls"), fmtNum(s.dailyInstalls)],
        [t("Created"), fmtDate(s.createDate)],
        [t("Updated"), fmtDate(s.updateDate)],
        [t("Rating"), fmtRating(s.ratingScore)],
      ];
      for (const [k, v] of rows) {
        const box = document.createElement("div");
        const small = document.createElement("small");
        small.textContent = k;
        const b = document.createElement("b");
        b.textContent = v;
        box.append(small, b);
        meta.appendChild(box);
      }
      const install = document.createElement("a");
      install.className = "install";
      install.textContent = `${t("Install")} ${s.version || ""}`.trim();
      const ih = safeUrl(
        `${base}/scripts/${s.id}/code/script.user.js`,
        "",
      );
      if (ih) install.setAttribute("href", ih);
      li.append(a, p, meta, install);
      return li;
    }
    function updateCounts() {
      const items = [...list.children];
      const total = items.length;
      const shown = items.filter((li) => !li.hidden).length;
      count.textContent = shown === total ? String(total) : `${shown}/${total}`;
      count.hidden = !total;
      badge.textContent = total + (hasMore ? "+" : "");
      badge.hidden = !total;
    }
    function applyFilter() {
      if (filterRaf) cancelAnimationFrame(filterRaf);
      filterRaf = requestAnimationFrame(() => {
        filterRaf = 0;
        const q = search.value.trim().toLowerCase();
        for (const li of list.children) li.hidden = !!q && !li._q.includes(q);
        updateCounts();
      });
    }
    function setStatus(text, isLoading = false) {
      status.textContent = text;
      status.classList.toggle("loading", !!isLoading);
    }
    function gmGet(url, headers) {
      return new Promise((resolve, reject) => {
        let done = false;
        const ok = (v) => {
          if (!done) {
            done = true;
            resolve(v);
          }
        };
        const ko = (kind) => {
          if (!done) {
            done = true;
            const e = new Error(kind);
            e.kind = kind;
            reject(e);
          }
        };
        if (typeof GM_xmlhttpRequest !== "function") return ko("no-gm-xhr");
        try {
          GM_xmlhttpRequest({
            method: "GET",
            url,
            headers: headers || {},
            timeout: 20000,
            onload: (r) =>
              ok({
                status: r.status,
                text: String(r.responseText || ""),
                headers: String(r.responseHeaders || ""),
              }),
            onerror: () => ko("network-error"),
            ontimeout: () => ko("timeout"),
            onabort: () => ko("aborted"),
          });
        } catch (e) {
          ko("exception");
        }
      });
    }
    function logHttp(label, url, r) {
      console.warn(
        `[Script Finder+] ${label} HTTP ${r.status}`,
        url,
        "\nheaders:",
        r.headers.slice(0, 400),
        "\nbody:",
        r.text.slice(0, 300),
      );
    }
    function extractList(text) {
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return null;
      }
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.execute)) return data.execute;
      if (data && Array.isArray(data.scripts)) return data.scripts;
      return null;
    }
    function mapJson(j) {
      const id = String(j && j.id);
      if (!isId(id)) return null;
      return {
        id,
        name: String(j.name || ""),
        author:
          (j.users && j.users[0] && j.users[0].name
            ? String(j.users[0].name)
            : "") || "–",
        description: String(j.description || ""),
        version: String(j.version || ""),
        url: j.url,
        createDate: j.created_at,
        updateDate: j.code_updated_at,
        installs: j.total_installs,
        dailyInstalls: j.daily_installs,
        ratingScore: j.fan_score,
      };
    }
    function relevantToDomain(j) {
      if (!Array.isArray(j.domains)) return true;
      return j.domains.some((x) => {
        const d = String(x).replace(/^\*\./, "").toLowerCase();
        return d === domain || d.endsWith("." + domain) || domain.endsWith("." + d);
      });
    }
    const HTML_LIST_SELECTORS = [
      "#browse-script-list li[data-script-id]",
      "ol#browse-script-list li[data-script-id]",
      ".script-list li[data-script-id]",
      "li[data-script-id]",
      "[data-script-id]",
    ];
    const ENTITIES = {
      amp: "&",
      quot: '"',
      apos: "'",
      lt: "<",
      gt: ">",
      nbsp: " ",
    };
    function decodeEntities(s) {
      return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
        if (code.charAt(0) === "#") {
          const hex = code.charAt(1).toLowerCase() === "x";
          const n = parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
          return Number.isFinite(n) ? String.fromCodePoint(n) : m;
        }
        const rep = ENTITIES[code.toLowerCase()];
        return rep === undefined ? m : rep;
      });
    }
    function parseHtmlListFallback(text) {
      console.warn(
        "[Script Finder+] Trusted Types policy rejected; using regex fallback",
      );
      const items = [];
      const seenIds = new Set();
      const tagRe = /<[^>]*\bdata-script-id\s*=\s*"(\d+)"[^>]*>/gi;
      let m;
      while ((m = tagRe.exec(text))) {
        const tag = m[0];
        const id = m[1];
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        const attr = (name) => {
          const r = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag);
          return r ? decodeEntities(r[1]) : "";
        };
        items.push({
          id,
          name: attr("data-script-name"),
          author: "–",
          description: "",
          version: attr("data-script-version"),
          url: `${svc().base}/scripts/${id}`,
          createDate: attr("data-script-created-date") || null,
          updateDate: attr("data-script-updated-date") || null,
          installs: attr("data-script-total-installs") || null,
          dailyInstalls: attr("data-script-daily-installs") || null,
          ratingScore: attr("data-script-rating-score") || null,
        });
      }
      return { items, hasMore: false };
    }
    function parseHtmlList(text) {
      let doc = null;
      try {
        doc = new DOMParser().parseFromString(toTrustedHTML(text), "text/html");
      } catch (e) {
        const fallback = parseHtmlListFallback(text);
        if (fallback.items.length) return fallback;
        const err = new Error("trusted-types");
        err.tt = true;
        throw err;
      }
      let nodes = null;
      for (const sel of HTML_LIST_SELECTORS) {
        const found = doc.querySelectorAll(sel);
        if (found.length) {
          nodes = found;
          break;
        }
      }
      if (!nodes) {
        const probe =
          (doc.title || "") +
          " " +
          (doc.body ? doc.body.textContent.slice(0, 500) : "");
        if (
          /just a moment|attention required|enable javascript and cookies|captcha/i.test(
            probe,
          )
        )
          throw new Error("challenge-page");
        return { items: [], hasMore: false };
      }
      const items = [];
      nodes.forEach((n) => {
        const get = (a) => n.getAttribute(a);
        const id = get("data-script-id");
        if (!isId(id)) return;
        const rating = get("data-script-rating-score");
        items.push({
          id,
          name: get("data-script-name") || "",
          author:
            (n.querySelector("dd.script-list-author") &&
              n.querySelector("dd.script-list-author").textContent.trim()) ||
            "–",
          description:
            (n.querySelector(".script-description") &&
              n.querySelector(".script-description").textContent.trim()) ||
            "",
          version: get("data-script-version") || "",
          url: `${svc().base}/scripts/${id}`,
          createDate: get("data-script-created-date"),
          updateDate: get("data-script-updated-date"),
          installs: get("data-script-total-installs"),
          dailyInstalls: get("data-script-daily-installs"),
          ratingScore: rating,
        });
      });
      const next = doc.querySelector(".next_page");
      const more_ =
        !!next &&
        next.getAttribute("aria-disabled") !== "true" &&
        !next.classList.contains("disabled");
      return { items, hasMore: more_ };
    }
    async function pgGet(url, headers) {
      const wait = lastReq + 700 - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      lastReq = Date.now();
      return gmGet(url, headers);
    }
    function retryAfter(h) {
      const m = /retry-after:\s*(\d+)/i.exec(h || "");
      const n = m ? Number(m[1]) : 30;
      return Math.min(300, Math.max(5, n || 30));
    }
    function rateError(r) {
      const e = new Error(`rate-limited (HTTP ${r.status})`);
      e.rate = retryAfter(r.headers);
      return e;
    }
    async function fetchPage(n) {
      const key = [serviceKey, domain, sortKey, queryTerm, n].join("|");
      const hit = cache.get(key);
      if (hit && Date.now() - hit.t < CACHE_TTL) return hit.v;
      const v = await fetchPageNet(n);
      cache.set(key, { t: Date.now(), v });
      return v;
    }
    async function fetchPageNet(n) {
      if (Date.now() < cooldownUntil) {
        const e = new Error("cooldown");
        e.rate = Math.ceil((cooldownUntil - Date.now()) / 1000);
        throw e;
      }
      const base = svc().base;
      const api = svc().api;
      const enc = encodeURIComponent(domain);
      const errors = [];
      let ttHit = false;
      const plain = n === 1 && !queryTerm && !sortKey;
      const params = [];
      if (n > 1) params.push(`page=${n}`);
      if (queryTerm) params.push(`q=${encodeURIComponent(queryTerm)}`);
      if (sortKey) params.push(`sort=${encodeURIComponent(sortKey)}`);
      const qs = params.length ? `?${params.join("&")}` : "";
      {
        const url = `${api}/scripts/by-site/${enc}.json${qs}`;
        try {
          let r = await pgGet(url, { Accept: "application/json" });
          if (r.status === 403 && plain)
            r = await pgGet(url, {
              Accept: "application/json",
              Referer: base + "/",
            });
          if (r.status === 429 || (r.status === 403 && !plain)) {
            logHttp("by-site JSON", url, r);
            throw rateError(r);
          }
          if (r.status === 200) {
            const arr = extractList(r.text);
            if (arr) {
              if (arr.length !== PAGE_SIZE)
                console.warn(
                  `[Script Finder+] PAGE_SIZE mismatch: got ${arr.length}, expected ${PAGE_SIZE}`,
                  url,
                );
              return {
                items: arr.map(mapJson).filter(Boolean),
                hasMore: arr.length >= PAGE_SIZE,
              };
            }
            errors.push("by-site JSON: invalid JSON");
            console.warn("[Script Finder+] by-site not JSON:", r.text.slice(0, 200));
          } else if (r.status === 404) {
            return { items: [], hasMore: false };
          } else {
            errors.push(`by-site JSON: HTTP ${r.status}`);
            logHttp("by-site JSON", url, r);
          }
        } catch (e) {
          if (e.rate) throw e;
          errors.push(`by-site JSON: ${e.kind || e.message}`);
        }
      }
      if (plain) {
        {
          const url = `${api}/scripts.json?q=${enc}&sort=updated`;
          try {
            const r = await pgGet(url, { Accept: "application/json" });
            if (r.status === 200) {
              const arr = extractList(r.text);
              if (arr) {
                if (arr.length !== PAGE_SIZE)
                  console.warn(
                    `[Script Finder+] PAGE_SIZE mismatch: got ${arr.length}, expected ${PAGE_SIZE}`,
                    url,
                  );
                return {
                  items: arr.filter(relevantToDomain).map(mapJson).filter(Boolean),
                  hasMore: arr.length >= PAGE_SIZE,
                };
              }
              errors.push("search JSON: invalid JSON");
            } else {
              errors.push(`search JSON: HTTP ${r.status}`);
              logHttp("search JSON", url, r);
            }
          } catch (e) {
            errors.push(`search JSON: ${e.kind || e.message}`);
          }
        }
        {
          const url = `${base}/scripts/by-site/${enc}`;
          try {
            const r = await pgGet(url, {
              Accept: "text/html",
              Referer: base + "/",
            });
            if (r.status === 200) {
              return parseHtmlList(r.text);
            } else if (r.status === 404) {
              return { items: [], hasMore: false };
            } else {
              errors.push(`HTML: HTTP ${r.status}`);
              logHttp("HTML", url, r);
            }
          } catch (e) {
            if (e.tt) ttHit = true;
            errors.push(`HTML: ${e.kind || e.message}`);
          }
        }
      }
      const err = new Error(errors.join("; "));
      err.tt = ttHit;
      throw err;
    }
    function stopCooldown() {
      clearInterval(cdTimer);
      cdTimer = 0;
    }
    function startCooldown(sec) {
      stopCooldown();
      cooldownUntil = Math.max(cooldownUntil, Date.now() + sec * 1000);
      more.textContent = t("Retry");
      more.hidden = false;
      more.disabled = true;
      const tick = () => {
        const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
        if (left <= 0) {
          stopCooldown();
          more.disabled = false;
          setStatus(t("RateLimitedDone"));
          return;
        }
        setStatus(t("RateLimited").replace("{n}", String(left)));
      };
      tick();
      cdTimer = setInterval(tick, 1000);
    }
    async function loadPage() {
      if (requeryOnRetry && !loading && hasMore) {
        requeryOnRetry = false;
        startQuery(queryTerm);
        return;
      }
      if (loading || !hasMore) return;
      loading = true;
      const myGen = gen;
      stopCooldown();
      more.hidden = true;
      more.disabled = true;
      setStatus(list.children.length ? t("Loading") : t("LoadingScripts"), true);
      skel.hidden = !!list.children.length;
      try {
        const res = await fetchPage(page + 1);
        if (myGen !== gen) return;
        if (pendingReplace && page === 0) {
          list.textContent = "";
          seen.clear();
          pendingReplace = false;
        }
        const frag = document.createDocumentFragment();
        for (const s of res.items) {
          if (seen.has(s.id)) continue;
          seen.add(s.id);
          frag.appendChild(renderItem(s));
        }
        list.appendChild(frag);
        page++;
        hasMore = !!res.hasMore;
        if (!list.children.length) {
          hasMore = false;
          setStatus(t("NoScripts"));
        } else {
          setStatus(hasMore ? "" : t("AllScriptsLoaded"));
        }
        more.textContent = t("LoadMore");
        more.hidden = !hasMore;
        more.disabled = false;
      } catch (e) {
        if (myGen !== gen) return;
        console.warn("[Script Finder+] load failed:", e);
        if (e && e.rate) {
          startCooldown(e.rate);
        } else {
          const wasPending = pendingReplace;
          pendingReplace = false;
          requeryOnRetry = wasPending;
          const detail = String((e && e.message) || "").slice(0, 160);
          setStatus(
            `${e && e.tt ? t("TTBlocked") : t("LoadFailed")}${detail ? ` (${detail})` : ""}`,
          );
          more.textContent = t("Retry");
          more.hidden = false;
          more.disabled = false;
        }
      } finally {
        if (myGen === gen) {
          loading = false;
          skel.hidden = true;
        }
        applyFilter();
      }
    }
    function resetList() {
      gen++;
      loading = false;
      stopCooldown();
      page = 0;
      hasMore = true;
      pendingReplace = false;
      requeryOnRetry = false;
      seen.clear();
      list.textContent = "";
      skel.hidden = true;
      setStatus("");
      more.hidden = true;
      updateCounts();
    }
    function startQuery(term) {
      gen++;
      loading = false;
      stopCooldown();
      queryTerm = term;
      page = 0;
      hasMore = true;
      pendingReplace = true;
      requeryOnRetry = false;
      more.hidden = true;
      skel.hidden = true;
      setStatus("");
      if (isOpen) loadPage();
    }
    function setOpen(v) {
      isOpen = !!v;
      panel.classList.toggle("open", isOpen);
      scrim.classList.toggle("open", isOpen);
      tab.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        maybeCheckUpdate();
        if (page === 0 && !loading && hasMore) loadPage();
        setTimeout(() => {
          try {
            if (matchMedia("(pointer: fine)").matches)
              search.focus({ preventScroll: true });
            else panel.focus({ preventScroll: true });
          } catch (e) {}
        }, 60);
      }
    }
    const toggle = () => setOpen(!isOpen);
    function cmpVersion(a, b) {
      const pa = String(a)
        .split(/[^0-9]+/)
        .filter(Boolean)
        .map(Number);
      const pb = String(b)
        .split(/[^0-9]+/)
        .filter(Boolean)
        .map(Number);
      const n = Math.max(pa.length, pb.length);
      for (let i = 0; i < n; i++) {
        const x = pa[i] || 0;
        const y = pb[i] || 0;
        if (x !== y) return x > y ? 1 : -1;
      }
      return 0;
    }
    function showUpdate(version) {
      if (!version || cmpVersion(version, INSTALLED_VERSION) <= 0) return;
      if (version === String(store.get(STORE_UPDATE_SKIP, ""))) return;
      pendingUpdate = version;
      bannerText.textContent = t("UpdateAvailable").replace("{v}", version);
      banner.hidden = false;
    }
    function maybeCheckUpdate() {
      if (updateChecked) return;
      const last = Number(store.get(STORE_UPDATE_CHECKED, 0)) || 0;
      if (last && Date.now() - last < UPDATE_INTERVAL) return;
      updateChecked = true;
      store.set(STORE_UPDATE_CHECKED, Date.now());
      const check = (i) => {
        gmGet(i ? CDN_FALLBACK : CDN_URL, { Accept: "text/plain" })
          .then((r) => {
            const m =
              r && r.status === 200 && /\/\/\s*@version\s+([^\s]+)/.exec(r.text);
            if (!m) throw new Error("no-version");
            showUpdate(m[1].trim());
          })
          .catch(() => {
            if (!i) check(1);
          });
      };
      check(0);
    }
    bannerUpdate.addEventListener("click", () => {
      if (pendingUpdate) openTab(CDN_URL);
      setOpen(false);
    });
    bannerSkip.addEventListener("click", () => {
      if (pendingUpdate) store.set(STORE_UPDATE_SKIP, pendingUpdate);
      pendingUpdate = "";
      banner.hidden = true;
    });
    function setTop(pct) {
      topPct = Math.min(92, Math.max(8, Number(pct) || 70));
      tab.style.top = topPct + "%";
    }
    setTop(topPct);
    let drag = null;
    tab.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      drag = { startY: e.clientY, moved: false };
      try {
        tab.setPointerCapture(e.pointerId);
      } catch (err) {}
    });
    tab.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (!drag.moved && Math.abs(e.clientY - drag.startY) < 5) return;
      drag.moved = true;
      tab.classList.add("dragging");
      setTop((e.clientY / window.innerHeight) * 100);
    });
    tab.addEventListener("pointerup", () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      tab.classList.remove("dragging");
      if (moved) store.set("sf_top", topPct);
      else toggle();
    });
    tab.addEventListener("pointercancel", () => {
      drag = null;
      tab.classList.remove("dragging");
    });
    tab.addEventListener("click", (e) => {
      if (e.detail === 0) toggle();
    });
    closeBtn.addEventListener("click", () => {
      setOpen(false);
      tab.focus();
    });
    more.addEventListener("click", loadPage);
    scrim.addEventListener("click", () => setOpen(false));
    let filterTimer = 0;
    let serverTimer = 0;
    search.addEventListener("input", () => {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(applyFilter, 120);
      clearTimeout(serverTimer);
      serverTimer = setTimeout(() => {
        const raw = search.value.trim();
        if (raw === queryTerm) return;
        if (raw && raw.length < 2) return;
        if (!queryTerm && !hasMore && page > 0) return;
        startQuery(raw);
      }, 500);
    });
    sortSel.addEventListener("change", () => {
      sortKey = sortSel.value;
      store.set("sf_sort", sortKey);
      startQuery(queryTerm);
    });
    seg.addEventListener("click", (e) => {
      const bt = e.target && e.target.closest ? e.target.closest(".seg-btn") : null;
      if (!bt) return;
      const key = bt.getAttribute("data-svc");
      if (!SERVICES[key] || key === serviceKey) return;
      serviceKey = key;
      store.set("sf_service", serviceKey);
      syncSeg();
      refreshLabels();
      resetList();
      if (isOpen) loadPage();
    });
    function openTab(url) {
      try {
        if (typeof GM_openInTab === "function") {
          GM_openInTab(url, { active: true, insert: true, setParent: true });
          return;
        }
      } catch (e) {}
      window.open(url, "_blank", "noopener");
    }
    gfBtn.addEventListener("click", () => {
      let url = `${svc().base}/scripts/by-site/${encodeURIComponent(domain)}`;
      const q = search.value.trim();
      if (q) url += `?q=${encodeURIComponent(q)}`;
      openTab(url);
    });
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const f = [
          ...panel.querySelectorAll(
            "button, select, input, a[href]",
          ),
        ].filter((n) => !n.disabled && !n.hidden && !n.closest("[hidden]"));
        if (f.length) {
          const first = f[0],
            last = f[f.length - 1];
          const active = shadow.activeElement;
          if (e.shiftKey && (active === first || active === panel)) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      e.stopPropagation();
    });
    for (const ev of ["keyup", "keypress"])
      panel.addEventListener(ev, (e) => e.stopPropagation());
    document.addEventListener(
      "pointerdown",
      (e) => {
        if (isOpen && !e.composedPath().includes(host)) setOpen(false);
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (e) => {
        if (isOpen && e.key === "Escape") {
          setOpen(false);
          tab.focus();
        }
      },
      true,
    );
    document.addEventListener("fullscreenchange", () => {
      host.style.display = document.fullscreenElement ? "none" : "";
    });
    try {
      if (typeof GM_registerMenuCommand === "function") {
        GM_registerMenuCommand(`Script Finder+: ${t("MenuToggle")}`, toggle);
        GM_registerMenuCommand(`Script Finder+: ${t("MenuResetPos")}`, () => {
          store.set("sf_top", 70);
          setTop(70);
        });
        GM_registerMenuCommand(`Script Finder+: ${t("ClearCache")}`, () => {
          cache.clear();
          store.set(STORE_UPDATE_CHECKED, 0);
          updateChecked = false;
          pendingUpdate = "";
          banner.hidden = true;
        });
      }
    } catch (e) {}
    (document.documentElement || document.body).appendChild(host);
  }
})();
