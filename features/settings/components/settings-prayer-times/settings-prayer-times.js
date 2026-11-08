/* ============================================================
   Nur Prayer — Settings Prayer Times Component
   Path: features/settings/components/settings-prayer-times/settings-prayer-times.js
   Responsibilities:
     - Owns Prayer Times Location & Calculation settings
     - Renders city selection, custom city input, school selection
     - Dispatches save action to SettingsService and triggers timing sync
   ============================================================ */
'use strict';

import {
    INDIAN_CITIES, CUSTOM_CITY_VALUE, JURISTIC_SCHOOLS,
    getPrayerConfig, savePrayerConfig, unwrap
} from '../../settings-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const SettingsPrayerTimesTemplate = {
    element: 'settings-prayer-times-template',
    file: 'features/settings/components/settings-prayer-times/settings-prayer-times.html'
};

export function SettingsPrayerTimesViewModel(params) {
    if (params instanceof SettingsPrayerTimesViewModel) return params;
    if (!(this instanceof SettingsPrayerTimesViewModel)) return new SettingsPrayerTimesViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function cmp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    var store = _win.SettingsStore || null;
    var initialCfg = getPrayerConfig();

    var isInitialPredefined = (INDIAN_CITIES || []).some(function (c) {
        return c.name.toLowerCase() === (initialCfg.city || '').toLowerCase();
    });

    self.selectedCity = (store && k && k.isObservable(store.selectedCity))
        ? store.selectedCity
        : obs(isInitialPredefined ? initialCfg.city : CUSTOM_CITY_VALUE);

    self.customCity = (store && k && k.isObservable(store.customCity))
        ? store.customCity
        : obs(isInitialPredefined ? '' : (initialCfg.city || ''));

    self.country = (store && k && k.isObservable(store.country))
        ? store.country
        : obs(initialCfg.country || 'India');

    self.school = (store && k && k.isObservable(store.school))
        ? store.school
        : obs(String(initialCfg.school !== undefined ? initialCfg.school : 1));

    self.statusText = obs('Cached');

    self.isCustomCity = cmp(function () {
        var cityVal = typeof self.selectedCity === 'function' ? self.selectedCity() : self.selectedCity;
        return cityVal === CUSTOM_CITY_VALUE;
    });

    self.effectiveCity = cmp(function () {
        var isCust = typeof self.isCustomCity === 'function' ? self.isCustomCity() : self.isCustomCity;
        if (isCust) {
            var c = typeof self.customCity === 'function' ? self.customCity() : self.customCity;
            return (c || '').trim() || 'Guntur';
        }
        var sel = typeof self.selectedCity === 'function' ? self.selectedCity() : self.selectedCity;
        return sel || 'Guntur';
    });

    self.locationSubtitle = cmp(function () {
        var eff = typeof self.effectiveCity === 'function' ? self.effectiveCity() : self.effectiveCity;
        var cntry = typeof self.country === 'function' ? self.country() : self.country;
        return 'Selected City: ' + eff + ', ' + (cntry || 'India');
    });

    // Populate City Options
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
    self.cityOptions = (k && k.observableArray) ? k.observableArray(cityOpts) : cityOpts;
    self.juristicSchools = JURISTIC_SCHOOLS;

    self.savePrayerTimes = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var city = typeof self.effectiveCity === 'function' ? self.effectiveCity() : self.effectiveCity;
        var country = (typeof self.country === 'function' ? self.country() : self.country) || 'India';
        var schoolNum = parseInt(typeof self.school === 'function' ? self.school() : self.school, 10) || 1;

        if (!city) {
            if (typeof alert === 'function') alert('Please select or enter a city.');
            return;
        }

        savePrayerConfig({ city: city, country: country, school: schoolNum });

        if (typeof p.onSave === 'function') {
            p.onSave({ city: city, country: country, school: schoolNum });
        } else if (typeof _win.fetchPrayerTimings === 'function') {
            var todayStr = typeof _win.td === 'function' ? _win.td() : '';
            _win.fetchPrayerTimings(todayStr, function (err) {
                if (err) {
                    if (typeof alert === 'function') alert('Saved settings, but live API connection failed: ' + err.message);
                } else {
                    if (typeof alert === 'function') alert('Prayer times synced successfully for ' + city + ', ' + country + '!');
                }
                if (_win.PrayerStore && typeof _win.PrayerStore.sync === 'function') {
                    _win.PrayerStore.sync();
                }
            });
        }
    };
}

if (typeof window !== 'undefined') {
    window.SettingsPrayerTimesViewModel = SettingsPrayerTimesViewModel;
}

export default {
    template: SettingsPrayerTimesTemplate,
    viewModel: SettingsPrayerTimesViewModel
};

