/* ============================================================
   Nur Prayer — Settings Font Size Component
   Path: features/settings/components/settings-font-size/settings-font-size.js
   Responsibilities:
     - Owns font scaling buttons (Small, Medium, Large)
     - Applies typography scaling to document root
   ============================================================ */
'use strict';

import { FONT_SIZE_OPTIONS, getFontSize, applyFontSize, unwrap } from '../../settings-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const SettingsFontSizeTemplate = {
    element: 'settings-font-size-template',
    file: 'features/settings/components/settings-font-size/settings-font-size.html'
};

var BTN_ACTIVE = 'flex-1 py-3 font-bold rounded-xl text-sm bg-brand text-white border border-brand transition-all cursor-pointer';
var BTN_INACTIVE = 'flex-1 py-3 font-bold rounded-xl text-sm bg-surfaceBg text-brand border border-borderGrey hover:bg-brand-light transition-all cursor-pointer';

export function SettingsFontSizeViewModel(params) {
    if (params instanceof SettingsFontSizeViewModel) return params;
    if (!(this instanceof SettingsFontSizeViewModel)) return new SettingsFontSizeViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    var store = _win.SettingsStore || null;
    self.currentFontSize = (store && k && k.isObservable(store.fontScale))
        ? store.fontScale
        : obs(getFontSize());

    self.getButtonClass = function (size) {
        var curr = unwrap(self.currentFontSize, 1.0);
        var active = Math.abs(curr - size) < 0.01;
        return active ? BTN_ACTIVE : BTN_INACTIVE;
    };

    self.buttons = FONT_SIZE_OPTIONS.map(function (opt) {
        return {
            size: opt.value,
            label: opt.label,
            dataRef: 'page.settings.font-size.' + opt.key,
            handleClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                applyFontSize(opt.value);
                if (typeof self.currentFontSize === 'function') {
                    self.currentFontSize(opt.value);
                }
                if (typeof p.onSelect === 'function') {
                    p.onSelect(opt.value);
                }
            }
        };
    });
}

if (typeof window !== 'undefined') {
    window.SettingsFontSizeViewModel = SettingsFontSizeViewModel;
}

export default {
    template: SettingsFontSizeTemplate,
    viewModel: SettingsFontSizeViewModel
};

