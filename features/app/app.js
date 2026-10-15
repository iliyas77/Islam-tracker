/* ============================================================
   Nur Prayer — Application Logic
   ============================================================ */

/* ---------- Constants ---------- */
var P = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
var K = 'namazTrackerData';
var OCK = 'namazOldData';
var FK = 'namazFontSize';
var SK = 'namazStartDate';
var OK = 'namazOldPeriod';

/* Prayer Timings Storage Keys */
var PTK_CACHE = 'namazPrayerTimingsCache';
var PTK_CONFIG = 'namazPrayerConfig';

var defaultPrayerConfig = {
    city: 'Guntur',
    country: 'India',
    method: 1, // University of Islamic Sciences, Karachi
    school: 1  // 1 = Hanafi, 0 = Shafi
};

var T = {
    Fajr: '04:49 AM',
    Dhuhr: '11:54 AM',
    Asr: '04:10 PM',
    Maghrib: '05:47 PM',
    Isha: '06:59 PM'
};

var I = {
    Fajr: '<i class="fa-solid fa-sun" style="color:#f5b400"></i>',
    Dhuhr: '<i class="fa-solid fa-sun" style="color:#f5b400"></i>',
    Asr: '<i class="fa-solid fa-cloud-sun" style="color:#f5b400"></i>',
    Maghrib: '<i class="fa-solid fa-mountain-sun" style="color:#f5b400"></i>',
    Isha: '<i class="fa-solid fa-moon" style="color:#2563eb"></i>'
};

/* ---------- State ---------- */
var sd = td();
var sheet2BS;
var dashTimer = null;
var currentHijri = null;
var prayerTimingsStatus = 'cached'; // 'live', 'cached', 'offline'

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
    var curPage = $('currentPage');
    if (curPage && !curPage.classList.contains('d-none') && sd === dateStr) {
        rn();
    }
}

function fetchPrayerTimings(dateStr, callback) {
    dateStr = dateStr || td();
    var cfg = getPrayerConfig();

    // 1. Check local cache first
    var cached = getPrayerCacheForDate(dateStr);
    if (cached && cached.timings) {
        applyTimings(cached.timings, cached.hijri, 'cached');
        if (typeof callback === 'function') callback(null, cached);
    }

    // 2. Fetch live data from Aladhan API
    var apiDate = formatApiDate(dateStr);
    var url = 'https://api.aladhan.com/v1/timingsByCity/' + apiDate +
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
                school: cfg.school === 1 ? 'Hanafi' : 'Shafi',
                method: cfg.method,
                fetchedAt: Date.now()
            };

            savePrayerCacheForDate(dateStr, record);
            applyTimings(record.timings, record.hijri, 'live');
            refreshPrayerTimesUI(dateStr);

            if (typeof callback === 'function') callback(null, record);
        })
        .catch(function (err) {
            console.warn('Aladhan prayer times fetch error:', err.message);
            if (cached && cached.timings) {
                prayerTimingsStatus = 'cached';
            } else {
                prayerTimingsStatus = 'offline';
            }
            refreshPrayerTimesUI(dateStr);
            if (typeof callback === 'function') callback(err, cached);
        });
}

function getNextPrayerInfo() {
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

    for (var i = 0; i < P.length; i++) {
        var p = P[i];
        var pMin = parseToMinutes(T[p]);
        if (pMin > currentMin) {
            var diff = pMin - currentMin;
            var hrs = Math.floor(diff / 60);
            var mins = diff % 60;
            var remaining = hrs > 0 ? (hrs + 'h ' + mins + 'm') : (mins + 'm');
            var remainingPad = pad2(hrs) + 'h ' + pad2(mins) + 'm';
            return {
                name: p,
                time: T[p],
                diffMin: diff,
                hrs: hrs,
                mins: mins,
                remaining: remaining,
                remainingPad: remainingPad,
                isTomorrow: false
            };
        }
    }

    var fajrMin = parseToMinutes(T.Fajr);
    var diffTomorrow = (24 * 60 - currentMin) + fajrMin;
    var fHrs = Math.floor(diffTomorrow / 60);
    var fMins = diffTomorrow % 60;
    var remainingTomorrow = fHrs > 0 ? (fHrs + 'h ' + fMins + 'm') : (fMins + 'm');
    var remainingTomorrowPad = pad2(fHrs) + 'h ' + pad2(fMins) + 'm';
    return {
        name: 'Fajr',
        time: T.Fajr,
        diffMin: diffTomorrow,
        hrs: fHrs,
        mins: fMins,
        remaining: remainingTomorrow,
        remainingPad: remainingTomorrowPad,
        isTomorrow: true
    };
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', function () {
    sheet2BS = new bootstrap.Offcanvas($('sheet2'));

    apFS(rdFS());
    en(td());
    sd = td();

    // Check cached prayer timings and fetch live timings
    var cachedToday = getPrayerCacheForDate(td());
    if (cachedToday && cachedToday.timings) {
        applyTimings(cachedToday.timings, cachedToday.hijri, 'cached');
    }
    fetchPrayerTimings(td());

    showPage('dashboard');

    /* Date picker */
    $('dp').onchange = function (e) { if (e.target.value) go(e.target.value); };

    /* Action buttons */
    $('currentActionBtn').onclick = openCal;
    $('oldActionBtn').onclick = rOldInfo;
});