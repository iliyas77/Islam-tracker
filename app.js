/* ============================================================
   Nur Prayer — Application Logic
   ============================================================ */

/* ---------- Constants (Referenced from utilities/prayer-constants.js) ---------- */
var PRAYER_CONSTANTS = window.PRAYER_CONSTANTS || (window.CONSTANTS && window.CONSTANTS.PRAYER) || {};
var P = PRAYER_CONSTANTS.NAMES || window.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
window.P = P;
var K = (PRAYER_CONSTANTS.STORAGE_KEYS && PRAYER_CONSTANTS.STORAGE_KEYS.TRACKER_DATA) || window.K || 'namazTrackerData';
var OCK = (PRAYER_CONSTANTS.STORAGE_KEYS && PRAYER_CONSTANTS.STORAGE_KEYS.OLD_DATA) || window.OCK || 'namazOldData';
var FK = (PRAYER_CONSTANTS.STORAGE_KEYS && PRAYER_CONSTANTS.STORAGE_KEYS.FONT_SIZE) || window.FK || 'namazFontSize';
var SK = (PRAYER_CONSTANTS.STORAGE_KEYS && PRAYER_CONSTANTS.STORAGE_KEYS.START_DATE) || window.SK || 'namazStartDate';
var OK = (PRAYER_CONSTANTS.STORAGE_KEYS && PRAYER_CONSTANTS.STORAGE_KEYS.OLD_PERIOD) || window.OK || 'namazOldPeriod';

/* Prayer Timings Storage Keys */
var PTK_CACHE = (PRAYER_CONSTANTS.STORAGE_KEYS && PRAYER_CONSTANTS.STORAGE_KEYS.TIMINGS_CACHE) || window.PTK_CACHE || 'namazPrayerTimingsCache';
var PTK_CONFIG = (PRAYER_CONSTANTS.STORAGE_KEYS && PRAYER_CONSTANTS.STORAGE_KEYS.CONFIG) || window.PTK_CONFIG || 'namazPrayerConfig';

var defaultPrayerConfig = PRAYER_CONSTANTS.DEFAULT_CONFIG || window.defaultPrayerConfig || {
    city: 'Guntur',
    country: 'India',
    method: 1,
    school: 1
};

var T = window.T || Object.assign({}, PRAYER_CONSTANTS.DEFAULT_TIMINGS || {});
window.T = T;

var I = PRAYER_CONSTANTS.ICONS || window.I || {};
var TIMINGS_API_URL = (PRAYER_CONSTANTS.API && PRAYER_CONSTANTS.API.TIMINGS_BY_CITY) || 'https://api.aladhan.com/v1/timingsByCity/';
var SCHOOL_NAMES = PRAYER_CONSTANTS.SCHOOL_NAMES || { 1: 'Hanafi', 0: 'Shafi' };
var TIMINGS_STATUS = PRAYER_CONSTANTS.STATUS || { LIVE: 'live', CACHED: 'cached', OFFLINE: 'offline' };

/* ---------- State ---------- */
var sd = td();
window.sd = sd;
var sheet2IsOpen = typeof ko !== 'undefined' ? ko.observable(false) : function () { return false; };
var sheet2Title = typeof ko !== 'undefined' ? ko.observable('—') : function () { return '—'; };
var sheet2Sub = typeof ko !== 'undefined' ? ko.observable('') : function () { return ''; };
var sheet2Icon = typeof ko !== 'undefined' ? ko.observable('fa-solid fa-list-check text-gr-accent') : function () { return ''; };

var sheet2BS = {
    show: function (cfg) {
        if (cfg) {
            if (cfg.title && typeof sheet2Title === 'function') sheet2Title(cfg.title);
            if (cfg.sub !== undefined && typeof sheet2Sub === 'function') sheet2Sub(cfg.sub);
            if (cfg.iconClass && typeof sheet2Icon === 'function') {
                var iconCls = cfg.iconClass;
                if (iconCls.indexOf('fa-') === -1) {
                    iconCls = 'fa-solid fa-' + iconCls;
                }
                sheet2Icon(iconCls);
            }
        }
        if (typeof sheet2IsOpen === 'function') {
            sheet2IsOpen(true);
        }
    },
    hide: function () {
        if (typeof sheet2IsOpen === 'function') {
            sheet2IsOpen(false);
        }
    },
    toggle: function () {
        if (typeof sheet2IsOpen === 'function') {
            sheet2IsOpen(!sheet2IsOpen());
        }
    }
};
window.sheet2BS = sheet2BS;
window.sheet2IsOpen = sheet2IsOpen;
window.sheet2Title = sheet2Title;
window.sheet2Sub = sheet2Sub;
window.sheet2Icon = sheet2Icon;
var prayerTimingsStatus = TIMINGS_STATUS.CACHED; // 'live', 'cached', 'offline'

