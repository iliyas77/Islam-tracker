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
        return (k && k.isObservable(val)) ? val() : val;
    }

    function pureComputed(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.isSvg = pureComputed(function () {
        var raw = unwrap(params.type) || unwrap(params.isSvg) || unwrap(params.svg);
        return !!(raw === 'svg' || raw === true || unwrap(params.svgHref));
    });

    self.svgHref = pureComputed(function () {
        return unwrap(params.svgHref) || unwrap(params.href) || '';
    });

    self.svgViewBox = pureComputed(function () {
        return unwrap(params.viewBox) || '0 0 24 24';
    });

    self.id = pureComputed(function () {
        return unwrap(params.id) || null;
    });

    self.dataRef = pureComputed(function () {
        return unwrap(params.dataRef || params['data-ref']) || null;
    });

    self.ariaLabel = pureComputed(function () {
        return unwrap(params.ariaLabel || params.label || params['aria-label']) || null;
    });

    self.role = pureComputed(function () {
        return self.ariaLabel() ? 'img' : null;
    });

    self.ariaHidden = pureComputed(function () {
        var explicit = unwrap(params.ariaHidden || params['aria-hidden']);
        if (explicit !== undefined && explicit !== null) {
            return String(explicit);
        }
        return self.ariaLabel() ? 'false' : 'true';
    });

    self.computedClass = pureComputed(function () {
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

    self.computedStyle = pureComputed(function () {
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
