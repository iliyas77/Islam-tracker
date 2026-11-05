/* ============================================================
   Nur Prayer — Settings Feature Logic & Components
   Path: settings/settings.js
   Handles:
     - Component registration for Knockout.js
     - Prayer Times location settings (city, country, juristic school)
     - Start date setting
     - Font size selection
     - Database reset
     - Knockout.js ViewModel & Component Bindings
   ============================================================ */
'use strict';

/* ---------- Settings Constants ---------- */
var SETTINGS_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.SETTINGS) || {};
var INDIAN_CITIES = SETTINGS_CONSTANTS.INDIAN_CITIES || window.INDIAN_CITIES || [];
var CUSTOM_CITY_VALUE = SETTINGS_CONSTANTS.CUSTOM_CITY_VALUE || '__custom__';
var TIMINGS_STATUS_LABELS = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.STATUS_LABELS) || { live: 'Live', cached: 'Cached', offline: 'Offline' };
var SETTINGS_DEFAULT_CONFIG = SETTINGS_CONSTANTS.DEFAULT_CONFIG || { city: 'Guntur', country: 'India', school: 1 };
var SETTINGS_ELEMENT_IDS = SETTINGS_CONSTANTS.ELEMENT_IDS || {
    LOCATION_SUBTITLE: 'ptLocationSubtitle',
    STATUS_TEXT: 'ptStatusText',
    CITY_SELECT: 'ptCitySelect',
    CUSTOM_CITY_WRAP: 'ptCustomCityWrap',
    CUSTOM_CITY_INPUT: 'ptCustomCityInput',
    COUNTRY_INPUT: 'ptCountryInput',
    SCHOOL_SELECT: 'ptSchoolSelect',
    START_DATE_INPUT: 'sdInput',
    FONT_SIZE_BTNS: 'fsBtns'
};
var SETTINGS_BUTTON_CLASSES = SETTINGS_CONSTANTS.BUTTON_CLASSES || {
    FONT_ACTIVE: 'flex-1 py-3 font-bold rounded-xl text-sm bg-brand text-white border border-brand transition-all cursor-pointer',
    FONT_INACTIVE: 'flex-1 py-3 font-bold rounded-xl text-sm bg-surfaceBg text-brand border border-borderGrey hover:bg-brand-light transition-all cursor-pointer'
};
var SETTINGS_STATUS_FALLBACK = SETTINGS_CONSTANTS.STATUS_FALLBACK || 'Offline';

/* ---------- Component Registration (Templates from separate HTML files) ---------- */
function registerSettingsComponents() {
    if (typeof ko === 'undefined' || !ko.components) return;

    // 1. Reusable Card Header Component
    if (!ko.components.isRegistered('settings-card-header')) {
        ko.components.register('settings-card-header', {
            viewModel: function (params) {
                return (params && params.header) ? params.header : params;
            },
            template: { element: 'settings-card-header-template', file: 'settings/templates/settings-card-header.html' }
        });
    }

    // 2. Reusable Font Size Button Component
    if (!ko.components.isRegistered('settings-font-size-btn')) {
        ko.components.register('settings-font-size-btn', {
            viewModel: function (params) {
                return (params && params.button) ? params.button : params;
            },
            template: { element: 'settings-font-size-btn-template', file: 'settings/templates/settings-font-size-btn.html' }
        });
    }

    // 3. Reusable Info Card Component
    if (!ko.components.isRegistered('settings-info-card')) {
        ko.components.register('settings-info-card', {
            viewModel: function (params) {
                return (params && params.info) ? params.info : params;
            },
            template: { element: 'settings-info-card-template', file: 'settings/templates/settings-info-card.html' }
        });
    }

    // 4. Main Settings Page Component (orchestrates layout shell and child components)
    if (!ko.components.isRegistered('settings-page')) {
        ko.components.register('settings-page', {
            viewModel: function (params) {
                return (params && params.viewModel) ? params.viewModel : (settingsViewModel || params);
            },
            template: { element: 'settings-page-template', file: 'settings/settings.html' }
        });
    }
}