/* ---------- Prayer Timings Service & Caching ---------- */
function getPrayerConfig() {
    var stored = LS.get(PTK_CONFIG);
    if (!stored || typeof stored !== 'object') {
        return Object.assign({}, defaultPrayerConfig);
    }
    return {
        city: stored.city || defaultPrayerConfig.city,
        country: stored.country || defaultPrayerConfig.country,
        method: typeof stored.method === 'number' ? stored.method : defaultPrayerConfig.method,
        school: typeof stored.school === 'number' ? stored.school : defaultPrayerConfig.school
    };
}

function setPrayerConfig(cfg) {
    var merged = Object.assign(getPrayerConfig(), cfg);
    LS.set(PTK_CONFIG, merged);
    return merged;
}

function getPrayerCache() {
    return LS.get(PTK_CACHE) || {};
}

function getPrayerCacheForDate(dateStr) {
    var cache = getPrayerCache();
    return cache[dateStr] || null;
}

function savePrayerCacheForDate(dateStr, data) {
    var cache = getPrayerCache();
    cache[dateStr] = data;
    LS.set(PTK_CACHE, cache);
}

function format12h(timeStr) {
    if (!timeStr) return '';
    if (timeStr.indexOf('AM') !== -1 || timeStr.indexOf('PM') !== -1) return timeStr;
    var clean = timeStr.trim().split(' ')[0];
    var parts = clean.split(':');
    if (parts.length < 2) return timeStr;
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return pad2(hh) + ':' + m + ' ' + ap;
}

function formatApiDate(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length === 3) {
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    }
    return dateStr;
}

function applyTimings(timings, hijri, status) {
    if (!timings) return;
    P.forEach(function (p) {
        if (timings[p]) {
            T[p] = format12h(timings[p]);
        }
    });
    if (timings.Sunrise) {
        T.Sunrise = format12h(timings.Sunrise);
    }
    if (status) {
        prayerTimingsStatus = status;
    }
}

function refreshPrayerTimesUI(dateStr) {
    var dashPage = $('dashboardPage');
    if (dashPage && !dashPage.classList.contains('d-none')) {
        if (typeof rDashboard === 'function') {
            rDashboard();
        } else if (window.rDashboard) {
            window.rDashboard();
        } else if (window.DashboardApp && typeof window.DashboardApp.render === 'function') {
            window.DashboardApp.render();
        }
    }
    var trkPage = $('trackerPage') || $('currentPage');
    if (trkPage && !trkPage.classList.contains('d-none') && sd === dateStr) {
        if (typeof trackerSubTab === 'undefined' || trackerSubTab === 'current') {
            if (typeof rn === 'function') {
                rn();
            } else if (window.rn) {
                window.rn();
            }
        }
    }
}

