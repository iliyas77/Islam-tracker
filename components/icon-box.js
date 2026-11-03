/* ============================================================
   Nur Prayer — Reusable IconBox Component
   Path: components/icon-box.js
   Pure component for rendering consistent, validated icon boxes.
   Supports size, variant, color, custom classes, title tooltip,
   and optional dataRef.
   ============================================================ */

(function (window) {
    'use strict';

    var ICON_SIZES = {
        sm: 'icon-box-sm',
        md: 'icon-box-md',
        lg: 'icon-box-lg',
        xl: 'icon-box-xl'
    };

    var ICON_VARIANTS = {
        default: '',                 // neutral mint box
        current: 'icon-current',     // dark green bg, white icon
        done:    'icon-done',        // light green bg, green icon
        missed:  'icon-missed',      // red bg, white icon
        active:  'active'            // dark green, shadow (used on timeline)
    };

    function IconBox(props) {
        props = props || {};
        var icon = props.icon;
        var size = props.size || 'md';
        var variant = props.variant || 'default';
        var color = props.color;
        var className = props.className || '';
        var title = props.title;
        var dataRef = props.dataRef || props['data-ref'];

        var sizeCls = ICON_SIZES[size] || ICON_SIZES.md;
        var variantCls = ICON_VARIANTS[variant] || '';
        var t = title ? ' title="' + title + '"' : '';
        var ref = dataRef ? ' data-ref="' + dataRef + '"' : '';
        var extra = className ? ' ' + className : '';

        var inner = (typeof icon === 'string' && (icon.trim().startsWith('<') || icon === 'Aa'))
            ? icon
            : (typeof renderIcon === 'function' ? renderIcon({ name: icon, color: color }) : (icon || ''));

        return '<div class="icon-box ' + sizeCls + (variantCls ? ' ' + variantCls : '') + extra + '"' + ref + t + '>' + inner + '</div>';
    }

    window.ICON_SIZES = ICON_SIZES;
    window.ICON_VARIANTS = ICON_VARIANTS;
    window.IconBox = IconBox;

    if (window.Icon && typeof window.Icon === 'object') {
        window.Icon.box = IconBox;
    }

})(typeof window !== 'undefined' ? window : global);

