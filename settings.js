/* ============================================================
   Nur Prayer — Settings Feature Logic
   Path: settings.js
   Handles:
     - Prayer Times location settings (city, country, juristic school)
     - Start date setting
     - Font size selection
     - Database reset
   ============================================================ */
'use strict';

/* ---------- Settings (Constants referenced from utilities/constant.js) ---------- */
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
    FONT_ACTIVE: 'btn btn-brand flex-1 py-3 fw-bold rounded-3 fs-6',
    FONT_INACTIVE: 'btn btn-light border flex-1 py-3 fw-bold rounded-3 fs-6'
};
var SETTINGS_STATUS_FALLBACK = SETTINGS_CONSTANTS.STATUS_FALLBACK || 'Offline';

function rSET() {
    var fs = typeof rdFS === 'function' ? rdFS() : (SETTINGS_CONSTANTS.DEFAULT_FONT_SIZE || 1);
    var sdate = typeof rdSD === 'function' ? rdSD() : '';
    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : SETTINGS_DEFAULT_CONFIG;
    var statusKey = (typeof prayerTimingsStatus !== 'undefined' && prayerTimingsStatus) ? prayerTimingsStatus : 'offline';
    var statusText = TIMINGS_STATUS_LABELS[statusKey] || SETTINGS_STATUS_FALLBACK;

    // 1. Update Prayer Times Location header info & status badge
    var sub = $(SETTINGS_ELEMENT_IDS.LOCATION_SUBTITLE);
    if (sub) {
        sub.textContent = 'Selected City: ' + (cfg.city || SETTINGS_DEFAULT_CONFIG.city) + ', ' + (cfg.country || SETTINGS_DEFAULT_CONFIG.country);
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

if (typeof window !== 'undefined') {
    window.rSET = rSET;
}
