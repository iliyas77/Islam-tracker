/* ============================================================
   Nur Prayer — Utilities
   Path: utilities/utility.js
   ============================================================ */

/* ---------- Constants References ---------- */
var PRAYER_KEYS = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.STORAGE_KEYS) || {};
var LIK = PRAYER_KEYS.LAST_INIT_DATE || window.LIK || 'namazLastInitDate';
var OIK = PRAYER_KEYS.OLD_INIT || window.OIK || 'namazOldPeriodInitialized';
var COMMON_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.COMMON) || {};
var TOAST_DURATION_MS = COMMON_CONSTANTS.TOAST_DURATION_MS || 2200;
var RIPPLE_DURATION_MS = COMMON_CONSTANTS.RIPPLE_DURATION_MS || 620;
var MS_PER_DAY = COMMON_CONSTANTS.MS_PER_DAY || 864e5;
var BASE_FONT_SIZE_PX = (window.CONSTANTS && window.CONSTANTS.SETTINGS && window.CONSTANTS.SETTINGS.BASE_FONT_SIZE_PX) || 16;
var DEFAULT_FONT_SIZE = (window.CONSTANTS && window.CONSTANTS.SETTINGS && window.CONSTANTS.SETTINGS.DEFAULT_FONT_SIZE) || 1;
var CUSTOM_CITY_VALUE = (window.CONSTANTS && window.CONSTANTS.SETTINGS && window.CONSTANTS.SETTINGS.CUSTOM_CITY_VALUE) || '__custom__';

/* ---------- Font Awesome Icon Helper ---------- */
var FA_ICON_MAP = {
    'fajr': 'fa-solid fa-cloud-sun',
    'dhuhr': 'fa-solid fa-sun',
    'asr': 'fa-solid fa-sun',
    'maghrib': 'fa-solid fa-cloud-sun',
    'isha': 'fa-solid fa-moon',
    'mosque': 'fa-solid fa-mosque',
    'tracker': 'fa-solid fa-calendar-check',
    'misbaha': 'fa-solid fa-hands-praying',
    'duas': 'fa-solid fa-hands-praying',
    'settings': 'fa-solid fa-gear',
    'gear': 'fa-solid fa-gear',
    'chevron-right': 'fa-solid fa-chevron-right',
    'chevron-left': 'fa-solid fa-chevron-left',
    'tb-chevron': 'fa-solid fa-chevron-right',
    'tb-pencil': 'fa-solid fa-pencil',
    'pencil': 'fa-solid fa-pencil',
    'tb-target': 'fa-solid fa-bullseye',
    'tb-check-circle': 'fa-solid fa-circle-check',
    'check': 'fa-solid fa-check',
    'circle-check': 'fa-solid fa-circle-check',
    'circle-dot': 'fa-solid fa-circle-dot',
    'circle-exclamation': 'fa-solid fa-circle-exclamation',
    'circle-info': 'fa-solid fa-circle-info',
    'circle-xmark': 'fa-solid fa-circle-xmark',
    'triangle-exclamation': 'fa-solid fa-triangle-exclamation',
    'warning': 'fa-solid fa-triangle-exclamation',
    'done-check': 'fa-solid fa-check',
    'done-check-sm': 'fa-solid fa-check',
    'list-check': 'fa-solid fa-list-check',
    'clock': 'fa-regular fa-clock',
    'clock-rotate-left': 'fa-solid fa-clock-rotate-left',
    'rotate-left': 'fa-solid fa-rotate-left',
    'arrow-rotate-left': 'fa-solid fa-rotate-left',
    'arrow-right': 'fa-solid fa-arrow-right',
    'play': 'fa-solid fa-play',
    'plus': 'fa-solid fa-plus',
    'calendar-card': 'fa-regular fa-calendar-days',
    'calendar-days': 'fa-regular fa-calendar-days',
    'calendar-xmark': 'fa-regular fa-calendar-xmark',
    'location-dot': 'fa-solid fa-location-dot',
    'thumbtack': 'fa-solid fa-thumbtack',
    'book-quran': 'fa-solid fa-book-quran',
    'bookmark': 'fa-solid fa-bookmark',
    'heart': 'fa-solid fa-heart',
    'house': 'fa-solid fa-house',
    'hand-holding-heart': 'fa-solid fa-hand-holding-heart',
    'hands-praying': 'fa-solid fa-hands-praying',
    'bell': 'fa-solid fa-bell',
    'chart-simple': 'fa-solid fa-chart-simple',
    'trash-can': 'fa-solid fa-trash-can'
};

function renderIcon(nameOrOpts, maybeSize, maybeColor, maybeClass) {
    if (!nameOrOpts) return '';
    var name = '';
    var size = '';
    var color = '';
    var className = '';
    if (typeof nameOrOpts === 'object') {
        name = nameOrOpts.name || '';
        size = nameOrOpts.size || '';
        color = nameOrOpts.color || '';
        className = nameOrOpts.className || '';
    } else {
        name = String(nameOrOpts);
        size = maybeSize || '';
        color = maybeColor || '';
        className = maybeClass || '';
    }

    if (name.trim().startsWith('<')) return name;

    var key = name.toLowerCase().trim();
    var faClass = FA_ICON_MAP[key] || (key.startsWith('fa-') ? key : ('fa-solid fa-' + key));
    var classes = [faClass];
    if (color) classes.push(color);
    if (className) classes.push(className);
    if (typeof size === 'string' && (size.startsWith('fs-') || size.startsWith('text-'))) {
        classes.push(size);
    }

    var style = '';
    if (typeof size === 'number') {
        style = ' style="font-size: ' + size + 'px;"';
    } else if (typeof size === 'string' && size && !size.startsWith('fs-') && !size.startsWith('text-')) {
        style = ' style="font-size: ' + size + ';"';
    }

    return '<i class="' + classes.join(' ') + '"' + style + '></i>';
}
window.renderIcon = renderIcon;