function fetchPrayerTimings(dateStr, callback) {
    dateStr = dateStr || td();
    var cfg = getPrayerConfig();

    // 1. Check local cache first
    var cached = getPrayerCacheForDate(dateStr);
    if (cached && cached.timings) {
        applyTimings(cached.timings, cached.hijri, TIMINGS_STATUS.CACHED);
        if (typeof callback === 'function') callback(null, cached);
    }

    // 2. Fetch live data from Aladhan API
    var apiDate = formatApiDate(dateStr);
    var url = TIMINGS_API_URL + apiDate +
        '?city=' + encodeURIComponent(cfg.city) +
        '&country=' + encodeURIComponent(cfg.country) +
        '&method=' + encodeURIComponent(cfg.method) +
        '&school=' + encodeURIComponent(cfg.school);

    fetch(url)
        .then(function (response) {
            if (!response.ok) throw new Error('API status ' + response.status);
            return response.json();
        })
        .then(function (res) {
            if (!res || !res.data || !res.data.timings) {
                throw new Error('Invalid response structure');
            }
            var timings = res.data.timings;
            var hijriData = null;
            if (res.data.date && res.data.date.hijri) {
                var h = res.data.date.hijri;
                var monthName = (h.month && h.month.en) || '';
                hijriData = {
                    date: h.date,
                    day: h.day,
                    month: monthName,
                    year: h.year,
                    text: h.day + ' ' + monthName + ' ' + h.year + ' AH'
                };
            }

            var record = {
                date: dateStr,
                timings: {
                    Fajr: format12h(timings.Fajr),
                    Dhuhr: format12h(timings.Dhuhr),
                    Asr: format12h(timings.Asr),
                    Maghrib: format12h(timings.Maghrib),
                    Isha: format12h(timings.Isha),
                    Sunrise: format12h(timings.Sunrise),
                    Sunset: format12h(timings.Sunset)
                },
                rawTimings: timings,
                hijri: hijriData,
                city: cfg.city,
                country: cfg.country,
                school: SCHOOL_NAMES[cfg.school] || 'Hanafi',
                method: cfg.method,
                fetchedAt: Date.now()
            };

            savePrayerCacheForDate(dateStr, record);
            applyTimings(record.timings, record.hijri, TIMINGS_STATUS.LIVE);
            refreshPrayerTimesUI(dateStr);

            if (typeof callback === 'function') callback(null, record);
        })
        .catch(function (err) {
            console.warn('Aladhan prayer times fetch error:', err.message);
            if (cached && cached.timings) {
                prayerTimingsStatus = TIMINGS_STATUS.CACHED;
            } else {
                prayerTimingsStatus = TIMINGS_STATUS.OFFLINE;
            }
            refreshPrayerTimesUI(dateStr);
            if (typeof callback === 'function') callback(err, cached);
        });
}

