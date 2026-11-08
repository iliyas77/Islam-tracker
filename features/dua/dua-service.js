/* ============================================================
   Nur Prayer — Centralized Dua Service & Utility Layer
   Path: features/dua/dua-service.js
   Responsibilities:
     - Centralizes all Quran Duas constants, storage keys, and max pin limits
     - Data normalization (surah, uchcharana, ardham)
     - LocalStorage read/write and persistence synchronization
     - Search & transliteration filtering (Telugu & English)
     - Pinning & favourite toggle logic with max pin constraints
     - Remote JSON fetching and caching
     - Single source of truth for all Dua components
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Constants ---------- */
export var DUA_STORAGE_KEYS = {
    DATA: 'quranDuas_data',
    FAVS: 'quranDuas_favourites',
    PINS: 'quranDuas_pins'
};

export var MAX_PINS = 2;
export var DUA_API_URL = 'https://raw.githubusercontent.com/iliyas77/data.github.io/main/duas.json';

/* ---------- Utility Helpers ---------- */
export function unwrap(val, def) {
    var res = (typeof val === 'function') ? val() : val;
    return (res !== undefined && res !== null) ? res : def;
}

export function getSurah(d) {
    if (!d) return '';
    if (d.surah) return d.surah;
    if (d.surah_name) {
        return d.ayat_number ? (d.surah_name + ' (' + d.ayat_number + ')') : d.surah_name;
    }
    return '';
}

export function getUchcharana(d) {
    return d ? (d.telugu_uchcharana || d.uchcharana || '') : '';
}

export function getArdham(d) {
    return d ? (d.telugu_ardham || d.ardham || '') : '';
}

export function normalizeDua(d) {
    if (!d) return d;
    d.surah = getSurah(d);
    d.uchcharana = getUchcharana(d);
    d.ardham = getArdham(d);
    return d;
}

/* ---------- LocalStorage Operations ---------- */
export function loadDuasFromStorage() {
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(DUA_STORAGE_KEYS.DATA) : null;
        if (raw) {
            var data = JSON.parse(raw);
            if (Array.isArray(data)) {
                return data.map(normalizeDua);
            }
        }
    } catch (_) {}
    return [];
}

export function saveDuasToStorage(data) {
    var arr = Array.isArray(data) ? data : [];
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(DUA_STORAGE_KEYS.DATA, JSON.stringify(arr));
        }
        if (_win.DuasStore && typeof _win.DuasStore.allDuas === 'function') {
            _win.DuasStore.allDuas(arr);
        }
        if (_win.duasViewModel && typeof _win.duasViewModel.allDuas === 'function' && _win.duasViewModel.allDuas() !== arr) {
            _win.duasViewModel.allDuas(arr);
        }
    } catch (_) {}
}

export function loadFavourites() {
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(DUA_STORAGE_KEYS.FAVS) : null;
        if (raw) {
            var favs = JSON.parse(raw);
            if (Array.isArray(favs)) return favs;
        }
    } catch (_) {}
    return [];
}

export function saveFavourites(favs) {
    var arr = Array.isArray(favs) ? favs : [];
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(DUA_STORAGE_KEYS.FAVS, JSON.stringify(arr));
        }
        if (_win.DuasStore && typeof _win.DuasStore.favourites === 'function') {
            _win.DuasStore.favourites(arr);
        }
    } catch (_) {}
}

export function loadPins() {
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(DUA_STORAGE_KEYS.PINS) : null;
        if (raw) {
            var pins = JSON.parse(raw);
            if (Array.isArray(pins)) return pins.slice(0, MAX_PINS);
        }
    } catch (_) {}
    return [];
}

export function savePins(pins) {
    var arr = (Array.isArray(pins) ? pins : []).slice(0, MAX_PINS);
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(DUA_STORAGE_KEYS.PINS, JSON.stringify(arr));
        }
        if (_win.DuasStore && typeof _win.DuasStore.pins === 'function') {
            _win.DuasStore.pins(arr);
        }
    } catch (_) {}
}

/* ---------- Search & Filtering ---------- */
export function filterDuas(query, duas) {
    var q = (query || '').trim().toLowerCase();
    var list = Array.isArray(duas) ? duas : [];
    if (!q) return list;
    return list.filter(function (d) {
        if (!d) return false;
        var num = String(d.number || d.id || '');
        var surah = String(d.surah || d.surah_name || '').toLowerCase();
        var ayat = String(d.ayat_number || '').toLowerCase();
        var uch = String(d.uchcharana || d.telugu_uchcharana || '').toLowerCase();
        var ard = String(d.ardham || d.telugu_ardham || '').toLowerCase();
        return (num === q) ||
            (surah.indexOf(q) !== -1) ||
            (ayat.indexOf(q) !== -1) ||
            (uch.indexOf(q) !== -1) ||
            (ard.indexOf(q) !== -1);
    });
}

/* ---------- Pin & Favourite Actions ---------- */
export function toggleFavourite(index) {
    var favs = loadFavourites();
    var idx = Number(index);
    var p = favs.indexOf(idx);
    if (p === -1) {
        favs.push(idx);
    } else {
        favs.splice(p, 1);
    }
    saveFavourites(favs);
    return favs;
}

export function togglePin(index) {
    var pins = loadPins();
    var idx = Number(index);
    var p = pins.indexOf(idx);
    if (p === -1) {
        if (pins.length >= MAX_PINS) {
            if (typeof _win.alert === 'function') {
                _win.alert('You can only pin up to ' + MAX_PINS + ' duas. Please unpin one first.');
            }
            return { success: false, pins: pins, error: 'limit_reached' };
        }
        pins.push(idx);
    } else {
        pins.splice(p, 1);
    }
    savePins(pins);
    return { success: true, pins: pins };
}

/* ---------- Remote Data Fetching ---------- */
var cachedDuasData = null;
var fetchPromise = null;

export function fetchDuasResource() {
    var constants = _win.DUA_CONSTANTS || (_win.CONSTANTS && (_win.CONSTANTS.DUA || _win.CONSTANTS.DUAS)) || {};
    if (typeof constants.fetchDuas === 'function') {
        return constants.fetchDuas();
    }
    var url = constants.API_URL || DUA_API_URL;
    if (typeof _win.fetch === 'function') {
        return _win.fetch(url).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
    }
    return Promise.reject(new Error('Fetch not available in this environment'));
}

export function fetchDuas(forceRefresh) {
    if (!forceRefresh && cachedDuasData && cachedDuasData.length > 0) {
        return Promise.resolve(cachedDuasData);
    }
    if (!forceRefresh && fetchPromise) return fetchPromise;

    fetchPromise = fetchDuasResource()
        .then(function (data) {
            if (!Array.isArray(data)) throw new Error('Invalid duas format: expected array');
            cachedDuasData = data.map(normalizeDua);
            saveDuasToStorage(cachedDuasData);
            fetchPromise = null;
            return cachedDuasData;
        })
        .catch(function (err) {
            fetchPromise = null;
            throw err;
        });

    return fetchPromise;
}

/* ---------- Centralized Service Export ---------- */
export var DuaService = {
    DUA_STORAGE_KEYS,
    MAX_PINS,
    DUA_API_URL,
    unwrap,
    getSurah,
    getUchcharana,
    getArdham,
    normalizeDua,
    loadDuasFromStorage,
    saveDuasToStorage,
    loadFavourites,
    saveFavourites,
    loadPins,
    savePins,
    filterDuas,
    toggleFavourite,
    togglePin,
    fetchDuasResource,
    fetchDuas
};

if (typeof window !== 'undefined') {
    window.DuaService = DuaService;
}

export default DuaService;

