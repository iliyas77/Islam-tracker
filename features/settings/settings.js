/* ============================================================
   Nur Prayer — Settings Feature Module & Root ViewModel
   Path: features/settings/settings.js
   Responsibilities:
     - Root ViewModel orchestrating subcomponents:
       settings-prayer-times, settings-start-date, settings-font-size, settings-backup
     - Feature coordinator and lifecycle (initSettings, rSET)
     - Centralizes SettingsApp facade interface
     - Preserves all backward-compatibility properties and aliases
   ============================================================ */
'use strict';

import {
    SettingsService,
    getPrayerConfig,
    savePrayerConfig,
    getStartDate,
    saveStartDate,
    getFontSize,
    applyFontSize,
    resetDatabase,
    INDIAN_CITIES,
    CUSTOM_CITY_VALUE,
    FONT_SIZE_OPTIONS,
    DEFAULT_SETTINGS_CONFIG
} from './settings-service.js';

import {
    SettingsPrayerTimesTemplate,
    SettingsPrayerTimesViewModel
} from './components/settings-prayer-times/settings-prayer-times.js';

import {
    SettingsStartDateTemplate,
    SettingsStartDateViewModel
} from './components/settings-start-date/settings-start-date.js';

import {
    SettingsFontSizeTemplate,
    SettingsFontSizeViewModel
} from './components/settings-font-size/settings-font-size.js';

import {
    SettingsBackupTemplate,
    SettingsBackupViewModel
} from './components/settings-backup/settings-backup.js';

import {
    registerSettingsComponents
} from './settings-registration.js';

// Re-export modular components and layers
export * from './settings-service.js';
export { registerSettingsComponents } from './settings-registration.js';
export * from './components/settings-prayer-times/settings-prayer-times.js';
export * from './components/settings-start-date/settings-start-date.js';
export * from './components/settings-font-size/settings-font-size.js';
export * from './components/settings-backup/settings-backup.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Template Definitions (re-exported from settings-registration.js) ---------- */
export {
    SettingsPageTemplate,
    SettingsCardHeaderTemplate,
    SettingsFontSizeBtnTemplate,
    SettingsInfoCardTemplate
} from './settings-registration.js';

/* ---------- Settings Root ViewModel ---------- */
var settingsViewModelInstance = null;

export function getSettingsViewModel() {
    if (!settingsViewModelInstance && typeof SettingsViewModel === 'function') {
        settingsViewModelInstance = new SettingsViewModel();
    }
    return settingsViewModelInstance;
}