function getActivePrayerInfo() {
    var now = new Date();
    var currentMin = now.getHours() * 60 + now.getMinutes();

    function parseToMinutes(timeStr) {
        if (!timeStr) return -1;
        var parts = timeStr.trim().split(' ');
        if (!parts[0]) return -1;
        var sub = parts[0].split(':');
        var h = parseInt(sub[0], 10);
        var m = parseInt(sub[1], 10);
        if (isNaN(h) || isNaN(m)) return -1;
        var ap = parts[1] || 'AM';
        if (ap === 'PM' && h < 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        return h * 60 + m;
    }

    var fajrMin = parseToMinutes(T.Fajr);
    var dhuhrMin = parseToMinutes(T.Dhuhr);
    var asrMin = parseToMinutes(T.Asr);
    var maghribMin = parseToMinutes(T.Maghrib);
    var ishaMin = parseToMinutes(T.Isha);

    var activeName = 'Fajr';
    var isYesterday = false;

    if (currentMin >= ishaMin || currentMin < fajrMin) {
        activeName = 'Isha';
        if (currentMin < fajrMin) {
            isYesterday = true;
        }
    } else if (currentMin >= maghribMin && currentMin < ishaMin) {
        activeName = 'Maghrib';
    } else if (currentMin >= asrMin && currentMin < maghribMin) {
        activeName = 'Asr';
    } else if (currentMin >= dhuhrMin && currentMin < asrMin) {
        activeName = 'Dhuhr';
    } else {
        activeName = 'Fajr';
    }

    return {
        name: activeName,
        time: T[activeName] || '--:--',
        isYesterday: isYesterday
    };
}

/* ---------- Universal Component Template Loader (Separate HTML files) ---------- */
if (typeof ko !== 'undefined' && ko.components && ko.components.loaders) {
    ko.components.loaders.unshift({
        loadTemplate: function (name, templateConfig, callback) {
            if (!templateConfig) return callback(null);

            // 1. If element ID is provided and exists in DOM, let default loader handle it
            if (templateConfig.element) {
                var el = document.getElementById(templateConfig.element);
                if (el) {
                    return ko.components.defaultLoader.loadTemplate(name, { element: el }, callback);
                }
            }

            // 2. If file path is provided, fetch external HTML file
            var file = templateConfig.file || templateConfig.url;
            if (file && typeof fetch === 'function') {
                fetch(file)
                    .then(function (res) {
                        if (!res.ok) throw new Error('Failed to load ' + file);
                        return res.text();
                    })
                    .then(function (html) {
                        ko.components.defaultLoader.loadTemplate(name, html, callback);
                    })
                    .catch(function () {
                        callback(null);
                    });
                return;
            }

            callback(null);
        }
    });
}

/* ---------- Global Components Registration ---------- */
if (typeof registerAllComponents === 'function') {
    registerAllComponents();
} else if (typeof window !== 'undefined' && typeof window.registerAllComponents === 'function') {
    window.registerAllComponents();
} else if (typeof ko !== 'undefined' && ko.components) {
    if (window.AppIcon && typeof window.AppIcon.register === 'function') {
        window.AppIcon.register(ko);
    }
    if (window.AppBottomSheet && typeof window.AppBottomSheet.register === 'function') {
        window.AppBottomSheet.register(ko);
    }
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof registerAllComponents === 'function') {
        registerAllComponents();
    } else if (typeof window !== 'undefined' && typeof window.registerAllComponents === 'function') {
        window.registerAllComponents();
    } else if (typeof ko !== 'undefined' && ko.components) {
        if (window.AppIcon && typeof window.AppIcon.register === 'function') {
            window.AppIcon.register(ko);
        }
        if (window.AppBottomSheet && typeof window.AppBottomSheet.register === 'function') {
            window.AppBottomSheet.register(ko);
        }
    }
    if (typeof initApp === 'function') {
        initApp();
    } else if (typeof window !== 'undefined' && window.initApp) {
        window.initApp();
    }

    var sheet2El = document.getElementById('sheet2Wrapper');
    if (!document.getElementById('app') && sheet2El && typeof ko !== 'undefined' && !ko.dataFor(sheet2El)) {
        ko.applyBindings({
            sheet2IsOpen: sheet2IsOpen,
            sheet2Title: sheet2Title,
            sheet2Sub: sheet2Sub,
            sheet2Icon: sheet2Icon,
            onSheet2Close: function () {
                sheet2BS.hide();
            }
        }, sheet2El);
    }

    if (window.DashboardApp && typeof window.DashboardApp.init === 'function') {
        window.DashboardApp.init();
    }
    if (window.SettingsApp && typeof window.SettingsApp.init === 'function') {
        window.SettingsApp.init();
    }
    if (window.PrayerTrackingApp && typeof window.PrayerTrackingApp.init === 'function') {
        window.PrayerTrackingApp.init();
    }
    if (typeof initTasbeeh === 'function') {
        initTasbeeh();
    } else if (window.initTasbeeh) {
        window.initTasbeeh();
    } else if (window.TasbeehApp && typeof window.TasbeehApp.init === 'function') {
        window.TasbeehApp.init();
    }
    if (window.TasbeehApp && typeof window.TasbeehApp.initModals === 'function') {
        window.TasbeehApp.initModals();
    }
    if (typeof initDuas === 'function') {
        initDuas();
    } else if (window.initDuas) {
        window.initDuas();
    } else if (window.DuasApp && typeof window.DuasApp.init === 'function') {
        window.DuasApp.init();
    }
    if (window.DuasApp && typeof window.DuasApp.initModals === 'function') {
        window.DuasApp.initModals();
    }

    apFS(rdFS());
    if (typeof migratePrayerData === 'function') {
        migratePrayerData();
    }
    if (typeof ensureCurrentDateInitialized === 'function') {
        ensureCurrentDateInitialized();
    }
    if (typeof ensureAllOldMissed === 'function') {
        ensureAllOldMissed();
    }
    sd = td();

    // Check cached prayer timings and fetch live timings
    var cachedToday = getPrayerCacheForDate(td());
    if (cachedToday && cachedToday.timings) {
        applyTimings(cachedToday.timings, cachedToday.hijri, TIMINGS_STATUS.CACHED);
    }
    fetchPrayerTimings(td());

    showPage('dashboard');

    /* Date picker */
    $('dp').onchange = function (e) { if (e.target.value) go(e.target.value); };
    if ($('oldDp')) {
        $('oldDp').onchange = function (e) { if (e.target.value && typeof goOld === 'function') goOld(e.target.value); };
    }

    /* Action buttons */
    if ($('currentActionBtn')) $('currentActionBtn').onclick = openCal;
    if ($('currentMissedBtn')) $('currentMissedBtn').onclick = rMS;
    if ($('oldActionBtn')) $('oldActionBtn').onclick = rOldInfo;
    if ($('historyEmptyBtn')) $('historyEmptyBtn').onclick = function () {
        if (typeof emptyPrayerHistory === 'function') emptyPrayerHistory();
    };

    if (typeof updateCurrentMissedBadge === 'function') {
        updateCurrentMissedBadge();
    }
});