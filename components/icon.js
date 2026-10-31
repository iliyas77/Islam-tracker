/* ============================================================
   Nur Prayer — Centralized Reusable Icon Component
   Path: components/icon.js
   Centralized icon renderer for FontAwesome and SVG icons.
   Supports consistent properties: name, variant, size, color,
   className, attributes, and accessibility.
   ============================================================ */

(function (window) {
    'use strict';

    /* ------------------------------------------------------------------
       1. CENTRAL SVG ICON REGISTRY
       Reuses SVG constants from utilities/svg.constant.js and
       utilities/constant.js with bulletproof self-contained fallbacks.
    ------------------------------------------------------------------ */
    var SVG_REGISTRY = {
        // Shared & Dashboard SVGs
        'mosque':
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
            '  <title>the-prophets-mosque</title>' +
            '  <g fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">' +
            '    <path d="M3 22v-2.5c0-2.068.345-2.5 2-2.5h12c1.655 0 2 .432 2 2.5V22zm-1 0h20M17.513 6C15.97 4 18.339 3 19 2c.661 1 3.03 2 1.488 4z"/>' +
            '    <path d="M17.5 6L17 17m0 5h4l-.5-16M11 8c1.984 2.25 6 3 6 9H5c0-6 4.015-6.75 5.999-9"/>' +
            '  </g>' +
            '</svg>',

        'rub-el-hizb':
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5"/>' +
            '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5" transform="rotate(45 12 12)"/>' +
            '<circle cx="12" cy="12" r="3.2"/>' +
            '</svg>',

        'tracker':
            '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">' +
            '  <title>prayer-times</title>' +
            '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M38.5 5.5h-29c-2.2 0-4 1.8-4 4v29c0 2.2 1.8 4 4 4h29c2.2 0 4-1.8 4-4v-29c0-2.2-1.8-4-4-4"/>' +
            '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M15.333 37C12.95 37 11 36.056 11 33.673V14c0-1.65 1.35-3 3-3h20c1.65 0 3 1.35 3 3v18.667A4.346 4.346 0 0 1 32.667 37v-1.526c-1.214-1.005-1.693-1.21-1.693-1.21s1.524-1.23 1.898-1.756c.816-1.15 2.863-6.045-1.469-9.095c-1.552-1.093-6.31-3.317-6.31-3.317c-1.036-2.482-1.128-3.545-1.093-6.172c.035 2.627-.057 3.69-1.094 6.172c0 0-4.756 2.224-6.309 3.317c-4.332 3.05-2.285 7.945-1.469 9.095c.374.527 1.898 1.756 1.898 1.756s-.479.205-1.692 1.21z"/>' +
            '</svg>',

        'duas':
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
            '  <title>places-praying-room</title>' +
            '  <path fill="none" stroke="currentColor" d="m17 9l-4.25 4.5h-.25l-1.5-6h-.5a3 3 0 0 0-3 3V17c5.5 0 9 2.5 9 3.5H7m6-10.882L15 7.5m-15 16h24m-12.445-18s1.81-.557 2.135-1.776a1.77 1.77 0 0 0-1.242-2.163a1.75 1.75 0 0 0-2.145 1.25c-.325 1.219.961 2.61.961 2.61z"/>' +
            '</svg>',

        'duas-icon':
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
            '  <title>places-praying-room</title>' +
            '  <path fill="none" stroke="currentColor" d="m17 9l-4.25 4.5h-.25l-1.5-6h-.5a3 3 0 0 0-3 3V17c5.5 0 9 2.5 9 3.5H7m6-10.882L15 7.5m-15 16h24m-12.445-18s1.81-.557 2.135-1.776a1.77 1.77 0 0 0-1.242-2.163a1.75 1.75 0 0 0-2.145 1.25c-.325 1.219.961 2.61.961 2.61z"/>' +
            '</svg>',

        'drawing-pin':
            '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">' +
            '  <title>drawing-pin</title>' +
            '  <path fill="currentColor" d="M9.621 1.136a.5.5 0 0 1 .707 0l3.536 3.535a.5.5 0 0 1-.707.707l-.653-.652l-3.637 4.848l1.108 1.108a.5.5 0 1 1-.707.707L6.793 8.913v.001l-3.27 3.27a.5.5 0 0 1-.708-.706l3.27-3.27v-.002L3.612 5.732a.5.5 0 1 1 .707-.707l1.108 1.108l4.848-3.637l-.653-.653a.5.5 0 0 1 0-.707M6.14 6.847L8.153 8.86l3.637-4.85l-.802-.8z"/>' +
            '</svg>',

        'book':
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">' +
            '  <title>book</title>' +
            '  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7S9 1 2 6v22c7-5 14 0 14 0s7-5 14 0V6c-7-5-14 1-14 1m0 0v21"/>' +
            '</svg>',

        'all-bookmark':
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
            '  <title>all-bookmark</title>' +
            '  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">' +
            '    <path d="M3 17.98v-5.273c0-3.633 0-5.45 1.098-6.578S6.964 5 10.5 5s5.303 0 6.402 1.129C18 7.257 18 9.074 18 12.708v5.273c0 2.306 0 3.459-.724 3.871c-1.404.8-4.035-1.867-5.285-2.67c-.725-.465-1.088-.698-1.491-.698s-.766.233-1.49.698c-1.25.803-3.882 3.47-5.285 2.67C3 21.44 3 20.287 3 17.981"/>' +
            '    <path d="M9 2h2c4.714 0 7.071 0 8.535 1.464C21 4.93 21 7.286 21 12v6"/>' +
            '  </g>' +
            '</svg>',

        'settings-gear':
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="#123D2E" aria-hidden="true">' +
            '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.48.48 0 0 0 14 2.3h-4a.48.48 0 0 0-.48.41l-.38 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.62 8.77c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h4c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>' +
            '</svg>',

        'dash-chevron':
            '<svg class="dash-nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="m9 18 6-6-6-6"/>' +
            '</svg>',

        'tb-chevron':
            '<svg class="tb-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="m9 18 6-6-6-6"/>' +
            '</svg>',

        'tb-group-toggle-down':
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b3829" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="m6 9 6 6 6-6"/>' +
            '</svg>',

        'tb-group-toggle-collapsed':
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="#0b3829" aria-hidden="true">' +
            '<path d="m5 8 7 8 7-8z"/>' +
            '</svg>',

        'timeline-alarm':
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="13" r="8"/>' +
            '<path d="M12 9v4l2 1.5M5 3L2 6M22 6l-3-3M6.38 18.7L4 21M17.64 18.67L20 21"/>' +
            '</svg>',

        // Prayer Sun / Moon SVGs
        'fajr':
            '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M12 2v3M4.93 6.93l2.12 2.12M19.07 6.93l-2.12 2.12M2 17h20M17 17a5 5 0 0 0-10 0"/>' +
            '</svg>',

        'dhuhr':
            '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="3.8"/>' +
            '<path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M6.7 17.3l-1.77 1.77M19.07 4.93l-1.77 1.77"/>' +
            '</svg>',

        'asr':
            '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="3.8"/>' +
            '<path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M6.7 17.3l-1.77 1.77M19.07 4.93l-1.77 1.77"/>' +
            '</svg>',

        'maghrib':
            '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M12 2v3M4.93 6.93l2.12 2.12M19.07 6.93l-2.12 2.12M2 17h20M17 17a5 5 0 0 0-10 0"/>' +
            '</svg>',

        'isha':
            '<svg class="icon-md" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
            '<path d="M12 2.5a9.5 9.5 0 0 0 8.5 13.7 9.5 9.5 0 1 1-8.5-13.7z"/>' +
            '<polygon points="18.8 4 19.5 5.5 21 5.6 19.9 6.7 20.2 8.2 18.8 7.4 17.4 8.2 17.7 6.7 16.6 5.6 18.1 5.5"/>' +
            '</svg>',

        // Prayer Card specific SVGs
        'done-check':
            '<svg class="icon-md" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
            '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />' +
            '</svg>',

        'done-check-sm':
            '<svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
            '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />' +
            '</svg>',

        'warning':
            '<svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
            '<path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />' +
            '</svg>',

        'calendar-card':
            '<svg class="icon-sm" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">' +
            '<rect x="3" y="4" width="14" height="13" rx="2" />' +
            '<path d="M16 2v4M4 2v4M3 8h14" />' +
            '</svg>',

        // Tasbeeh Target SVGs
        'tb-target':
            '<svg class="tb-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#168a54" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="9"/>' +
            '<circle cx="12" cy="12" r="5"/>' +
            '<circle cx="12" cy="12" r="1.5" fill="#168a54"/>' +
            '<path d="m4 4 4.5 4.5"/>' +
            '<path d="M3 6.5 6.5 3"/>' +
            '</svg>',

        'tb-check-circle':
            '<svg class="tb-meta-icon" width="16" height="16" viewBox="0 0 20 20" fill="#168a54" aria-hidden="true">' +
            '<circle cx="10" cy="10" r="10" fill="#168a54"/>' +
            '<path fill="#ffffff" fill-rule="evenodd" d="M14.707 6.707a1 1 0 00-1.414-1.414l-4.293 4.293-1.879-1.879a1 1 0 00-1.414 1.414l2.586 2.586a1 1 0 001.414 0l4.999-4.999z" clip-rule="evenodd"/>' +
            '</svg>',

        'tb-pencil':
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="#168a54" aria-hidden="true">' +
            '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>' +
            '</svg>'
    };

    // Pull external SVG constants if available in environment
    function getRegisteredSvg(name) {
        var key = (name || '').toLowerCase().trim();

        // 1. Check direct aliases
        if (SVG_REGISTRY[key]) return SVG_REGISTRY[key];

        // 2. Check window.SVG_CONSTANTS
        var sc = window.SVG_CONSTANTS;
        if (sc) {
            if (key === 'mosque' && sc.SHARED && sc.SHARED.MOSQUE) return sc.SHARED.MOSQUE;
            if (key === 'misbaha' && sc.SHARED && sc.SHARED.MISBAHA) return sc.SHARED.MISBAHA;
            if (key === 'rub-el-hizb' && sc.DASHBOARD && sc.DASHBOARD.RUB_EL_HIZB) return sc.DASHBOARD.RUB_EL_HIZB;
            if (key === 'tracker' && sc.DASHBOARD && sc.DASHBOARD.TRACKER) return sc.DASHBOARD.TRACKER;
            if (key === 'duas' && sc.DASHBOARD && sc.DASHBOARD.DUAS) return sc.DASHBOARD.DUAS;
            if ((key === 'settings' || key === 'settings-gear') && sc.DASHBOARD && sc.DASHBOARD.SETTINGS) return sc.DASHBOARD.SETTINGS;
            if (key === 'dash-chevron' && sc.DASHBOARD && sc.DASHBOARD.CHEVRON) return sc.DASHBOARD.CHEVRON;
            if (key === 'corner-tl' && sc.DASHBOARD && sc.DASHBOARD.CORNER_TL) return sc.DASHBOARD.CORNER_TL;
            if (key === 'corner-tr' && sc.DASHBOARD && sc.DASHBOARD.CORNER_TR) return sc.DASHBOARD.CORNER_TR;
            if (key === 'tb-chevron' && sc.TASBEEH && sc.TASBEEH.CHEVRON) return sc.TASBEEH.CHEVRON;
            if (key === 'tb-group-toggle-down' && sc.TASBEEH && sc.TASBEEH.GROUP_TOGGLE_DOWN) return sc.TASBEEH.GROUP_TOGGLE_DOWN;
            if (key === 'tb-group-toggle-collapsed' && sc.TASBEEH && sc.TASBEEH.GROUP_TOGGLE_COLLAPSED) return sc.TASBEEH.GROUP_TOGGLE_COLLAPSED;
        }

        // 3. Check window.CONSTANTS
        var c = window.CONSTANTS;
        if (c) {
            if (c.PRAYER && c.PRAYER.FA_ICONS) {
                var pKey = key.charAt(0).toUpperCase() + key.slice(1);
                if (c.PRAYER.FA_ICONS[pKey]) return c.PRAYER.FA_ICONS[pKey];
            }
            if (c.PRAYER && c.PRAYER.CARD_ICONS) {
                if (key === 'donecheck' || key === 'done-check') return c.PRAYER.CARD_ICONS.DoneCheck;
                if (key === 'donechecksm' || key === 'done-check-sm') return c.PRAYER.CARD_ICONS.DoneCheckSm;
                if (key === 'warning') return c.PRAYER.CARD_ICONS.Warning;
                if (key === 'calendar' || key === 'calendar-card') return c.PRAYER.CARD_ICONS.Calendar;
            }
            if (c.TASBEEH && c.TASBEEH.ICONS) {
                if (key === 'misbaha' && c.TASBEEH.ICONS.MISBAHA) return c.TASBEEH.ICONS.MISBAHA;
                if (key === 'tb-target' && c.TASBEEH.ICONS.TARGET) return c.TASBEEH.ICONS.TARGET;
                if (key === 'tb-check-circle' && c.TASBEEH.ICONS.CHECK_CIRCLE) return c.TASBEEH.ICONS.CHECK_CIRCLE;
                if (key === 'tb-pencil' && c.TASBEEH.ICONS.PENCIL) return c.TASBEEH.ICONS.PENCIL;
            }
        }

        return null;
    }

    /* ------------------------------------------------------------------
       2. SIZE SCALE MAPPINGS
       Supports tokens: xs, sm, md, lg, xl, 2xl, 3xl, fs-*, icon-*
    ------------------------------------------------------------------ */
    var SIZE_CLASS_MAP = {
        'xs': 'fs-6',
        'sm': 'fs-6',
        'md': 'fs-5',
        'lg': 'fs-4',
        'xl': 'fs-3',
        '2xl': 'fs-2',
        '3xl': 'fs-1',
        'icon-sm': 'icon-sm',
        'icon-md': 'icon-md',
        'icon-lg': 'icon-lg'
    };

    var SIZE_PIXEL_MAP = {
        'xs': 14,
        'sm': 16,
        'md': 20,
        'lg': 24,
        'xl': 32,
        '2xl': 40,
        '3xl': 48,
        'icon-sm': 16,
        'icon-md': 22,
        'icon-lg': 28
    };

    // Icons commonly rendered in regular/outlined variant in this application
    var REGULAR_ICONS = {
        'calendar': true,
        'calendar-check': true,
        'calendar-days': true,
        'calendar-plus': true,
        'calendar-xmark': true,
        'file-lines': true,
        'clock': true
    };

    /* ------------------------------------------------------------------
       3. NORMALIZE OPTIONS HELPER
    ------------------------------------------------------------------ */
    function normalizeOptions(nameOrOpts, maybeSize, maybeColor, maybeClass) {
        if (!nameOrOpts) return {};

        var opts = {};
        if (typeof nameOrOpts === 'object') {
            opts = Object.assign({}, nameOrOpts);
        } else if (typeof nameOrOpts === 'string') {
            opts.name = nameOrOpts;
            if (typeof maybeSize === 'object') {
                Object.assign(opts, maybeSize);
            } else {
                if (maybeSize !== undefined) opts.size = maybeSize;
                if (maybeColor !== undefined) opts.color = maybeColor;
                if (maybeClass !== undefined) opts.className = maybeClass;
            }
        }

        // Allow passing full FA classes like 'fa-regular fa-calendar text-brand'
        if (typeof opts.name === 'string' && (opts.name.includes('fa-') || opts.name.includes(' '))) {
            var tokens = opts.name.trim().split(/\s+/);
            var cleanTokens = [];
            for (var i = 0; i < tokens.length; i++) {
                var tok = tokens[i];
                if (tok === 'fa-solid' || tok === 'fa-regular' || tok === 'fa-brands') {
                    opts.variant = tok.replace('fa-', '');
                } else if (tok.startsWith('fa-')) {
                    opts.cleanName = tok.replace('fa-', '');
                } else if (tok.startsWith('text-')) {
                    opts.color = opts.color || tok;
                } else if (tok.startsWith('fs-') || tok.startsWith('display-')) {
                    opts.size = opts.size || tok;
                } else {
                    cleanTokens.push(tok);
                }
            }
            if (opts.cleanName) {
                opts.name = opts.cleanName;
            } else if (cleanTokens.length > 0) {
                opts.name = cleanTokens[0];
            }
            if (cleanTokens.length > 1) {
                opts.className = (opts.className ? opts.className + ' ' : '') + cleanTokens.slice(1).join(' ');
            }
        }

        return opts;
    }

    /* ------------------------------------------------------------------
       4. SVG ICON RENDERER
    ------------------------------------------------------------------ */
    function renderSvg(rawSvg, opts) {
        if (!rawSvg) return '';
        var svg = rawSvg.trim();

        // 1. Process Size
        if (opts.size) {
            var px = null;
            if (typeof opts.size === 'number') {
                px = opts.size;
            } else if (SIZE_PIXEL_MAP[opts.size]) {
                px = SIZE_PIXEL_MAP[opts.size];
            } else if (typeof opts.size === 'string' && /^\d+(px)?$/.test(opts.size)) {
                px = parseInt(opts.size, 10);
            }

            if (px !== null) {
                if (/width="[^"]*"/.test(svg)) {
                    svg = svg.replace(/width="[^"]*"/, 'width="' + px + '"');
                } else {
                    svg = svg.replace('<svg ', '<svg width="' + px + '" ');
                }
                if (/height="[^"]*"/.test(svg)) {
                    svg = svg.replace(/height="[^"]*"/, 'height="' + px + '"');
                } else {
                    svg = svg.replace('<svg ', '<svg height="' + px + '" ');
                }
            }
        }

        // 2. Process Classes & Color
        var classes = [];
        if (opts.size && SIZE_CLASS_MAP[opts.size]) {
            classes.push(SIZE_CLASS_MAP[opts.size]);
        } else if (typeof opts.size === 'string' && (opts.size.startsWith('fs-') || opts.size.startsWith('icon-'))) {
            classes.push(opts.size);
        }

        if (opts.color && opts.color.startsWith('text-')) {
            classes.push(opts.color);
        }

        if (opts.className) {
            classes.push(opts.className);
        }

        if (classes.length > 0) {
            if (/class="[^"]*"/.test(svg)) {
                svg = svg.replace(/class="([^"]*)"/, function (match, existingClasses) {
                    var existingList = existingClasses.split(/\s+/);
                    classes.forEach(function (c) {
                        if (existingList.indexOf(c) === -1) {
                            existingList.push(c);
                        }
                    });
                    return 'class="' + existingList.join(' ') + '"';
                });
            } else {
                svg = svg.replace('<svg ', '<svg class="' + classes.join(' ') + '" ');
            }
        }

        // 3. Process Color styling if raw hex/rgb
        if (opts.color && !opts.color.startsWith('text-')) {
            var styleAttr = 'color: ' + opts.color + ';';
            if (/style="[^"]*"/.test(svg)) {
                svg = svg.replace(/style="([^"]*)"/, 'style="$1 ' + styleAttr + '"');
            } else {
                svg = svg.replace('<svg ', '<svg style="' + styleAttr + '" ');
            }
        }

        // 4. Process Attributes (id, data-ref, title, aria-hidden, attrs)
        var attrs = [];
        if (opts.id && !/id="[^"]*"/.test(svg)) attrs.push('id="' + opts.id + '"');
        if (opts.dataRef && !/data-ref="[^"]*"/.test(svg)) attrs.push('data-ref="' + opts.dataRef + '"');
        if (opts.title && !/<title>/.test(svg)) attrs.push('title="' + opts.title + '"');
        if (opts.ariaHidden !== false && !/aria-hidden="[^"]*"/.test(svg)) attrs.push('aria-hidden="true"');

        if (opts.attrs) {
            if (typeof opts.attrs === 'string') {
                attrs.push(opts.attrs);
            } else if (typeof opts.attrs === 'object') {
                Object.keys(opts.attrs).forEach(function (k) {
                    attrs.push(k + '="' + opts.attrs[k] + '"');
                });
            }
        }

        if (attrs.length > 0) {
            svg = svg.replace('<svg ', '<svg ' + attrs.join(' ') + ' ');
        }

        return svg;
    }

    /* ------------------------------------------------------------------
       5. FONTAWESOME ICON RENDERER
    ------------------------------------------------------------------ */
    function renderFontAwesome(opts) {
        var rawName = (opts.name || '').toLowerCase().trim();

        // Strip any leading fa-
        var cleanName = rawName.replace(/^fa-/, '');

        // Determine variant: solid, regular, brands
        var variant = opts.variant || opts.type;
        if (!variant) {
            variant = REGULAR_ICONS[cleanName] ? 'regular' : 'solid';
        }
        variant = variant.replace(/^fa-/, '');

        var prefix = 'fa-' + variant;
        var iconClass = 'fa-' + cleanName;

        // Determine size class or style
        var sizeClass = '';
        var inlineStyle = '';

        if (opts.size) {
            if (SIZE_CLASS_MAP[opts.size]) {
                sizeClass = SIZE_CLASS_MAP[opts.size];
            } else if (typeof opts.size === 'string' && (opts.size.startsWith('fs-') || opts.size.startsWith('display-') || opts.size.startsWith('icon-'))) {
                sizeClass = opts.size;
            } else if (typeof opts.size === 'number' || (typeof opts.size === 'string' && /^\d+(px)?$/.test(opts.size))) {
                var px = typeof opts.size === 'number' ? opts.size + 'px' : (opts.size.endsWith('px') ? opts.size : opts.size + 'px');
                inlineStyle += 'font-size: ' + px + ';';
            }
        }

        // Determine color class or style
        var colorClass = '';
        if (opts.color) {
            if (opts.color.startsWith('text-')) {
                colorClass = opts.color;
            } else {
                inlineStyle += 'color: ' + opts.color + ';';
            }
        }

        // Combine classes
        var classes = [prefix, iconClass];
        if (sizeClass) classes.push(sizeClass);
        if (colorClass) classes.push(colorClass);
        if (opts.className) classes.push(opts.className);

        // Build HTML attributes
        var attrList = [];
        if (opts.id) attrList.push('id="' + opts.id + '"');
        if (opts.dataRef) attrList.push('data-ref="' + opts.dataRef + '"');
        if (opts.title) attrList.push('title="' + opts.title + '"');
        if (opts.ariaHidden !== false && !opts.title) attrList.push('aria-hidden="true"');
        if (inlineStyle) attrList.push('style="' + inlineStyle + '"');

        if (opts.attrs) {
            if (typeof opts.attrs === 'string') {
                attrList.push(opts.attrs);
            } else if (typeof opts.attrs === 'object') {
                Object.keys(opts.attrs).forEach(function (k) {
                    attrList.push(k + '="' + opts.attrs[k] + '"');
                });
            }
        }

        var attrStr = attrList.length > 0 ? ' ' + attrList.join(' ') : '';
        return '<i class="' + classes.join(' ') + '"' + attrStr + '></i>';
    }

    /* ------------------------------------------------------------------
       6. CORE CENTRAL RENDERER: renderIcon
    ------------------------------------------------------------------ */
    function renderIcon(nameOrOpts, maybeSize, maybeColor, maybeClass) {
        var opts = normalizeOptions(nameOrOpts, maybeSize, maybeColor, maybeClass);
        if (!opts || !opts.name) return '';

        // Check if an SVG icon exists for this name
        var svg = getRegisteredSvg(opts.name);
        if (svg) {
            return renderSvg(svg, opts);
        }

        // Fallback to FontAwesome icon
        return renderFontAwesome(opts);
    }

    /* ------------------------------------------------------------------
       7. DOM ELEMENT & UPDATE HELPERS
    ------------------------------------------------------------------ */
    function createIconElement(nameOrOpts, maybeSize, maybeColor, maybeClass) {
        var html = renderIcon(nameOrOpts, maybeSize, maybeColor, maybeClass);
        if (!html) return null;

        if (typeof document !== 'undefined') {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = html.trim();
            return wrapper.firstElementChild;
        }
        return null;
    }

    function updateIcon(el, nameOrOpts, maybeSize, maybeColor, maybeClass) {
        if (!el) return null;

        var opts = normalizeOptions(nameOrOpts, maybeSize, maybeColor, maybeClass);

        // If target is an app-icon custom element, update its attributes
        if (el.tagName && el.tagName.toLowerCase() === 'app-icon') {
            if (opts.name) el.setAttribute('name', opts.name);
            if (opts.variant) el.setAttribute('variant', opts.variant);
            if (opts.size) el.setAttribute('size', opts.size);
            if (opts.color) el.setAttribute('color', opts.color);
            if (opts.className) el.setAttribute('class-name', opts.className);
            if (opts.title) el.setAttribute('title', opts.title);
            if (typeof el.render === 'function') el.render();
            return el;
        }

        // If target is a standard <i> element and options specify a FontAwesome icon
        if (el.tagName && el.tagName.toLowerCase() === 'i' && !getRegisteredSvg(opts.name)) {
            var rawHtml = renderFontAwesome(opts);
            var m = rawHtml.match(/class="([^"]*)"/);
            if (m && m[1]) {
                el.className = m[1];
            }
            if (opts.id) el.id = opts.id;
            if (opts.title) el.title = opts.title;
            return el;
        }

        // Otherwise replace element with newly rendered icon
        var newEl = createIconElement(opts);
        if (newEl && el.parentNode) {
            el.parentNode.replaceChild(newEl, el);
            return newEl;
        }
        return el;
    }

    /* ------------------------------------------------------------------
       8. REGISTER CUSTOM ELEMENT: <app-icon>
    ------------------------------------------------------------------ */
    if (typeof window !== 'undefined' && typeof window.customElements !== 'undefined' && typeof HTMLElement !== 'undefined') {
        if (!customElements.get('app-icon')) {
            var AppIcon = class extends HTMLElement {
                static get observedAttributes() {
                    return ['name', 'variant', 'type', 'size', 'color', 'class-name', 'title', 'class'];
                }
                connectedCallback() {
                    this.render();
                }
                attributeChangedCallback(attrName, oldVal, newVal) {
                    if (attrName === 'class' && newVal && oldVal !== newVal) {
                        var tokens = newVal.trim().split(/\s+/);
                        for (var i = 0; i < tokens.length; i++) {
                            var t = tokens[i];
                            if (t === 'fa-solid' || t === 'fa-regular' || t === 'fa-brands') {
                                this.setAttribute('variant', t.replace('fa-', ''));
                            } else if (t.startsWith('fa-')) {
                                this.setAttribute('name', t.replace('fa-', ''));
                            } else if (t.startsWith('text-')) {
                                this.setAttribute('color', t);
                            } else if (t.startsWith('fs-') || t.startsWith('display-')) {
                                this.setAttribute('size', t);
                            }
                        }
                    }
                    this.render();
                }
                render() {
                    var name = this.getAttribute('name');
                    if (!name) return;
                    var variant = this.getAttribute('variant') || this.getAttribute('type');
                    var size = this.getAttribute('size');
                    var color = this.getAttribute('color');
                    var className = this.getAttribute('class-name') || '';
                    var title = this.getAttribute('title');

                    this.innerHTML = renderIcon({
                        name: name,
                        variant: variant,
                        size: size,
                        color: color,
                        className: className,
                        title: title
                    });
                }
            };
            customElements.define('app-icon', AppIcon);
        }
    }

    /* ------------------------------------------------------------------
       9. EXPORTS & GLOBAL ASSIGNMENT
    ------------------------------------------------------------------ */
    var Icon = {
        render: renderIcon,
        create: createIconElement,
        createElement: createIconElement,
        update: updateIcon,
        getSvg: getRegisteredSvg,
        registerSvg: function (name, svgString) {
            if (name && svgString) {
                SVG_REGISTRY[name.toLowerCase()] = svgString;
            }
        },
        registry: SVG_REGISTRY
    };

    window.Icon = Icon;
    window.renderIcon = renderIcon;
    window.createIconElement = createIconElement;
    window.updateIcon = updateIcon;

})(typeof window !== 'undefined' ? window : global);
