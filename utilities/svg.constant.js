/* ============================================================
   Nur Prayer — Centralized SVG Constants
   Path: utilities/svg.constant.js
   All reusable SVG graphics across features are maintained here.
   ============================================================ */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       SHARED — SVGs used across multiple features
    ------------------------------------------------------------------ */
    var SHARED = {
        /**
         * Mosque silhouette (24×24) — used in dashboard clock card,
         * dashboard header, and settings prayer-times card.
         */
        MOSQUE:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
            '  <title>the-prophets-mosque</title>' +
            '  <g fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">' +
            '    <path d="M3 22v-2.5c0-2.068.345-2.5 2-2.5h12c1.655 0 2 .432 2 2.5V22zm-1 0h20M17.513 6C15.97 4 18.339 3 19 2c.661 1 3.03 2 1.488 4z"/>' +
            '    <path d="M17.5 6L17 17m0 5h4l-.5-16M11 8c1.984 2.25 6 3 6 9H5c0-6 4.015-6.75 5.999-9"/>' +
            '  </g>' +
            '</svg>',

        /**
         * Prayer beads / misbaha (64×64) — used in dashboard tasbeeh
         * card and tasbeeh-home bookmark cards.
         * References CONSTANTS.TASBEEH.ICONS.MISBAHA.
         */
        MISBAHA: (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.ICONS && window.CONSTANTS.TASBEEH.ICONS.MISBAHA) || ''
    };

    /* ------------------------------------------------------------------
       DASHBOARD — SVGs specific to the dashboard feature
    ------------------------------------------------------------------ */
    var DASHBOARD = {
        /**
         * Rub el hizb geometric symbol (24×24) — used in clock card and
         * bottom decorative divider.
         */
        RUB_EL_HIZB:
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5"/>' +
            '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5" transform="rotate(45 12 12)"/>' +
            '<circle cx="12" cy="12" r="3.2"/>' +
            '</svg>',

        /**
         * Prayer tracker calendar icon (48×48) — used in the Tracker nav card.
         */
        TRACKER:
            '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">' +
            '  <title>prayer-times</title>' +
            '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M38.5 5.5h-29c-2.2 0-4 1.8-4 4v29c0 2.2 1.8 4 4 4h29c2.2 0 4-1.8 4-4v-29c0-2.2-1.8-4-4-4"/>' +
            '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M15.333 37C12.95 37 11 36.056 11 33.673V14c0-1.65 1.35-3 3-3h20c1.65 0 3 1.35 3 3v18.667A4.346 4.346 0 0 1 32.667 37v-1.526c-1.214-1.005-1.693-1.21-1.693-1.21s1.524-1.23 1.898-1.756c.816-1.15 2.863-6.045-1.469-9.095c-1.552-1.093-6.31-3.317-6.31-3.317c-1.036-2.482-1.128-3.545-1.093-6.172c.035 2.627-.057 3.69-1.094 6.172c0 0-4.756 2.224-6.309 3.317c-4.332 3.05-2.285 7.945-1.469 9.095c.374.527 1.898 1.756 1.898 1.756s-.479.205-1.692 1.21z"/>' +
            '</svg>',

        /**
         * Praying room / duas figure (24×24) — used in the Duas nav card.
         */
        DUAS:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
            '  <title>places-praying-room</title>' +
            '  <path fill="none" stroke="#123D2E" d="m17 9l-4.25 4.5h-.25l-1.5-6h-.5a3 3 0 0 0-3 3V17c5.5 0 9 2.5 9 3.5H7m6-10.882L15 7.5m-15 16h24m-12.445-18s1.81-.557 2.135-1.776a1.77 1.77 0 0 0-1.242-2.163a1.75 1.75 0 0 0-2.145 1.25c-.325 1.219.961 2.61.961 2.61z"/>' +
            '</svg>',

        /**
         * Settings gear icon (26×26) — used in the Settings nav card.
         */
        SETTINGS:
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="#123D2E" aria-hidden="true">' +
            '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.48.48 0 0 0 14 2.3h-4a.48.48 0 0 0-.48.41l-.38 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.62 8.77c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h4c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>' +
            '</svg>',

        /**
         * Navigation chevron (16×16) with class "dash-nav-chevron" and
         * stroke #9bb8a9 — used in all four dashboard nav card footers.
         */
        CHEVRON:
            '<svg class="dash-nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="m9 18 6-6-6-6"/>' +
            '</svg>',

        /**
         * Islamic Geometric Watermark corner pattern (top-left) (160×120) — used in dashboard top background.
         */
        CORNER_TL:
            '<svg class="dash-corner-pattern dash-corner-tl" viewBox="0 0 160 120" fill="none" stroke="#123D2E" stroke-width="1.2">' +
            '  <path d="M 0,0 L 40,0 L 60,20 L 60,60 L 40,80 L 0,80 Z"/>' +
            '  <path d="M 20,0 L 40,20 L 20,40 L 0,20 Z"/>' +
            '  <path d="M 60,20 L 80,0 L 100,20 L 80,40 Z"/>' +
            '  <path d="M 40,40 L 60,60 L 40,80 L 20,60 Z"/>' +
            '  <polygon points="60,35 66,49 80,46 72,58 80,70 66,67 60,81 54,67 40,70 48,58 40,46 54,49"/>' +
            '  <polygon points="120,35 126,49 140,46 132,58 140,70 126,67 120,81 114,67 100,70 108,58 100,46 114,49"/>' +
            '  <circle cx="60" cy="58" r="8"/>' +
            '  <circle cx="120" cy="58" r="8"/>' +
            '  <line x1="0" y1="20" x2="160" y2="20"/>' +
            '  <line x1="0" y1="58" x2="160" y2="58"/>' +
            '  <line x1="0" y1="96" x2="160" y2="96"/>' +
            '  <line x1="60" y1="0" x2="60" y2="120"/>' +
            '  <line x1="120" y1="0" x2="120" y2="120"/>' +
            '</svg>',

        /**
         * Islamic Geometric Watermark corner pattern (top-right) (160×120) — used in dashboard top background.
         */
        CORNER_TR:
            '<svg class="dash-corner-pattern dash-corner-tr" viewBox="0 0 160 120" fill="none" stroke="#123D2E" stroke-width="1.2">' +
            '  <path d="M 0,0 L 40,0 L 60,20 L 60,60 L 40,80 L 0,80 Z"/>' +
            '  <path d="M 20,0 L 40,20 L 20,40 L 0,20 Z"/>' +
            '  <path d="M 60,20 L 80,0 L 100,20 L 80,40 Z"/>' +
            '  <path d="M 40,40 L 60,60 L 40,80 L 20,60 Z"/>' +
            '  <polygon points="60,35 66,49 80,46 72,58 80,70 66,67 60,81 54,67 40,70 48,58 40,46 54,49"/>' +
            '  <polygon points="120,35 126,49 140,46 132,58 140,70 126,67 120,81 114,67 100,70 108,58 100,46 114,49"/>' +
            '  <circle cx="60" cy="58" r="8"/>' +
            '  <circle cx="120" cy="58" r="8"/>' +
            '  <line x1="0" y1="20" x2="160" y2="20"/>' +
            '  <line x1="0" y1="58" x2="160" y2="58"/>' +
            '  <line x1="0" y1="96" x2="160" y2="96"/>' +
            '  <line x1="60" y1="0" x2="60" y2="120"/>' +
            '  <line x1="120" y1="0" x2="120" y2="120"/>' +
            '</svg>'
    };

    /* ------------------------------------------------------------------
       TASBEEH — SVGs specific to the tasbeeh feature
    ------------------------------------------------------------------ */
    var TASBEEH = {
        /**
         * Bookmark card chevron (14×14, stroke #94a3b8) — used in
         * tasbeeh-home.js bookmark cards (Current and Old).
         * Note: CONSTANTS.TASBEEH.ICONS.CHEVRON has width=16; this
         * canonical version uses width=14 as rendered in the home cards.
         */
        CHEVRON:
            '<svg class="tb-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '        <path d="m9 18 6-6-6-6"/>' +
            '      </svg>',

        /**
         * Group toggle chevron-down (14×14, stroke #0b3829) — used in
         * "To Do" group header buttons in tasbeeh-current.js and
         * tasbeeh-old.js.
         */
        GROUP_TOGGLE_DOWN:
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b3829" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="m6 9 6 6 6-6"/>' +
            '</svg>',

        /**
         * Group toggle triangle-down (11×11, fill #0b3829) — used in
         * "Completed" group header buttons in tasbeeh-current.js and
         * tasbeeh-old.js.
         */
        GROUP_TOGGLE_COLLAPSED:
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="#0b3829">' +
            '<path d="m5 8 7 8 7-8z"/>' +
            '</svg>'
    };

    /* ------------------------------------------------------------------
       Assign to window
    ------------------------------------------------------------------ */
    window.SVG_CONSTANTS = {
        SHARED: SHARED,
        DASHBOARD: DASHBOARD,
        TASBEEH: TASBEEH
    };

}());