/* ---------- Knockout ViewModel ---------- */
var settingsViewModel = null;

function SettingsViewModel() {
    var self = this;

    var initialFs = typeof rdFS === 'function' ? rdFS() : (SETTINGS_CONSTANTS.DEFAULT_FONT_SIZE || 1);
    var initialCfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : SETTINGS_DEFAULT_CONFIG;
    var initialStatusKey = (typeof prayerTimingsStatus !== 'undefined' && prayerTimingsStatus) ? prayerTimingsStatus : 'offline';
    var initialStatusText = TIMINGS_STATUS_LABELS[initialStatusKey] || SETTINGS_STATUS_FALLBACK;
    var initialSubtitle = 'Selected City: ' + (initialCfg.city || SETTINGS_DEFAULT_CONFIG.city) + ', ' + (initialCfg.country || SETTINGS_DEFAULT_CONFIG.country);

    // 1. Prayer Times Location Card Header
    self.prayerTimesHeader = {
        icon: 'fa-solid fa-mosque text-xl',
        iconText: null,
        iconBoxClass: 'icon-box icon-box-lg bg-brand-light',
        iconDataRef: 'page.settings.prayer-times.icon-badge',
        infoDataRef: 'page.settings.prayer-times.info',
        title: 'Prayer Times Location',
        titleClass: 'font-bold text-sm text-brand',
        titleDataRef: 'page.settings.prayer-times.title',
        subtitle: ko.observable(initialSubtitle),
        subtitleId: SETTINGS_ELEMENT_IDS.LOCATION_SUBTITLE,
        subtitleDataRef: 'page.settings.prayer-times.subtitle',
        showStatusBadge: true,
        statusBadgeId: 'ptStatusBadge',
        statusBadgeDataRef: 'page.settings.prayer-times.status-badge',
        statusTextId: SETTINGS_ELEMENT_IDS.STATUS_TEXT,
        statusText: ko.observable(initialStatusText),
        headerDataRef: 'page.settings.prayer-times.header',
        headerClass: 'flex items-center gap-3 mb-3'
    };

    // 2. Start Date Card Header
    self.startDateHeader = {
        icon: 'fa-solid fa-calendar-check text-xl',
        iconText: null,
        iconBoxClass: 'icon-box icon-box-lg bg-brand-light text-brand',
        iconDataRef: 'page.settings.start-date.icon-badge',
        infoDataRef: 'page.settings.start-date.info',
        title: 'Current Start Date',
        titleClass: 'font-bold text-sm',
        titleDataRef: 'page.settings.start-date.title',
        subtitle: null,
        subtitleId: null,
        subtitleDataRef: null,
        showStatusBadge: false,
        headerDataRef: 'page.settings.start-date.header',
        headerClass: 'flex items-center gap-3 mb-3'
    };

    // 3. Font Size Card Header
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
        subtitleId: null,
        subtitleDataRef: null,
        showStatusBadge: false,
        headerDataRef: 'page.settings.font-size.header',
        headerClass: 'flex items-center gap-3 mb-3'
    };

    // 4. Reset DB Card Header
    self.resetDbHeader = {
        icon: 'fa-solid fa-triangle-exclamation text-xl',
        iconText: null,
        iconBoxClass: 'icon-box icon-box-lg bg-danger-subtle text-gr-danger',
        iconDataRef: 'page.settings.reset.icon-badge',
        infoDataRef: 'page.settings.reset.info',
        title: 'Reset Database',
        titleClass: 'font-bold text-sm',
        titleDataRef: 'page.settings.reset.title',
        subtitle: ko.observable('This will delete all prayer data, old data and cache.'),
        subtitleId: null,
        subtitleDataRef: 'page.settings.reset.subtitle',
        showStatusBadge: false,
        headerDataRef: 'page.settings.reset.header',
        headerClass: 'flex items-center gap-3 mb-2'
    };

    // 5. City Select Options (Indian cities + Custom City)
    var cityOpts = (INDIAN_CITIES || []).map(function (c) {
        return {
            value: c.name,
            label: c.name + (c.state ? ' (' + c.state + ')' : ''),
            dataRef: 'page.settings.prayer-times.city-option.' + c.name.toLowerCase().replace(/\s+/g, '-')
        };
    });
    cityOpts.push({
        value: CUSTOM_CITY_VALUE,
        label: 'Other / Custom City...',
        dataRef: 'page.settings.prayer-times.city-option.custom'
    });
    self.cityOptions = ko.observableArray(cityOpts);

    // 6. Font Size Buttons & context-mapped class resolver
    self.currentFontSize = ko.observable(initialFs);
    self.getFontSizeBtnClass = function (size) {
        var active = Math.abs(self.currentFontSize() - size) < 0.01;
        return active ? SETTINGS_BUTTON_CLASSES.FONT_ACTIVE : SETTINGS_BUTTON_CLASSES.FONT_INACTIVE;
    };
    var rawFontOptions = SETTINGS_CONSTANTS.FONT_SIZE_OPTIONS || [
        { v: 0.9, l: 'Small' },
        { v: 1, l: 'Medium' },
        { v: 1.15, l: 'Large' }
    ];
    self.fontSizeButtons = rawFontOptions.map(function (opt) {
        var sizeVal = opt.v;
        var labelStr = opt.l;
        var refKey = labelStr.toLowerCase();
        return {
            size: sizeVal,
            label: labelStr,
            dataRef: 'page.settings.font-size.' + refKey
        };
    });

    // 7. Storage Info Card
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