/* Central Icon object to ensure seamless Icon.update & Icon.render across components */
window.Icon = {
    render: renderIcon,
    update: function (el, nameOrOpts, maybeSize, maybeColor, maybeClass) {
        if (!el) return null;
        var name = '';
        var color = '';
        var className = '';
        var size = '';
        if (typeof nameOrOpts === 'object' && nameOrOpts !== null) {
            name = nameOrOpts.name || '';
            size = nameOrOpts.size || '';
            color = nameOrOpts.color || '';
            className = nameOrOpts.className || '';
        } else if (typeof nameOrOpts === 'string') {
            var parts = nameOrOpts.trim().split(/\s+/);
            name = parts[0] || '';
            if (parts.length > 1) {
                color = parts.slice(1).join(' ');
            }
        }
        if (maybeSize) size = maybeSize;
        if (maybeColor) color = maybeColor;
        if (maybeClass) className = maybeClass;

        var key = name.toLowerCase().trim();
        var faClass = FA_ICON_MAP[key] || (key.startsWith('fa-') ? key : ('fa-solid fa-' + key));
        var classes = [faClass];
        if (color) classes.push(color);
        if (className) classes.push(className);
        if (typeof size === 'string' && (size.startsWith('fs-') || size.startsWith('text-'))) {
            classes.push(size);
        }
        el.className = classes.join(' ');
        if (typeof size === 'number') {
            el.style.fontSize = size + 'px';
        } else if (typeof size === 'string' && size && !size.startsWith('fs-') && !size.startsWith('text-')) {
            el.style.fontSize = size;
        }
        return el;
    }
};

/* ---------- Helpers ---------- */
function $(id) { return document.getElementById(id); }
function getEl(id) { return document.getElementById(id); }
function pad2(n) { return String(n).padStart(2, '0'); }

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
var escapeHtml = escHtml;
if (typeof window !== 'undefined') {
    window.escHtml = escHtml;
    window.escapeHtml = escapeHtml;
}

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function td() {
    if (typeof window !== 'undefined' && window.PrayerStore && typeof window.PrayerStore.today === 'function') {
        return window.PrayerStore.today();
    }
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function todayKey() {
    return new Date().toDateString();
}

function fr(ds) {
    if (!ds) return '';
    return new Date(ds + 'T00:00:00').toLocaleDateString(undefined,
        { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(ds) {
    return fr(ds);
}

function getCurrentMonthKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1);
}

function normalizeMonthKey(val) {
    if (!val) return '';
    var m = String(val).match(/^(\d{4})-(\d{1,2})/);
    if (!m) return '';
    return m[1] + '-' + pad2(parseInt(m[2], 10));
}

function getPrevMonthKey(mKey) {
    if (!mKey) return '';
    var parts = mKey.split('-');
    var yr = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10);
    mo -= 1;
    if (mo === 0) {
        mo = 12;
        yr -= 1;
    }
    return yr + '-' + pad2(mo);
}

function getNextMonthKey(mKey) {
    if (!mKey) return '';
    var parts = mKey.split('-');
    var yr = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10);
    mo += 1;
    if (mo > 12) {
        mo = 1;
        yr += 1;
    }
    return yr + '-' + pad2(mo);
}

function formatMonthLabel(mKey) {
    if (!mKey) return '';
    var parts = mKey.split('-');
    if (parts.length < 2) return mKey;
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function getPreviousMonthsList(startDate, endDate) {
    if (!startDate) return [];
    var sParts = startDate.split('-');
    var sY = parseInt(sParts[0], 10);
    var sM = parseInt(sParts[1], 10);

    var now = new Date();
    var curY = now.getFullYear();
    var curM = now.getMonth() + 1; // 1-12

    // Upper bound for old tab: previous month
    var endLimitY = curY;
    var endLimitM = curM - 1;
    if (endLimitM === 0) {
        endLimitM = 12;
        endLimitY -= 1;
    }

    if (endDate) {
        var eParts = endDate.split('-');
        var eY = parseInt(eParts[0], 10);
        var eM = parseInt(eParts[1], 10);
        if (eY < endLimitY || (eY === endLimitY && eM < endLimitM)) {
            endLimitY = eY;
            endLimitM = eM;
        }
    }

    var list = [];
    var y = endLimitY;
    var m = endLimitM;

    while (y > sY || (y === sY && m >= sM)) {
        list.push(y + '-' + pad2(m));
        m--;
        if (m === 0) {
            m = 12;
            y--;
        }
    }
    return list; // Most recent month first (e.g. ['2026-09', '2026-08', ...])
}

function friendly(ds) {
    var today = td();
    var d1 = new Date(today + 'T00:00:00');
    var d2 = new Date(ds + 'T00:00:00');
    var diff = Math.round((d1 - d2) / MS_PER_DAY);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === 2) return 'Day Before Yesterday';
    return diff + ' Days Ago';
}