export function SettingsViewModel() {
    var self = this;
    var k = _ko;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    // 1. Child Sub-ViewModels
    self.prayerTimes = new SettingsPrayerTimesViewModel();
    self.startDateParams = new SettingsStartDateViewModel();
    self.fontSizeParams = new SettingsFontSizeViewModel();
    self.backupParams = new SettingsBackupViewModel();

    // 2. Direct References & Compatibility Bindings
    self.selectedCity = self.prayerTimes.selectedCity;
    self.customCity = self.prayerTimes.customCity;
    self.country = self.prayerTimes.country;
    self.school = self.prayerTimes.school;
    self.isCustomCity = self.prayerTimes.isCustomCity;
    self.cityOptions = self.prayerTimes.cityOptions;
    self.startDate = self.startDateParams.startDate;
    self.currentFontSize = self.fontSizeParams.currentFontSize;
    self.fontSizeButtons = self.fontSizeParams.buttons;

    self.goHome = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof _win.showPage === 'function') _win.showPage('dashboard');
    };

    self.savePrayerTimes = function (d, e) {
        return self.prayerTimes.savePrayerTimes(d, e);
    };

    self.saveStartDate = function (d, e) {
        return self.startDateParams.saveStartDate(d, e);
    };

    self.resetDatabase = function (d, e) {
        return self.backupParams.handleResetDatabase(d, e);
    };

    // 3. Backward-Compatibility Header Objects
    self.prayerTimesHeader = {
        icon: 'fa-solid fa-mosque text-xl',
        iconBoxClass: 'icon-box icon-box-lg bg-brand-light',
        iconDataRef: 'page.settings.prayer-times.icon-badge',
        infoDataRef: 'page.settings.prayer-times.info',
        title: 'Prayer Times Location',
        titleClass: 'font-bold text-sm text-brand',
        titleDataRef: 'page.settings.prayer-times.title',
        subtitle: self.prayerTimes.locationSubtitle,
        subtitleId: 'ptLocationSubtitle',
        subtitleDataRef: 'page.settings.prayer-times.subtitle',
        showStatusBadge: true,
        statusBadgeId: 'ptStatusBadge',
        statusBadgeDataRef: 'page.settings.prayer-times.status-badge',
        statusTextId: 'ptStatusText',
        statusText: self.prayerTimes.statusText,
        headerDataRef: 'page.settings.prayer-times.header',
        headerClass: 'flex items-center gap-3 mb-3'
    };

    self.startDateHeader = {
        icon: 'fa-solid fa-calendar-check text-xl',
        iconBoxClass: 'icon-box icon-box-lg bg-brand-light text-brand',
        iconDataRef: 'page.settings.start-date.icon-badge',
        infoDataRef: 'page.settings.start-date.info',
        title: 'Current Start Date',
        titleClass: 'font-bold text-sm',
        titleDataRef: 'page.settings.start-date.title',
        subtitle: null,
        showStatusBadge: false,
        headerDataRef: 'page.settings.start-date.header',
        headerClass: 'flex items-center gap-3 mb-3'
    };

    self.fontSizeHeader = {
        icon: null,
        iconText: 'Aa',
        iconBoxClass: 'icon-box icon-box-lg bg-brand-light text-gr-accent font-bold text-base',
        iconDataRef: 'page.settings.font-size.icon-badge',
        infoDataRef: 'page.settings.font-size.info',
        title: 'Font Size',
        titleClass: 'font-bold text-sm',
        titleDataRef: 'page.settings.font-size.title',
        subtitle: null,
        showStatusBadge: false,
        headerDataRef: 'page.settings.font-size.header',
        headerClass: 'flex items-center gap-3 mb-3'
    };

    self.resetDbHeader = {
        icon: 'fa-solid fa-triangle-exclamation text-xl',
        iconBoxClass: 'icon-box icon-box-lg bg-danger-subtle text-gr-danger',
        iconDataRef: 'page.settings.reset.icon-badge',
        infoDataRef: 'page.settings.reset.info',
        title: 'Reset Database',
        titleClass: 'font-bold text-sm',
        titleDataRef: 'page.settings.reset.title',
        subtitle: obs('This will delete all prayer data, old data and cache.'),
        subtitleDataRef: 'page.settings.reset.subtitle',
        showStatusBadge: false,
        headerDataRef: 'page.settings.reset.header',
        headerClass: 'flex items-center gap-3 mb-2'
    };

    self.storageInfo = {
        cardDataRef: 'page.settings.info.card',
        contentDataRef: 'page.settings.info.content',
        iconBoxClass: 'icon-box icon-box-sm bg-brand text-white',
        iconDataRef: 'page.settings.info.icon',
        icon: 'fa-solid fa-circle-info text-sm',
        text: 'All changes are saved automatically in your device (localStorage).',
        textDataRef: 'page.settings.info.text'
    };
}

/* ---------- Settings Render & Sync ---------- */
export function rSET() {
    var vm = getSettingsViewModel();
    var fs = getFontSize();
    var sdate = getStartDate();
    var cfg = getPrayerConfig();

    if (vm) {
        if (typeof vm.currentFontSize === 'function') vm.currentFontSize(fs);
        if (typeof vm.startDate === 'function') vm.startDate(sdate);
        if (typeof vm.school === 'function') vm.school(String(cfg.school !== undefined ? cfg.school : 1));
        if (typeof vm.country === 'function') vm.country(cfg.country || 'India');

        var isPredefined = (INDIAN_CITIES || []).some(function (c) {
            return c.name.toLowerCase() === (cfg.city || '').toLowerCase();
        });
        if (typeof vm.selectedCity === 'function') {
            vm.selectedCity(isPredefined ? cfg.city : CUSTOM_CITY_VALUE);
        }
        if (typeof vm.customCity === 'function') {
            vm.customCity(isPredefined ? '' : (cfg.city || ''));
        }
    }
}

/* ---------- Settings Initialization ---------- */
export function initSettings() {
    registerSettingsComponents();
    var el = (_win.document && typeof _win.document.getElementById === 'function')
        ? _win.document.getElementById('settingsPage')
        : null;

    if (_win.document && !_win.document.getElementById('app') && el && typeof ko !== 'undefined') {
        var vm = getSettingsViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    rSET();
}

export var settingsViewModel = settingsViewModelInstance;

export const SettingsApp = {
    init: initSettings,
    render: rSET,
    getViewModel: getSettingsViewModel,
    registerComponents: registerSettingsComponents
};

// Minimal window bridge for legacy scripts
if (typeof window !== 'undefined') {
    window.SettingsApp = SettingsApp;
    window.rSET = rSET;
    window.initSettings = initSettings;
    window.SettingsViewModel = SettingsViewModel;
    window.getSettingsViewModel = getSettingsViewModel;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSettings: initSettings,
        rSET: rSET,
        registerSettingsComponents: registerSettingsComponents,
        SettingsViewModel: SettingsViewModel,
        getSettingsViewModel: getSettingsViewModel,
        SettingsApp: SettingsApp
    };
    module.exports.default = SettingsApp;
}

try { registerSettingsComponents(); } catch (_) {}

export default SettingsApp;