function initSettings() {
    if (typeof ko === 'undefined') return;
    registerSettingsComponents();

    var el = document.getElementById('settingsPage');
    if (!el || settingsViewModel) return;

    settingsViewModel = new SettingsViewModel();
    ko.applyBindings(settingsViewModel, el);
}

function rSET() {
    if (!settingsViewModel) {
        initSettings();
    }

    var fs = typeof rdFS === 'function' ? rdFS() : (SETTINGS_CONSTANTS.DEFAULT_FONT_SIZE || 1);
    var sdate = typeof rdSD === 'function' ? rdSD() : '';
    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : SETTINGS_DEFAULT_CONFIG;
    var statusKey = (typeof prayerTimingsStatus !== 'undefined' && prayerTimingsStatus) ? prayerTimingsStatus : 'offline';
    var statusText = TIMINGS_STATUS_LABELS[statusKey] || SETTINGS_STATUS_FALLBACK;
    var subtitleText = 'Selected City: ' + (cfg.city || SETTINGS_DEFAULT_CONFIG.city) + ', ' + (cfg.country || SETTINGS_DEFAULT_CONFIG.country);

    // Sync ViewModel observables
    if (settingsViewModel) {
        if (settingsViewModel.prayerTimesHeader && ko.isObservable(settingsViewModel.prayerTimesHeader.subtitle)) {
            settingsViewModel.prayerTimesHeader.subtitle(subtitleText);
        }
        if (settingsViewModel.prayerTimesHeader && ko.isObservable(settingsViewModel.prayerTimesHeader.statusText)) {
            settingsViewModel.prayerTimesHeader.statusText(statusText);
        }
        if (ko.isObservable(settingsViewModel.currentFontSize)) {
            settingsViewModel.currentFontSize(fs);
        }
    }

    // 1. Update Prayer Times Location header info & status badge
    var sub = $(SETTINGS_ELEMENT_IDS.LOCATION_SUBTITLE);
    if (sub) {
        sub.textContent = subtitleText;
    }
    var st = $(SETTINGS_ELEMENT_IDS.STATUS_TEXT);
    if (st) {
        st.textContent = statusText;
    }

    // 2. Determine if configured city is in predefined list
    var isPredefined = false;
    var targetCityLower = (cfg.city || '').toLowerCase();
    for (var i = 0; i < INDIAN_CITIES.length; i++) {
        if (INDIAN_CITIES[i].name.toLowerCase() === targetCityLower) {
            isPredefined = true;
            break;
        }
    }

    // 3. Update City Select value and attach onchange listener
    var sel = $(SETTINGS_ELEMENT_IDS.CITY_SELECT);
    if (sel) {
        if (isPredefined) {
            for (var j = 0; j < sel.options.length; j++) {
                if (sel.options[j].value.toLowerCase() === targetCityLower) {
                    sel.selectedIndex = j;
                    break;
                }
            }
        } else {
            sel.value = CUSTOM_CITY_VALUE;
        }

        if (!sel._settingsListenerAttached) {
            sel.onchange = function () {
                var wrap = $(SETTINGS_ELEMENT_IDS.CUSTOM_CITY_WRAP);
                if (wrap) {
                    if (this.value === CUSTOM_CITY_VALUE) {
                        wrap.classList.remove('d-none');
                        var inp = $(SETTINGS_ELEMENT_IDS.CUSTOM_CITY_INPUT);
                        if (inp) inp.focus();
                    } else {
                        wrap.classList.add('d-none');
                    }
                }
            };
            sel._settingsListenerAttached = true;
        }
    }

    // 4. Update Custom City / Country inputs and container visibility
    var wrap = $(SETTINGS_ELEMENT_IDS.CUSTOM_CITY_WRAP);
    if (wrap) {
        if (!isPredefined) {
            wrap.classList.remove('d-none');
        } else {
            wrap.classList.add('d-none');
        }
    }
    var customInp = $(SETTINGS_ELEMENT_IDS.CUSTOM_CITY_INPUT);
    if (customInp) {
        customInp.value = isPredefined ? '' : (cfg.city || '');
    }
    var countryInp = $(SETTINGS_ELEMENT_IDS.COUNTRY_INPUT);
    if (countryInp) {
        countryInp.value = cfg.country || SETTINGS_DEFAULT_CONFIG.country;
    }

    // 5. Update Juristic Method (Asr school)
    var schoolSel = $(SETTINGS_ELEMENT_IDS.SCHOOL_SELECT);
    if (schoolSel) {
        var schoolVal = cfg.school !== undefined ? cfg.school : (SETTINGS_CONSTANTS.SCHOOLS ? SETTINGS_CONSTANTS.SCHOOLS.HANAFI : 1);
        schoolSel.value = String(schoolVal);
    }

    // 6. Update Start Date Input
    var sdInput = $(SETTINGS_ELEMENT_IDS.START_DATE_INPUT);
    if (sdInput) {
        sdInput.value = sdate || '';
        if (typeof td === 'function') {
            sdInput.max = td();
        }
    }

    // 7. Update Font Size button active states
    var fsBtns = $(SETTINGS_ELEMENT_IDS.FONT_SIZE_BTNS);
    if (fsBtns) {
        var buttons = fsBtns.querySelectorAll('button[data-act="font"]');
        for (var b = 0; b < buttons.length; b++) {
            var btn = buttons[b];
            var btnVal = parseFloat(btn.getAttribute('data-fs'));
            var active = Math.abs(fs - btnVal) < 0.01;
            btn.className = active ? SETTINGS_BUTTON_CLASSES.FONT_ACTIVE : SETTINGS_BUTTON_CLASSES.FONT_INACTIVE;
        }
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initSettings();
            rSET();
        });
    } else {
        initSettings();
        rSET();
    }
}

var SettingsApp = {
    init: initSettings,
    render: rSET,
    getViewModel: function () {
        return settingsViewModel;
    },
    registerComponents: registerSettingsComponents
};

if (typeof window !== 'undefined') {
    window.SettingsApp = SettingsApp;
    window.rSET = rSET;
}