function uid(prefix) {
    prefix = prefix || 'tb_';
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

var _globalToastTimer = null;
function showToast(message, duration, toastId) {
    var el = document.getElementById(toastId || 'tbToast');
    if (!el) return;
    duration = duration || TOAST_DURATION_MS;
    el.textContent = message;
    el.classList.remove('d-none');
    el.classList.add('show');
    if (_globalToastTimer) clearTimeout(_globalToastTimer);
    _globalToastTimer = setTimeout(function () {
        el.classList.remove('show');
        setTimeout(function () { el.classList.add('d-none'); }, 200);
    }, duration);
}

if (typeof window !== 'undefined') {
    window.$ = $;
    window.getEl = getEl;
    window.pad2 = pad2;
    window.clamp = clamp;
    window.td = td;
    window.todayKey = todayKey;
    window.fr = fr;
    window.formatDate = formatDate;
    window.getCurrentMonthKey = getCurrentMonthKey;
    window.normalizeMonthKey = normalizeMonthKey;
    window.getPrevMonthKey = getPrevMonthKey;
    window.getNextMonthKey = getNextMonthKey;
    window.formatMonthLabel = formatMonthLabel;
    window.getPreviousMonthsList = getPreviousMonthsList;
    window.friendly = friendly;
    window.uid = uid;
    window.showToast = showToast;
    window.tMT = tMT;
    window.mBD = mBD;
    window.getTodayMissedCount = getTodayMissedCount;
    window.getConsolidatedMissedCount = getConsolidatedMissedCount;
    window.rd = rd;
    window.gr = gr;
    window.sr = sr;
    window.en = en;
    window.isDonePrayer = isDonePrayer;
    window.isPrayerUpcoming = isPrayerUpcoming;
    window.ensureCurrentDateInitialized = ensureCurrentDateInitialized;
    window.migratePrayerData = migratePrayerData;
    window.datesInRange = datesInRange;
    window.prevDate = prevDate;
}

function parseTimeToMin(timeStr) {
    if (!timeStr) return -1;
    var clean = timeStr.trim().split(' ');
    if (!clean[0]) return -1;
    var parts = clean[0].split(':');
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return -1;
    var ap = clean[1] || 'AM';
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + m;
}

function isPrayerUpcoming(prayerName, dateStr) {
    var today = td();
    if (dateStr && dateStr !== today) return false;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var pTime = T[prayerName];
    if (!pTime) return false;
    var pMin = parseTimeToMin(pTime);
    if (pMin === -1) return false;
    return nowMin < pMin;
}

function isDonePrayer(p, dateStr, r) {
    if (!r) {
        var d = dateStr || (typeof sd !== 'undefined' ? sd : td());
        r = gr(d);
    }
    if (!r) return false;
    // Unified boolean format: false = completed, true = missed (with legacy 'done' fallback)
    if (r[p] === false || r[p] === 'done') return true;
    if (r[p] === true || r[p] === 'missed') return false;
    // If not in record, check if entry was removed (meaning all completed)
    if (dateStr && !rd()[dateStr]) {
        return true;
    }
    return false;
}

/* ---------- Local Storage Wrapper ---------- */
var LS = {
    get: function (k) {
        try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; }
    },
    set: function (k, v) {
        localStorage.setItem(k, JSON.stringify(v));
    }
};

/* ---------- Legacy Data Migration & Current Date Initialization ---------- */
function migratePrayerData() {
    try {
        var curData = LS.get(K);
        if (curData && typeof curData === 'object') {
            var curChanged = false;
            Object.keys(curData).forEach(function (d) {
                var rec = curData[d];
                if (rec && typeof rec === 'object') {
                    var cleaned = {};
                    var hasMissed = false;
                    P.forEach(function (p) {
                        var val = (rec[p] === true || rec[p] === 'missed');
                        cleaned[p] = val;
                        if (val) hasMissed = true;
                    });
                    if (!hasMissed) {
                        delete curData[d];
                        curChanged = true;
                    } else {
                        curData[d] = cleaned;
                        curChanged = true;
                    }
                }
            });
            if (curChanged) {
                LS.set(K, curData);
            }
        }

        var oldData = LS.get(OCK);
        if (oldData && typeof oldData === 'object') {
            var oldChanged = false;
            Object.keys(oldData).forEach(function (d) {
                var rec = oldData[d];
                if (rec && typeof rec === 'object') {
                    var cleaned = {};
                    var hasMissed = false;
                    P.forEach(function (p) {
                        var val = (rec[p] === true || rec[p] === 'missed');
                        cleaned[p] = val;
                        if (val) hasMissed = true;
                    });
                    if (!hasMissed) {
                        delete oldData[d];
                        oldChanged = true;
                    } else {
                        oldData[d] = cleaned;
                        oldChanged = true;
                    }
                }
            });
            if (oldChanged) {
                LS.set(OCK, oldData);
            }
        }
    } catch (e) {
        console.error('Migration error:', e);
    }
}

