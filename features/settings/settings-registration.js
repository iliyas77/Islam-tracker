/* ============================================================
   Nur Prayer — Settings Component Registration
   Path: features/settings/settings-registration.js
   Responsibilities:
     - Centralizes ALL Knockout component registrations for Settings feature
     - Registers canonical modular components:
       settings-prayer-times, settings-start-date, settings-font-size, settings-backup, settings-page
     - Maintains backward-compatibility aliases for legacy templates
   ============================================================ */
'use strict';

/* ---------- Template Definitions ---------- */
export const SettingsPageTemplate = { element: 'settings-page-template', file: 'features/settings/settings.html' };
export const SettingsCardHeaderTemplate = { element: 'settings-card-header-template', file: 'features/settings/templates/settings-card-header.html' };
export const SettingsFontSizeBtnTemplate = { element: 'settings-font-size-btn-template', file: 'features/settings/templates/settings-font-size-btn.html' };
export const SettingsInfoCardTemplate = { element: 'settings-info-card-template', file: 'features/settings/templates/settings-info-card.html' };

import {
    SettingsViewModel,
    getSettingsViewModel,
    initSettings,
    rSET,
    SettingsApp
} from './settings.js';

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

import { registerComponent } from '../../components/component-helper.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

// Re-export for backward compatibility
export {
    SettingsViewModel,
    getSettingsViewModel,
    initSettings,
    rSET,
    SettingsApp
};

/**
 * Register all Settings Knockout components
 * @param {Object} [customKo] - Optional Knockout instance (for testing or isolation)
 */
export function registerSettingsComponents(customKo) {
    // 1. Modular Subcomponents
    registerComponent('settings-prayer-times', SettingsPrayerTimesViewModel, SettingsPrayerTimesTemplate, customKo);
    registerComponent('settings-start-date', SettingsStartDateViewModel, SettingsStartDateTemplate, customKo);
    registerComponent('settings-font-size', SettingsFontSizeViewModel, SettingsFontSizeTemplate, customKo);
    registerComponent('settings-backup', SettingsBackupViewModel, SettingsBackupTemplate, customKo);

    // 2. Main Settings Page Component
    registerComponent('settings-page', function (params) {
        if (params && params.viewModel) return params.viewModel;
        if (params && params.prayerTimes) return params;
        if (params && params.settings) return params.settings;
        return getSettingsViewModel();
    }, SettingsPageTemplate, customKo);

    // 3. Backward-Compatibility Template Aliases
    registerComponent('settings-card-header', function (p) {
        return (p && p.header) ? p.header : p;
    }, SettingsCardHeaderTemplate, customKo);

    registerComponent('settings-font-size-btn', function (p) {
        return (p && p.button) ? p.button : p;
    }, SettingsFontSizeBtnTemplate, customKo);

    registerComponent('settings-info-card', function (p) {
        return (p && p.info) ? p.info : p;
    }, SettingsInfoCardTemplate, customKo);
}

if (typeof window !== 'undefined') {
    window.registerSettingsComponents = registerSettingsComponents;
}

export default registerSettingsComponents;

