/* ============================================================
   Nur Prayer — Reusable Global Icon Component (Knockout.js)
   Path: components/icon/icon.js
   Centralized, DRY iconography component for all application modules.
   Supports Font Awesome 6, SVG sprites/inline, dynamic observables,
   Tailwind sizing/colors, inline styles, IDs, and a11y attributes.
   ============================================================ */
'use strict';

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
export const IconTemplate = {
    element: 'app-icon-template',
    file: 'components/icon/icon.html'
};
export const ICON_TEMPLATE_CONFIG = IconTemplate;

export function IconViewModel(params) {
    params = params || {};
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null);

    function unwrap(val) {
        try {
            return (k && k.isObservable(val)) ? val() : val;
        } catch (_) {
            return val;
        }
    }

    function pureComputed(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.isSvg = pureComputed(function () {
        try {
            var raw = unwrap(params.type) || unwrap(params.isSvg) || unwrap(params.svg);
            return !!(raw === 'svg' || raw === true || unwrap(params.svgHref));
        } catch (_) {
            return false;
        }
    });

    self.svgHref = pureComputed(function () {
        try {
            return unwrap(params.svgHref) || unwrap(params.href) || '';
        } catch (_) {
            return '';
        }
    });

    self.svgViewBox = pureComputed(function () {
        try {
            return unwrap(params.viewBox) || '0 0 24 24';
        } catch (_) {
            return '0 0 24 24';
        }
    });

    self.id = pureComputed(function () {
        try {
            return unwrap(params.id) || null;
        } catch (_) {
            return null;
        }
    });

    self.dataRef = pureComputed(function () {
        try {
            return unwrap(params.dataRef || params['data-ref']) || null;
        } catch (_) {
            return null;
        }
    });

    self.ariaLabel = pureComputed(function () {
        try {
            return unwrap(params.ariaLabel || params.label || params['aria-label']) || null;
        } catch (_) {
            return null;
        }
    });

    self.role = pureComputed(function () {
        try {
            return self.ariaLabel() ? 'img' : null;
        } catch (_) {
            return null;
        }
    });

    self.ariaHidden = pureComputed(function () {
        try {
            var explicit = unwrap(params.ariaHidden || params['aria-hidden']);
            if (explicit !== undefined && explicit !== null) {
                return String(explicit);
            }
            return self.ariaLabel() ? 'false' : 'true';
        } catch (_) {
            return 'true';
        }
    });

    self.computedClass = pureComputed(function () {
        try {
            var rawName = unwrap(params.name) || unwrap(params.icon) || '';
            var rawPrefix = unwrap(params.prefix) || 'fa-solid';
            var size = unwrap(params.size) || '';
            var color = unwrap(params.color) || '';
            var customClass = unwrap(params.customClass || params['class']) || '';

            var classes = [];

            // Resolve prefix
            var resolvedPrefix = PREFIX_MAP[rawPrefix] || rawPrefix;

            // Resolve name
            if (rawName && typeof rawName === 'string') {
                // Strip any nested HTML tags if passed like <app-icon params="name: '...'"></app-icon> or <i class="...">
                if (rawName.indexOf('<') !== -1) {
                    var m = rawName.match(/name:\s*['"]([^'"]+)['"]/);
                    if (m) {
                        rawName = m[1];
                    } else {
                        var m2 = rawName.match(/class=['"][^'"]*fa-([a-z0-9-]+)[^'"]*['"]/);
                        if (m2) rawName = m2[1];
                    }
                }

                var globalObj = (typeof window !== 'undefined' && window) || (typeof globalThis !== 'undefined' && globalThis) || {};
                var iconMap = (globalObj && globalObj.FA_ICON_MAP) || {
                    'fajr': 'fa-solid fa-cloud-sun',
                    'dhuhr': 'fa-solid fa-sun',
                    'asr': 'fa-solid fa-sun',
                    'maghrib': 'fa-solid fa-cloud-sun',
                    'isha': 'fa-solid fa-moon'
                };
                var lower = rawName.toLowerCase().trim();
                if (iconMap[lower]) {
                    rawName = iconMap[lower];
                }

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
        } catch (err) {
            console.error('Error in IconViewModel computedClass:', err);
            return 'fa-solid fa-circle-question';
        }
    });

    self.computedStyle = pureComputed(function () {
        try {
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
        } catch (err) {
            console.error('Error in IconViewModel computedStyle:', err);
            return null;
        }
    });
}

export function register(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('app-icon')) {
        k.components.register('app-icon', {
            viewModel: IconViewModel,
            template: IconTemplate
        });
    }

    if (!k.components.isRegistered('icon')) {
        k.components.register('icon', {
            viewModel: IconViewModel,
            template: IconTemplate
        });
    }
}

// Window global fallback
const AppIcon = {
    viewModel: IconViewModel,
    template: IconTemplate,
    register: register
};

if (typeof window !== 'undefined') {
    window.AppIcon = AppIcon;
    window.IconViewModel = IconViewModel;
    window.IconTemplate = IconTemplate;
}

if (typeof module === 'object' && module.exports) {
    module.exports = AppIcon;
    module.exports.IconViewModel = IconViewModel;
    module.exports.IconTemplate = IconTemplate;
    module.exports.default = AppIcon;
}

export default AppIcon;
