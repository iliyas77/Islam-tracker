/* ============================================================
   Nur Prayer — Reusable Global Icon Component (Knockout.js)
   Path: components/icon/icon.js
   Centralized, DRY iconography component for all application modules.
   Supports Font Awesome 6, SVG sprites/inline, dynamic observables,
   Tailwind sizing/colors, inline styles, IDs, and a11y attributes.
   ============================================================ */
'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['knockout'], factory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory(require('knockout'));
    } else {
        root.AppIcon = factory(root.ko);
    }
}(typeof self !== 'undefined' ? self : this, function (ko) {
    var SIZE_MAP = {
        'xs': 'text-xs',
        'sm': 'text-sm',
        'small': 'text-sm',
        'base': 'text-base',
        'md': 'text-base',
        'medium': 'text-base',
        'lg': 'text-lg',
        'large': 'text-lg',
        'xl': 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
    };

    var PREFIX_MAP = {
        'solid': 'fa-solid',
        'regular': 'fa-regular',
        'brands': 'fa-brands',
        'light': 'fa-light',
        'thin': 'fa-thin',
        'duotone': 'fa-duotone'
    };

    // Template configuration referencing standalone components/icon/icon.html
    var ICON_TEMPLATE_CONFIG = {
        element: 'app-icon-template',
        file: 'components/icon/icon.html'
    };

    function IconViewModel(params) {
        params = params || {};
        var self = this;

        function unwrap(val) {
            return ko.isObservable(val) ? val() : val;
        }

        self.isSvg = ko.pureComputed(function () {
            var raw = unwrap(params.type) || unwrap(params.isSvg) || unwrap(params.svg);
            return !!(raw === 'svg' || raw === true || unwrap(params.svgHref));
        });

        self.svgHref = ko.pureComputed(function () {
            return unwrap(params.svgHref) || unwrap(params.href) || '';
        });

        self.svgViewBox = ko.pureComputed(function () {
            return unwrap(params.viewBox) || '0 0 24 24';
        });

        self.id = ko.pureComputed(function () {
            return unwrap(params.id) || null;
        });

        self.dataRef = ko.pureComputed(function () {
            return unwrap(params.dataRef || params['data-ref']) || null;
        });

        self.ariaLabel = ko.pureComputed(function () {
            return unwrap(params.ariaLabel || params.label || params['aria-label']) || null;
        });

        self.role = ko.pureComputed(function () {
            return self.ariaLabel() ? 'img' : null;
        });

        self.ariaHidden = ko.pureComputed(function () {
            var explicit = unwrap(params.ariaHidden || params['aria-hidden']);
            if (explicit !== undefined && explicit !== null) {
                return String(explicit);
            }
            return self.ariaLabel() ? 'false' : 'true';
        });

        self.computedClass = ko.pureComputed(function () {
            var rawName = unwrap(params.name) || unwrap(params.icon) || '';
            var rawPrefix = unwrap(params.prefix) || 'fa-solid';
            var size = unwrap(params.size) || '';
            var color = unwrap(params.color) || '';
            var customClass = unwrap(params.customClass || params['class']) || '';

            var classes = [];

            // Resolve prefix
            var resolvedPrefix = PREFIX_MAP[rawPrefix] || rawPrefix;

            // Resolve name
            if (rawName) {
                if (rawName.indexOf('fa-solid') !== -1 || rawName.indexOf('fa-regular') !== -1 || rawName.indexOf('fa-brands') !== -1) {
                    classes.push(rawName);
                } else if (rawName.indexOf('fa-') === 0) {
                    classes.push(resolvedPrefix);
                    classes.push(rawName);
                } else {
                    classes.push(resolvedPrefix);
                    classes.push('fa-' + rawName);
                }
            }

            // Resolve size
            if (size) {
                if (SIZE_MAP[size]) {
                    classes.push(SIZE_MAP[size]);
                } else if (typeof size === 'string' && (size.indexOf('text-') === 0 || size.indexOf('icon-') === 0)) {
                    classes.push(size);
                }
            }

            // Resolve color (if Tailwind CSS class)
            if (color && typeof color === 'string' && (color.indexOf('text-') === 0 || color.indexOf('text[') === 0)) {
                classes.push(color);
            }

            // Resolve customClass
            if (customClass) {
                classes.push(customClass);
            }

            return classes.join(' ').trim();
        });

        self.computedStyle = ko.pureComputed(function () {
            var rawStyle = unwrap(params.style);
            var color = unwrap(params.color);
            var size = unwrap(params.size);

            var styles = [];

            if (typeof rawStyle === 'string' && rawStyle.trim()) {
                styles.push(rawStyle.trim().replace(/;?$/, ';'));
            }

            // Color as hex/rgb/var
            if (color && typeof color === 'string' && (color.indexOf('#') === 0 || color.indexOf('rgb') === 0 || color.indexOf('var(') === 0)) {
                styles.push('color: ' + color + ';');
            }

            // Sizing as px/rem/em/number
            if (typeof size === 'number') {
                styles.push('font-size: ' + size + 'px;');
            } else if (typeof size === 'string' && (size.indexOf('px') !== -1 || size.indexOf('rem') !== -1 || size.indexOf('em') !== -1) && size.indexOf('text-') === -1) {
                styles.push('font-size: ' + size + ';');
            }

            return styles.length ? styles.join(' ') : null;
        });
    }

    function register(customKo) {
        var k = customKo || (typeof window !== 'undefined' ? window.ko : (typeof ko !== 'undefined' ? ko : null));
        if (!k || !k.components) return;

        if (!k.components.isRegistered('app-icon')) {
            k.components.register('app-icon', {
                viewModel: IconViewModel,
                template: ICON_TEMPLATE_CONFIG
            });
        }

        if (!k.components.isRegistered('icon')) {
            k.components.register('icon', {
                viewModel: IconViewModel,
                template: ICON_TEMPLATE_CONFIG
            });
        }
    }

    // Auto-register if Knockout is available globally
    if (typeof window !== 'undefined' && window.ko) {
        register(window.ko);
    }

    return {
        viewModel: IconViewModel,
        template: ICON_TEMPLATE_CONFIG,
        register: register
    };
}));

