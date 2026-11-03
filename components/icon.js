/* ============================================================
   Nur Prayer — Centralized Reusable Icon Component
   Path: components/icon.js
   Centralized icon renderer for SVG icons.
   Supports consistent properties: name, size, color,
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
        // Icon registry — inline SVGs, self-contained SVG icon system
        'arrow-left': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
        'arrow-right': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        'arrow-rotate-left': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
        'arrows-rotate': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
        'bullseye': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'calendar-check': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/></svg>',
        'calendar-days': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
        'calendar-plus': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/></svg>',
        'calendar-week': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h8"/></svg>',
        'calendar-xmark': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 15l6 6M15 15l-6 6"/></svg>',
        'chart-simple': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6" fill="currentColor" stroke="none"/><rect x="12" y="8" width="3" height="10" fill="currentColor" stroke="none"/><rect x="17" y="5" width="3" height="13" fill="currentColor" stroke="none"/></svg>',
        'check': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
        'chevron-left': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
        'chevron-right': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
        'circle-check': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
        'circle-dot': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>',
        'circle-exclamation': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
        'circle-info': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
        'clipboard-list': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/></svg>',
        'clock': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
        'clock-rotate-left': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></svg>',
        'file-lines': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
        'gear': '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.48.48 0 0 0 14 2.3h-4a.48.48 0 0 0-.48.41l-.38 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.62 8.77c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h4c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
        'hand-holding-heart': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="M7 20l1.6-1.4c.4-.4.9-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="M2 15l6 6"/></svg>',
        'hashtag': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>',
        'house': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
        'info': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
        'list-check': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6h10M11 12h10M11 18h10"/><path d="M3 6l2 2 4-4M3 12l2 2 4-4M3 18l2 2 4-4"/></svg>',
        'location-dot': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
        'pen': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="M15 5l4 4"/></svg>',
        'play': '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>',
        'plus': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
        'rotate-left': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
        'star': '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
        'trash': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>',
        'triangle-exclamation': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
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
            if (key === 'drawing-pin'   && sc.SHARED && sc.SHARED.DRAWING_PIN)  return sc.SHARED.DRAWING_PIN;
            if (key === 'book'          && sc.SHARED && sc.SHARED.BOOK)         return sc.SHARED.BOOK;
            if (key === 'all-bookmark'  && sc.SHARED && sc.SHARED.ALL_BOOKMARK) return sc.SHARED.ALL_BOOKMARK;
            if (key === 'rub-el-hizb' && sc.DASHBOARD && sc.DASHBOARD.RUB_EL_HIZB) return sc.DASHBOARD.RUB_EL_HIZB;
            if (key === 'tracker' && sc.DASHBOARD && sc.DASHBOARD.TRACKER) return sc.DASHBOARD.TRACKER;
            if ((key === 'duas' || key === 'duas-icon') && sc.DASHBOARD && sc.DASHBOARD.DUAS) return sc.DASHBOARD.DUAS;
            if ((key === 'settings' || key === 'settings-gear') && sc.DASHBOARD && sc.DASHBOARD.SETTINGS) return sc.DASHBOARD.SETTINGS;
            if (key === 'dash-chevron' && sc.DASHBOARD && sc.DASHBOARD.CHEVRON) return sc.DASHBOARD.CHEVRON;
            if (key === 'corner-tl' && sc.DASHBOARD && sc.DASHBOARD.CORNER_TL) return sc.DASHBOARD.CORNER_TL;
            if (key === 'corner-tr' && sc.DASHBOARD && sc.DASHBOARD.CORNER_TR) return sc.DASHBOARD.CORNER_TR;
            if (key === 'timeline-alarm' && sc.DASHBOARD && sc.DASHBOARD.TIMELINE_ALARM)
                return sc.DASHBOARD.TIMELINE_ALARM;
            if (key === 'tb-chevron' && sc.TASBEEH && sc.TASBEEH.CHEVRON) return sc.TASBEEH.CHEVRON;
            if (key === 'tb-group-toggle-down' && sc.TASBEEH && sc.TASBEEH.GROUP_TOGGLE_DOWN) return sc.TASBEEH.GROUP_TOGGLE_DOWN;
            if (key === 'tb-group-toggle-collapsed' && sc.TASBEEH && sc.TASBEEH.GROUP_TOGGLE_COLLAPSED) return sc.TASBEEH.GROUP_TOGGLE_COLLAPSED;
        }

        // 3. Check window.CONSTANTS
        var c = window.CONSTANTS;
        if (c) {
            if (c.PRAYER && c.PRAYER.ICONS) {
                var pKey = key.charAt(0).toUpperCase() + key.slice(1);
                if (c.PRAYER.ICONS[pKey]) return c.PRAYER.ICONS[pKey];
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

        if (typeof opts.name === 'string' && opts.name.includes(' ')) {
            var tokens = opts.name.trim().split(/\s+/);
            var cleanTokens = [];
            for (var i = 0; i < tokens.length; i++) {
                var tok = tokens[i];
                if (tok.startsWith('text-')) {
                    opts.color = opts.color || tok;
                } else if (tok.startsWith('fs-') || tok.startsWith('display-')) {
                    opts.size = opts.size || tok;
                } else {
                    cleanTokens.push(tok);
                }
            }
            if (cleanTokens.length > 0) {
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
       5. CORE CENTRAL RENDERER: renderIcon
    ------------------------------------------------------------------ */
    function renderIcon(nameOrOpts, maybeSize, maybeColor, maybeClass) {
        var opts = normalizeOptions(nameOrOpts, maybeSize, maybeColor, maybeClass);
        if (!opts || !opts.name) return '';

        // Check if an SVG icon exists for this name
        var svg = getRegisteredSvg(opts.name);
        if (svg) {
            return renderSvg(svg, opts);
        }

        if (typeof console !== 'undefined' && console.warn) {
            console.warn('[Icon] No SVG registered for:', opts.name,
                         '— add an SVG to SVG_REGISTRY.');
        }
        return '';
    }

    /* ------------------------------------------------------------------
       6. DOM ELEMENT & UPDATE HELPERS
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
            if (opts.size) el.setAttribute('size', opts.size);
            if (opts.color) el.setAttribute('color', opts.color);
            if (opts.className) el.setAttribute('class-name', opts.className);
            if (opts.title) el.setAttribute('title', opts.title);
            if (typeof el.render === 'function') el.render();
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
       7. REGISTER CUSTOM ELEMENT: <app-icon>
    ------------------------------------------------------------------ */
    if (typeof window !== 'undefined' && typeof window.customElements !== 'undefined' && typeof HTMLElement !== 'undefined') {
        if (!customElements.get('app-icon')) {
            var AppIcon = class extends HTMLElement {
                static get observedAttributes() {
                    return ['name', 'size', 'color', 'class-name', 'title', 'class'];
                }
                connectedCallback() {
                    this.render();
                }
                attributeChangedCallback(attrName, oldVal, newVal) {
                    if (attrName === 'class' && newVal && oldVal !== newVal) {
                        var tokens = newVal.trim().split(/\s+/);
                        for (var i = 0; i < tokens.length; i++) {
                            var t = tokens[i];
                            if (t.startsWith('text-')) {
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
                    var size = this.getAttribute('size');
                    var color = this.getAttribute('color');
                    var className = this.getAttribute('class-name') || '';
                    var title = this.getAttribute('title');

                    this.innerHTML = renderIcon({
                        name: name,
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
       8. EXPORTS & GLOBAL ASSIGNMENT
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
