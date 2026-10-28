/* ============================================================
   Nur Prayer — Application Logic
   ============================================================ */

/* ---------- Constants (Referenced from utilities/constant.js) ---------- */
var PRAYER_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.PRAYER) || {};
var P = PRAYER_CONSTANTS.NAMES || window.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
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

var I = PRAYER_CONSTANTS.FA_ICONS || window.I || {};
var TIMINGS_API_URL = (PRAYER_CONSTANTS.API && PRAYER_CONSTANTS.API.TIMINGS_BY_CITY) || 'https://api.aladhan.com/v1/timingsByCity/';
var SCHOOL_NAMES = PRAYER_CONSTANTS.SCHOOL_NAMES || { 1: 'Hanafi', 0: 'Shafi' };
var TIMINGS_STATUS = PRAYER_CONSTANTS.STATUS || { LIVE: 'live', CACHED: 'cached', OFFLINE: 'offline' };

/* ---------- State ---------- */
var sd = td();
var sheet2BS;
var dashTimer = null;
var currentHijri = null;
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
    if (hijri) {
        currentHijri = hijri;
    }
    if (status) {
        prayerTimingsStatus = status;
    }
}

function refreshPrayerTimesUI(dateStr) {
    var dashPage = $('dashboardPage');
    if (dashPage && !dashPage.classList.contains('d-none')) {
        rDashboard();
    }
    var trkPage = $('trackerPage') || $('currentPage');
    if (trkPage && !trkPage.classList.contains('d-none') && sd === dateStr) {
        if (typeof trackerSubTab === 'undefined' || trackerSubTab === 'current') {
            rn();
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

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', function () {
    var OffcanvasClass = window.UIOffcanvas || (window.bootstrap && window.bootstrap.Offcanvas);
    sheet2BS = OffcanvasClass ? new OffcanvasClass($('sheet2')) : null;

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
    $('oldActionBtn').onclick = rOldInfo;

    if (typeof updateCurrentMissedBadge === 'function') {
        updateCurrentMissedBadge();
    }
});