function ensureCurrentDateInitialized() {
    var today = td();
    var lastInit = localStorage.getItem(LIK);
    var a = rd();

    if (lastInit !== today) {
        // When a new date starts, initialize all prayers to true so they are initially marked as missed
        if (!a[today]) {
            var initialPrayers = {};
            P.forEach(function (p) {
                initialPrayers[p] = true;
            });
            a[today] = initialPrayers;
            LS.set(K, a);
        }
        localStorage.setItem(LIK, today);
    }
}

/* ---------- Prayer data ---------- */
function rd() { return LS.get(K) || {}; }

function gr(d) {
    if (typeof window !== 'undefined' && window.PrayerStore && typeof window.PrayerStore.getRecord === 'function') {
        return window.PrayerStore.getRecord(d);
    }
    if (d === td() && localStorage.getItem(LIK) !== td()) {
        ensureCurrentDateInitialized();
    }
    var a = rd();
    var r = a[d];
    var out = {};
    if (r) {
        P.forEach(function (p) {
            out[p] = (r[p] === true || r[p] === 'missed');
        });
    } else {
        // If entry is not in database, all prayers were completed (false)
        P.forEach(function (p) {
            out[p] = false;
        });
    }
    return out;
}

function sr(d, r) {
    if (typeof window !== 'undefined' && window.PrayerStore && typeof window.PrayerStore.setRecord === 'function') {
        window.PrayerStore.setRecord(d, r);
        return;
    }
    var a = rd();
    var cleaned = {};
    var hasMissed = false;
    P.forEach(function (p) {
        var val = (r && (r[p] === true || r[p] === 'missed'));
        cleaned[p] = val;
        if (val) hasMissed = true;
    });

    if (!hasMissed) {
        // Remove completed entries: once all prayers for a date are completed (false), remove date entry from DB
        delete a[d];
    } else {
        a[d] = cleaned;
    }
    LS.set(K, a);
    if (typeof window !== 'undefined' && window.PrayerStore && typeof window.PrayerStore.sync === 'function') {
        window.PrayerStore.sync();
    }
}

function en(d) {
    // Preserve historical data: reading or navigating to a date must not overwrite or mutate database records
    return gr(d);
}

/* ---------- Misc data queries ---------- */
function mBD() {
    var a = rd();
    var today = td();
    return Object.keys(a).sort()
        .filter(function (d) { return d < today; })
        .map(function (d) {
            return {
                date: d,
                prayers: P.filter(function (p) {
                    return a[d][p] === true || a[d][p] === 'missed';
                })
            };
        })
        .filter(function (x) { return x.prayers.length > 0; });
}

function tMT() {
    if (typeof window !== 'undefined' && window.PrayerStore && typeof window.PrayerStore.missedCount === 'function') {
        return window.PrayerStore.missedCount();
    }
    var a = rd();
    var today = td();
    var t = 0;
    Object.keys(a).forEach(function (d) {
        if (d >= today) return;
        P.forEach(function (p) {
            if (a[d][p] === true || a[d][p] === 'missed') t++;
        });
    });
    return t;
}

function getTodayMissedCount() {
    var today = td();
    var r = gr(today);
    var curActive = typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : null;
    var curPrayerName = curActive ? curActive.name : null;
    return P.filter(function (p) {
        if (typeof isDonePrayer === 'function' ? isDonePrayer(p, today, r) : (r && r[p] === false)) return false;
        if (typeof isPrayerUpcoming === 'function' && isPrayerUpcoming(p, today)) return false;
        if (curPrayerName && curPrayerName === p) return false;
        return true;
    }).length;
}

function getConsolidatedMissedCount() {
    if (typeof window !== 'undefined' && window.PrayerStore && typeof window.PrayerStore.missedCount === 'function') {
        return window.PrayerStore.missedCount();
    }
    return tMT() + getTodayMissedCount();
}

function datesInRange(s, e) {
    var out = [];
    var d = new Date(s + 'T00:00:00');
    var end = new Date(e + 'T00:00:00');
    while (d <= end) {
        out.push(d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()));
        d.setDate(d.getDate() + 1);
    }
    return out;
}

function prevDate(ds) {
    var d = new Date(ds + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/* ---------- Font size ---------- */
function rdFS() {
    var v = parseFloat(localStorage.getItem(FK));
    return v && v > 0 ? v : DEFAULT_FONT_SIZE;
}

function apFS(v) {
    document.documentElement.style.fontSize = (BASE_FONT_SIZE_PX * v) + 'px';
    document.body.style.fontSize = (BASE_FONT_SIZE_PX * v) + 'px';
    localStorage.setItem(FK, String(v));
}

/* ---------- Start date ---------- */
function rdSD() { return localStorage.getItem(SK) || td(); }
function wrSD(v) { localStorage.setItem(SK, v); }

/* ---------- Date picker ---------- */
function openCal() {
    var dp = $('dp');
    if (dp.showPicker) {
        try { dp.showPicker(); return; } catch (e) { }
    }
    dp.focus();
    dp.click();
}

/* ---------- Click Handler ---------- */
function handleClick(e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.dataset.act;

    if (act === 'toggle-cur') {
        var p = t.dataset.p;
        if (sd === td() && typeof isPrayerUpcoming === 'function' && isPrayerUpcoming(p, sd)) {
            return;
        }
        var c1 = gr(sd);
        var wasDone = typeof isDonePrayer === 'function' ? isDonePrayer(p, sd, c1) : (c1[p] === false);
        if (!confirm(wasDone
            ? 'Mark ' + p + ' as Missed for ' + fr(sd) + '?'
            : 'Mark ' + p + ' as Done for ' + fr(sd) + '?')) return;
        c1[p] = wasDone ? true : false;
        if (wasDone) {
            if (typeof removePrayerHistoryEntry === 'function') {
                removePrayerHistoryEntry(p, 'Current', sd);
            }
        } else {
            if (typeof addPrayerHistoryEntry === 'function') {
                addPrayerHistoryEntry(p, 'Current', sd);
            }
        }
        sr(sd, c1);
        rn();
        if (typeof renderPrayerHistoryTab === 'function' && typeof trackerSubTab !== 'undefined' && trackerSubTab === 'history') {
            renderPrayerHistoryTab();
        }
    } else if (act === 'select-all') {
        var c2 = gr(sd);
        var isToday = sd === td();
        var actionable = P.filter(function (x) {
            return !isToday || (typeof isPrayerUpcoming === 'function' && !isPrayerUpcoming(x, sd));
        });
        var doneCount = actionable.filter(function (x) {
            return typeof isDonePrayer === 'function' ? isDonePrayer(x, sd, c2) : (c2[x] === false);
        }).length;
        var willMarkDone = doneCount < actionable.length;
        var action = willMarkDone ? 'Done' : 'Missed';
        if (!confirm('Mark available prayers as ' + action + ' for ' + fr(sd) + '?')) return;
        actionable.forEach(function (x) {
            var wasXDone = typeof isDonePrayer === 'function' ? isDonePrayer(x, sd, c2) : (c2[x] === false);
            if (willMarkDone) {
                if (!wasXDone && typeof addPrayerHistoryEntry === 'function') {
                    addPrayerHistoryEntry(x, 'Current', sd);
                }
            } else {
                if (wasXDone && typeof removePrayerHistoryEntry === 'function') {
                    removePrayerHistoryEntry(x, 'Current', sd);
                }
            }
            c2[x] = willMarkDone ? false : true;
        });
        sr(sd, c2);
        rn();
        if (typeof renderPrayerHistoryTab === 'function' && typeof trackerSubTab !== 'undefined' && trackerSubTab === 'history') {
            renderPrayerHistoryTab();
        }
    } else if (act === 'jump-today') {
        sd = td();
        if (typeof fetchPrayerTimings === 'function') {
            fetchPrayerTimings(sd, function () {
                if (typeof rn === 'function') rn();
                else if (typeof window.rn === 'function') window.rn();
            });
        }
        if (typeof rn === 'function') rn();
        else if (typeof window.rn === 'function') window.rn();
    } else if (act === 'missed-open') {
        if (typeof window.rMS === 'function') {
            window.rMS();
        } else if (typeof rMS === 'function') {
            rMS();
        }
    } else if (act === 'open-cal') {
        if (typeof openCal === 'function') openCal();
        else if (typeof window.openCal === 'function') window.openCal();
    } else if (act === 'jump') {
        var targetDate = t.dataset.d;
        sd = targetDate;
        var pStore = (typeof PrayerStore !== 'undefined') ? PrayerStore : (typeof window !== 'undefined' ? window.PrayerStore : null);
        if (pStore && typeof pStore.selectedDate === 'function') {
            pStore.selectedDate(targetDate);
        }
        if (typeof sheet2BS !== 'undefined' && sheet2BS && typeof sheet2BS.hide === 'function') {
            sheet2BS.hide();
        } else if (typeof window !== 'undefined' && window.sheet2BS && typeof window.sheet2BS.hide === 'function') {
            window.sheet2BS.hide();
        }
        if (typeof fetchPrayerTimings === 'function') {
            fetchPrayerTimings(targetDate, function () { if (typeof rn === 'function') rn(); });
        }
        if (typeof rn === 'function') rn();
        setTimeout(function () {
            if (typeof showPage === 'function') showPage('current');
            if (typeof switchTab === 'function') switchTab('current');
            if (typeof switchTrackerSubTab === 'function') switchTrackerSubTab('current');
        }, 350);
    } else if (act === 'font') {
        apFS(parseFloat(t.dataset.fs));
        rSET();
    } else if (act === 'pt-save') {
        var sel = $('ptCitySelect');
        var city = '';
        var country = 'India';
        if (sel) {
            if (sel.value === CUSTOM_CITY_VALUE) {
                var customInp = $('ptCustomCityInput');
                city = customInp ? customInp.value.trim() : '';
                var countryInp = $('ptCountryInput');
                if (countryInp && countryInp.value.trim()) {
                    country = countryInp.value.trim();
                }
            } else {
                city = sel.value;
            }
        } else {
            var cityEl = $('ptCityInput');
            city = cityEl ? cityEl.value.trim() : 'Guntur';
        }
        var schoolEl = $('ptSchoolSelect');
        var school = schoolEl ? parseInt(schoolEl.value, 10) : 1;
        if (!city) {
            alert('Please select or enter a city.');
            return;
        }
        if (typeof setPrayerConfig === 'function') {
            setPrayerConfig({ city: city, country: country, school: school });
        }
        if (typeof fetchPrayerTimings === 'function') {
            fetchPrayerTimings(td(), function (err) {
                if (err) {
                    alert('Saved settings, but live API connection failed: ' + err.message);
                } else {
                    alert('Prayer times synced successfully for ' + city + ', ' + country + '!');
                }
                rSET();
            });
        }
    } else if (act === 'sd-save') {
        var v = $('sdInput').value;
        if (!v) { alert('Please pick a date.'); return; }
        if (!confirm('Save Current Start Date as ' + fr(v) + '?')) return;
        wrSD(v);
        rSET();
    } else if (act === 'reset-db') {
        if (confirm('Delete ALL prayer records and cached prayer times?')) {
            localStorage.removeItem(K);
            localStorage.removeItem(OCK);
            localStorage.removeItem(OK);
            localStorage.removeItem(LIK);
            localStorage.removeItem(OIK);
            if (typeof PHK !== 'undefined') localStorage.removeItem(PHK);
            if (typeof clearPrayerHistory === 'function') clearPrayerHistory();
            if (typeof PTK_CACHE !== 'undefined') localStorage.removeItem(PTK_CACHE);
            sd = td();
            ensureCurrentDateInitialized();
            if (typeof fetchPrayerTimings === 'function') fetchPrayerTimings(td());
            rSET();
            if (typeof renderPrayerHistoryTab === 'function' && typeof trackerSubTab !== 'undefined' && trackerSubTab === 'history') {
                renderPrayerHistoryTab();
            }
        }
    } else if (act === 'go-home') {
        showPage('dashboard');
    } else if (act === 'goto-cur') {
        showPage('current');
    } else if (act === 'goto-tracker') {
        showPage('tracker');
    } else if (act === 'switch-track-current') {
        switchTrackerSubTab('current');
    } else if (act === 'switch-track-history') {
        switchTrackerSubTab('history');
    } else if (act === 'history-empty') {
        if (typeof emptyPrayerHistory === 'function') {
            emptyPrayerHistory();
        }
    } else if (act === 'goto-settings') {
        showPage('settings');
    } else if (act === 'goto-tasbeeh') {
        showPage('tasbeeh');
    } else if (act === 'switch-tb-current') {
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('current');
        }
    } else if (act === 'switch-tb-old') {
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('old');
        }
    } else if (act === 'switch-tb-history') {
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('history');
        }
    } else if (act === 'tb-hist-save') {
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.saveHistoryPeriod === 'function') {
            window.TasbeehHistoryApp.saveHistoryPeriod();
        }
    } else if (act === 'tb-hist-reset') {
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.resetHistoryPeriod === 'function') {
            window.TasbeehHistoryApp.resetHistoryPeriod();
        }
    } else if (act === 'tb-hist-preset') {
        var presetType = t.dataset.preset;
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.applyPreset === 'function') {
            window.TasbeehHistoryApp.applyPreset(presetType);
        }
    } else if (act === 'tb-open-settings' || act === 'tb-change-period') {
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('history');
        } else if (window.TasbeehApp && typeof window.TasbeehApp.openPeriodModal === 'function') {
            window.TasbeehApp.openPeriodModal();
        }
    } else if (act === 'tb-old-reopen') {
        if (window.TasbeehApp && typeof window.TasbeehApp.reopenLastMonth === 'function') {
            window.TasbeehApp.reopenLastMonth();
        }
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
            window.TasbeehHistoryApp.renderHistoryTab();
        }
    } else if (act === 'tb-reset-all-completed') {
        if (window.TasbeehApp && typeof window.TasbeehApp.resetAllCompleted === 'function') {
            window.TasbeehApp.resetAllCompleted();
        }
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
            window.TasbeehHistoryApp.renderHistoryTab();
        }
    } else if (act === 'goto-duas') {
        showPage('duas');
    } else if (act === 'dua-switch-pinned') {
        if (window.DuasApp) window.DuasApp.switchTab('home');
    } else if (act === 'dua-switch-all') {
        if (window.DuasApp) window.DuasApp.switchTab('duas');
    } else if (act === 'dua-switch-favs') {
        if (window.DuasApp) window.DuasApp.switchTab('favourites');
    } else if (act === 'dua-open-detail') {
        if (window.DuasApp) {
            var idx = parseInt(t.dataset.idx, 10);
            var src = t.dataset.source || 'home';
            window.DuasApp.openDetail(idx, src);
        }
    } else if (act === 'dua-detail-back') {
        if (window.DuasApp) window.DuasApp.goBack();
    } else if (act === 'dua-prev') {
        if (window.DuasApp) window.DuasApp.changeDua(-1);
    } else if (act === 'dua-next') {
        if (window.DuasApp) window.DuasApp.changeDua(1);
    } else if (act === 'dua-detail-toggle-fav') {
        if (window.DuasApp) window.DuasApp.toggleFavouriteCurrent();
    } else if (act === 'dua-detail-toggle-pin') {
        if (window.DuasApp) window.DuasApp.togglePinCurrent();
    } else if (act === 'dua-item-pin') {
        if (window.DuasApp) {
            var idx = parseInt(t.dataset.idx, 10);
            window.DuasApp.requestPin(idx);
        }
    } else if (act === 'dua-item-fav') {
        if (window.DuasApp) {
            var idx = parseInt(t.dataset.idx, 10);
            window.DuasApp.toggleFavourite(idx);
        }
    } else if (act === 'dua-open-add') {
        if (window.DuasApp) window.DuasApp.openAddModal();
    } else if (act === 'dua-close-add') {
        if (window.DuasApp) window.DuasApp.closeAddModal();
    } else if (act === 'dua-save-new') {
        if (window.DuasApp) window.DuasApp.saveNewDua();
    } else if (act === 'dua-open-admin') {
        if (window.DuasApp) window.DuasApp.openAdminModal();
    } else if (act === 'dua-close-admin') {
        if (window.DuasApp) window.DuasApp.closeAdminModal();
    } else if (act === 'dua-reset-all') {
        if (window.DuasApp) window.DuasApp.resetAllData();
    } else if (act === 'dua-close-pin-confirm') {
        if (window.DuasApp) window.DuasApp.closePinConfirm();
    } else if (act === 'dua-replace-pin') {
        if (window.DuasApp) {
            var oldIdx = parseInt(t.dataset.oldIdx, 10);
            window.DuasApp.replacePin(oldIdx);
        }
    } else if (act === 'dua-del') {
        if (window.DuasApp) {
            var delIdx = parseInt(t.dataset.idx, 10);
            window.DuasApp.deleteDua(delIdx);
        }
    } else if (act === 'dua-retry') {
        if (window.DuasApp && typeof window.DuasApp.fetchDuas === 'function') {
            window.DuasApp.fetchDuas();
        }
    }
}

/* ---------- Input handlers ---------- */
document.addEventListener('click', handleClick);

/* ============================================================
   NUR PRAYER - VANILLA UI COMPONENT ENGINE
   Replaces Bootstrap Modal, Offcanvas & Collapse with 0 external dependencies
   ============================================================ */
(function (window) {
    'use strict';

    // 1. Modal Engine
    function Modal(element, options) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.options = options || {};
        if (this.element) {
            this.element._uiModal = this;
        }
    }

    Modal.prototype.show = function () {
        if (!this.element) return;
        var el = this.element;
        el.style.display = 'flex';
        // Force reflow for smooth animation
        void el.offsetWidth;
        el.classList.add('show');
        el.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        try {
            el.dispatchEvent(new CustomEvent('shown.bs.modal', { bubbles: true }));
            el.dispatchEvent(new CustomEvent('shown', { bubbles: true }));
        } catch (_) {}
    };

    Modal.prototype.hide = function () {
        if (!this.element) return;
        var el = this.element;
        el.classList.remove('show');
        el.setAttribute('aria-hidden', 'true');
        setTimeout(function () {
            if (!el.classList.contains('show')) {
                el.style.display = 'none';
            }
        }, 220);
        if (!document.querySelector('.modal.show') && !document.querySelector('.offcanvas.show')) {
            document.body.classList.remove('modal-open');
        }
        try {
            el.dispatchEvent(new CustomEvent('hidden.bs.modal', { bubbles: true }));
            el.dispatchEvent(new CustomEvent('hidden', { bubbles: true }));
        } catch (_) {}
    };

    Modal.prototype.toggle = function () {
        if (!this.element) return;
        if (this.element.classList.contains('show')) {
            this.hide();
        } else {
            this.show();
        }
    };

    Modal.getInstance = function (element) {
        var el = typeof element === 'string' ? document.querySelector(element) : element;
        return el ? el._uiModal || null : null;
    };

    Modal.getOrCreateInstance = function (element, options) {
        return Modal.getInstance(element) || new Modal(element, options);
    };

    // 2. Offcanvas Engine
    function getOrCreateOffcanvasBackdrop() {
        var bd = document.getElementById('uiOffcanvasBackdrop');
        if (!bd) {
            bd = document.createElement('div');
            bd.id = 'uiOffcanvasBackdrop';
            bd.className = 'offcanvas-backdrop';
            document.body.appendChild(bd);
            bd.addEventListener('click', function () {
                var openSheet = document.querySelector('.offcanvas.show');
                if (openSheet) {
                    var instance = Offcanvas.getInstance(openSheet);
                    if (instance) instance.hide();
                    else openSheet.classList.remove('show');
                }
            });
        }
        return bd;
    }

    function Offcanvas(element, options) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.options = options || {};
        if (this.element) {
            this.element._uiOffcanvas = this;
        }
    }

    Offcanvas.prototype.show = function () {
        if (!this.element) return;
        var bd = getOrCreateOffcanvasBackdrop();
        // Force reflow
        void bd.offsetWidth;
        bd.classList.add('show');
        this.element.classList.add('show');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('role', 'dialog');
        this.element.removeAttribute('aria-hidden');
        document.body.classList.add('modal-open');
        try {
            this.element.dispatchEvent(new CustomEvent('shown.bs.offcanvas', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('shown', { bubbles: true }));
        } catch (_) {}
    };

    Offcanvas.prototype.hide = function () {
        if (!this.element) return;
        this.element.classList.remove('show');
        this.element.setAttribute('aria-hidden', 'true');
        var bd = document.getElementById('uiOffcanvasBackdrop');
        if (bd) bd.classList.remove('show');
        if (!document.querySelector('.modal.show') && !document.querySelector('.offcanvas.show')) {
            document.body.classList.remove('modal-open');
        }
        try {
            this.element.dispatchEvent(new CustomEvent('hidden.bs.offcanvas', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('hidden', { bubbles: true }));
        } catch (_) {}
    };

    Offcanvas.prototype.toggle = function () {
        if (!this.element) return;
        if (this.element.classList.contains('show')) {
            this.hide();
        } else {
            this.show();
        }
    };

    Offcanvas.getInstance = function (element) {
        var el = typeof element === 'string' ? document.querySelector(element) : element;
        return el ? el._uiOffcanvas || null : null;
    };

    Offcanvas.getOrCreateInstance = function (element, options) {
        return Offcanvas.getInstance(element) || new Offcanvas(element, options);
    };

    // 3. Collapse Engine
    function Collapse(element, options) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.options = options || {};
        if (this.element) {
            this.element._uiCollapse = this;
        }
    }

    Collapse.prototype.show = function () {
        if (!this.element) return;
        this.element.classList.add('show');
        try {
            this.element.dispatchEvent(new CustomEvent('shown.bs.collapse', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('shown', { bubbles: true }));
        } catch (_) {}
    };

    Collapse.prototype.hide = function () {
        if (!this.element) return;
        this.element.classList.remove('show');
        try {
            this.element.dispatchEvent(new CustomEvent('hidden.bs.collapse', { bubbles: true }));
            this.element.dispatchEvent(new CustomEvent('hidden', { bubbles: true }));
        } catch (_) {}
    };

    Collapse.prototype.toggle = function () {
        if (!this.element) return;
        if (this.element.classList.contains('show')) {
            this.hide();
        } else {
            this.show();
        }
    };

    Collapse.getInstance = function (element) {
        var el = typeof element === 'string' ? document.querySelector(element) : element;
        return el ? el._uiCollapse || null : null;
    };

    Collapse.getOrCreateInstance = function (element, options) {
        return Collapse.getInstance(element) || new Collapse(element, options);
    };

    // 4. Global Event Delegation (Dismiss, Collapse Toggle, Escape, Backdrop Click)
    document.addEventListener('click', function (e) {
        // A. Dismiss Modal
        var dismissModalBtn = e.target.closest('[data-bs-dismiss="modal"], [data-dismiss="modal"]');
        if (dismissModalBtn) {
            var modal = dismissModalBtn.closest('.modal');
            if (modal) {
                var inst = Modal.getOrCreateInstance(modal);
                inst.hide();
            }
            return;
        }

        // B. Dismiss Offcanvas
        var dismissOffcanvasBtn = e.target.closest('[data-bs-dismiss="offcanvas"], [data-dismiss="offcanvas"]');
        if (dismissOffcanvasBtn) {
            var offcanvas = dismissOffcanvasBtn.closest('.offcanvas');
            if (offcanvas) {
                var offInst = Offcanvas.getOrCreateInstance(offcanvas);
                offInst.hide();
            }
            return;
        }

        // C. Toggle Collapse (Accordions)
        var toggleCollapseBtn = e.target.closest('[data-bs-toggle="collapse"], [data-toggle="collapse"]');
        if (toggleCollapseBtn) {
            e.preventDefault();
            var targetSelector = toggleCollapseBtn.getAttribute('data-bs-target') ||
                toggleCollapseBtn.getAttribute('data-target') ||
                toggleCollapseBtn.getAttribute('href');
            if (targetSelector) {
                var targetEl = document.querySelector(targetSelector);
                if (targetEl) {
                    var isExpanded = targetEl.classList.toggle('show');
                    toggleCollapseBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                    if (isExpanded) {
                        toggleCollapseBtn.classList.remove('collapsed');
                    } else {
                        toggleCollapseBtn.classList.add('collapsed');
                    }
                    try {
                        targetEl.dispatchEvent(new CustomEvent(isExpanded ? 'shown.bs.collapse' : 'hidden.bs.collapse', { bubbles: true }));
                    } catch (_) {}
                }
            }
            return;
        }

        // D. Backdrop click directly on Modal overlay
        if (e.target.classList.contains('modal')) {
            var mInst = Modal.getInstance(e.target);
            if (mInst) mInst.hide();
            else e.target.classList.remove('show');
        }
    });

    // Escape Key Listener
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            var openModal = document.querySelector('.modal.show');
            if (openModal) {
                var mInst = Modal.getInstance(openModal);
                if (mInst) mInst.hide();
                else openModal.classList.remove('show');
                return;
            }
            var openOffcanvas = document.querySelector('.offcanvas.show');
            if (openOffcanvas) {
                var oInst = Offcanvas.getInstance(openOffcanvas);
                if (oInst) oInst.hide();
                else openOffcanvas.classList.remove('show');
            }
        }
    });

    // Standalone UI namespaces
    window.UIModal = Modal;
    window.UIOffcanvas = Offcanvas;
    window.UICollapse = Collapse;

    // Full compatibility shim for existing window.bootstrap references
    window.bootstrap = {
        Modal: Modal,
        Offcanvas: Offcanvas,
        Collapse: Collapse
    };

})(window);

