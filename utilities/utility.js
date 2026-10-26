/* ============================================================
   Nur Prayer — Utilities
   Path: utilities/utility.js
   ============================================================ */

/* ---------- Helpers ---------- */
function $(id) { return document.getElementById(id); }
function getEl(id) { return document.getElementById(id); }
function pad2(n) { return String(n).padStart(2, '0'); }

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function td() {
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

function formatMonthLabel(mKey) {
    if (!mKey) return '';
    var parts = mKey.split('-');
    if (parts.length < 2) return mKey;
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function getPreviousMonthEnd() {
    var now = new Date();
    var lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
    return lastDayPrev.getFullYear() + '-' + pad2(lastDayPrev.getMonth() + 1) + '-' + pad2(lastDayPrev.getDate());
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
    var diff = Math.round((d1 - d2) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === 2) return 'Day Before Yesterday';
    return diff + ' Days Ago';
}

function dashDate() {
    return new Date().toLocaleDateString(undefined,
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

function escHtml(str) {
    return esc(str);
}

function uid(prefix) {
    prefix = prefix || 'tb_';
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function vibrate(pattern) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch (_) {}
    }
}

function createRipple(e, container) {
    if (!container || !e) return;
    var rect = container.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement('span');
    ripple.className = 'tb-ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    var clientX = (e.clientX !== undefined) ? e.clientX : ((e.touches && e.touches[0] && e.touches[0].clientX) || (rect.left + size / 2));
    var clientY = (e.clientY !== undefined) ? e.clientY : ((e.touches && e.touches[0] && e.touches[0].clientY) || (rect.top + size / 2));
    ripple.style.left = (clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (clientY - rect.top - size / 2) + 'px';
    container.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 620);
}

var _globalToastTimer = null;
function showToast(message, duration, toastId) {
    var el = document.getElementById(toastId || 'tbToast');
    if (!el) return;
    duration = duration || 2200;
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
    window.formatMonthLabel = formatMonthLabel;
    window.getPreviousMonthEnd = getPreviousMonthEnd;
    window.getPreviousMonthsList = getPreviousMonthsList;
    window.friendly = friendly;
    window.dashDate = dashDate;
    window.esc = esc;
    window.escHtml = escHtml;
    window.uid = uid;
    window.vibrate = vibrate;
    window.createRipple = createRipple;
    window.showToast = showToast;
    window.tMT = tMT;
    window.mBD = mBD;
    window.getTodayMissedCount = getTodayMissedCount;
    window.getConsolidatedMissedCount = getConsolidatedMissedCount;
    window.rd = rd;
    window.gr = gr;
    window.sr = sr;
    window.en = en;
    window.rdOC = rdOC;
    window.grO = grO;
    window.srO = srO;
    window.isDonePrayer = isDonePrayer;
    window.isPrayerUpcoming = isPrayerUpcoming;
    window.ensureCurrentDateInitialized = ensureCurrentDateInitialized;
    window.migratePrayerData = migratePrayerData;
    window.rdOK = rdOK;
    window.wrOK = wrOK;
    window.ensureAllOldMissed = ensureAllOldMissed;
    window.shrinkOldPeriod = shrinkOldPeriod;
    window.currentOldDate = currentOldDate;
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
    var lastInit = localStorage.getItem('namazLastInitDate');
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
        localStorage.setItem('namazLastInitDate', today);
    }
}

/* ---------- Prayer data ---------- */
function rd() { return LS.get(K) || {}; }

function gr(d) {
    if (d === td() && localStorage.getItem('namazLastInitDate') !== td()) {
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
}

function en(d) {
    // Preserve historical data: reading or navigating to a date must not overwrite or mutate database records
    return gr(d);
}

/* ---------- Old tracking data ---------- */
function rdOC() { return LS.get(OCK) || {}; }

function grO(d) {
    var a = rdOC();
    var r = a[d];
    var out = {};
    if (r) {
        P.forEach(function (p) {
            out[p] = (r[p] === true || r[p] === 'missed');
        });
    } else {
        // Completed entries are removed from database; revisiting defaults all prayers to false (completed)
        P.forEach(function (p) {
            out[p] = false;
        });
    }
    return out;
}

function srO(d, r) {
    var a = rdOC();
    var cleaned = {};
    var hasMissed = false;
    P.forEach(function (p) {
        var val = (r && (r[p] === true || r[p] === 'missed'));
        cleaned[p] = val;
        if (val) hasMissed = true;
    });

    if (!hasMissed) {
        delete a[d];
    } else {
        a[d] = cleaned;
    }
    LS.set(OCK, a);
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

/* ---------- Old tracking helpers ---------- */
function rdOK() { return LS.get(OK) || null; }
function wrOK(o) { LS.set(OK, o); }

function ensureAllOldMissed() {
    var o = rdOK();
    if (!o || o.end < o.start) return;
    if (!o.created) {
        o.created = Date.now();
        o.initialEnd = o.end;
        wrOK(o);
    }
    var initKey = localStorage.getItem('namazOldPeriodInitialized');
    var expectedKey = String(o.created);
    var a = rdOC();
    var isDbEmpty = Object.keys(a).length === 0;
    if (initKey !== expectedKey || isDbEmpty) {
        var rangeEnd = o.initialEnd || o.end;
        var dates = datesInRange(o.start, rangeEnd);
        var changed = false;
        dates.forEach(function (d) {
            if (!a[d]) {
                a[d] = {};
                P.forEach(function (p) {
                    a[d][p] = true;
                });
                changed = true;
            } else {
                P.forEach(function (p) {
                    if (!(p in a[d])) {
                        a[d][p] = true;
                        changed = true;
                    }
                });
            }
        });
        localStorage.setItem('namazOldPeriodInitialized', expectedKey);
        if (changed) LS.set(OCK, a);
    }
}

function currentOldDate() {
    var o = rdOK();
    if (!o || o.end < o.start) return null;
    var dates = datesInRange(o.start, o.end).slice().reverse();
    var a = rdOC();
    for (var i = 0; i < dates.length; i++) {
        var d = dates[i];
        var r = a[d] || {};
        if (P.filter(function (p) { return r[p] === true || r[p] === 'missed'; }).length > 0) return d;
    }
    return null;
}

function shrinkOldPeriod(completedDate) {
    var o = rdOK();
    if (!o) return;
    var curEnd = o.end;
    var changed = false;

    // Keep start date unchanged and automatically set end date to the previous day
    // Continue moving backward one day at a time as previous dates are completed
    while (curEnd >= o.start) {
        var rEnd = grO(curEnd);
        var anyMissed = P.some(function (p) {
            return rEnd[p] === true || rEnd[p] === 'missed';
        });
        if (!anyMissed) {
            curEnd = prevDate(curEnd);
            changed = true;
        } else {
            break;
        }
    }

    if (changed) {
        o.end = curEnd;
        wrOK(o);
    }

    // After completing the current date, automatically navigate to the previous date in Old Tracking
    var nextTarget = completedDate ? prevDate(completedDate) : curEnd;
    if (curEnd >= o.start && nextTarget > curEnd) {
        nextTarget = curEnd;
    }

    if (typeof setOldSd === 'function') {
        setOldSd(nextTarget);
    } else if (typeof oldSd !== 'undefined') {
        oldSd = nextTarget;
    }
}

/* ---------- Font size ---------- */
function rdFS() {
    var v = parseFloat(localStorage.getItem(FK));
    return v && v > 0 ? v : 1;
}

function apFS(v) {
    document.documentElement.style.fontSize = (16 * v) + 'px';
    document.body.style.fontSize = (16 * v) + 'px';
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
        sr(sd, c1);
        rn();
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
            c2[x] = willMarkDone ? false : true;
        });
        sr(sd, c2);
        rn();
    } else if (act === 'jump-today') {
        sd = td();
        if (typeof fetchPrayerTimings === 'function') {
            fetchPrayerTimings(sd, function () { rn(); });
        }
        rn();
    } else if (act === 'missed-open') {
        rMS();
    } else if (act === 'old-open-cal') {
        if (typeof openOldCal === 'function') openOldCal();
    } else if (act === 'open-cal') {
        if (typeof trackerSubTab !== 'undefined' && trackerSubTab === 'old') {
            if (typeof openOldCal === 'function') openOldCal();
        } else {
            openCal();
        }
    } else if (act === 'old-info') {
        rOldInfo();
    } else if (act === 'toggle-old') {
        var p2 = t.dataset.p, d2 = t.dataset.d;
        var c3 = grO(d2);
        var was2 = c3[p2] === true || c3[p2] === 'missed';
        if (!confirm(was2
            ? 'Mark ' + p2 + ' as Done for ' + fr(d2) + '?'
            : 'Mark ' + p2 + ' as Missed for ' + fr(d2) + '?')) return;
        c3[p2] = !was2;
        srO(d2, c3);

        var o = rdOK();
        var isDateComplete = !P.some(function (p) {
            return c3[p] === true || c3[p] === 'missed';
        });

        if (isDateComplete) {
            shrinkOldPeriod(d2);
        } else {
            if (o && d2 > o.end) {
                o.end = d2;
                wrOK(o);
            }
            if (typeof setOldSd === 'function') {
                setOldSd(d2);
            } else if (typeof oldSd !== 'undefined') {
                oldSd = d2;
            }
        }
        rOT();
        if ($('sheet2') && $('sheet2').classList.contains('show') && typeof rOldInfo === 'function') {
            rOldInfo();
        }
    } else if (act === 'old-change-period') {
        rPeriod();
    } else if (act === 'jump') {
        sd = t.dataset.d;
        sheet2BS.hide();
        if (typeof fetchPrayerTimings === 'function') {
            fetchPrayerTimings(sd, function () { rn(); });
        }
        setTimeout(function () { showPage('current'); }, 350);
    } else if (act === 'font') {
        apFS(parseFloat(t.dataset.fs));
        rSET();
    } else if (act === 'pt-save') {
        var sel = $('ptCitySelect');
        var city = '';
        var country = 'India';
        if (sel) {
            if (sel.value === '__custom__') {
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
    } else if (act === 'old-save') {
        var s = $('oldStart').value, en2 = $('oldEnd').value;
        if (!s || !en2) { alert('Please pick both start and end dates.'); return; }
        if (en2 < s) { alert('End date must be after start date.'); return; }
        if (!confirm('Save Old Tracking Period from ' + fr(s) + ' to ' + fr(en2) + '?')) return;
        wrOK({ start: s, end: en2, initialEnd: en2, created: Date.now() });
        localStorage.removeItem('namazOldPeriodInitialized');
        ensureAllOldMissed();
        if (typeof setOldSd === 'function') setOldSd(en2);
        sheet2BS.hide();
        rOT();
        if ($('sheet2') && $('sheet2').classList.contains('show') && typeof rOldInfo === 'function') {
            rOldInfo();
        }
    } else if (act === 'old-clear') {
        if (confirm('Clear the saved Old Tracking period and all its data?')) {
            localStorage.removeItem(OK);
            localStorage.removeItem(OCK);
            localStorage.removeItem('namazOldPeriodInitialized');
            if (typeof setOldSd === 'function') setOldSd(null);
            sheet2BS.hide();
            rOT();
        }
    } else if (act === 'reset-db') {
        if (confirm('Delete ALL prayer records and cached prayer times?')) {
            localStorage.removeItem(K);
            localStorage.removeItem(OCK);
            localStorage.removeItem(OK);
            localStorage.removeItem('namazLastInitDate');
            localStorage.removeItem('namazOldPeriodInitialized');
            if (typeof PTK_CACHE !== 'undefined') localStorage.removeItem(PTK_CACHE);
            sd = td();
            ensureCurrentDateInitialized();
            if (typeof fetchPrayerTimings === 'function') fetchPrayerTimings(td());
            rSET();
        }
    } else if (act === 'go-home') {
        showPage('dashboard');
    } else if (act === 'goto-cur') {
        showPage('current');
    } else if (act === 'goto-tracker') {
        showPage('tracker');
    } else if (act === 'goto-old') {
        showPage('old');
    } else if (act === 'switch-track-current') {
        switchTrackerSubTab('current');
    } else if (act === 'switch-track-old') {
        switchTrackerSubTab('old');
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
    } else if (act === 'tb-open-settings' || act === 'tb-change-period') {
        if (window.TasbeehApp && typeof window.TasbeehApp.openPeriodModal === 'function') {
            window.TasbeehApp.openPeriodModal();
        }
    } else if (act === 'tb-old-reopen') {
        if (window.TasbeehApp && typeof window.TasbeehApp.reopenLastMonth === 'function') {
            window.TasbeehApp.reopenLastMonth();
        }
    } else if (act === 'tb-reset-all-completed') {
        if (window.TasbeehApp && typeof window.TasbeehApp.resetAllCompleted === 'function') {
            window.TasbeehApp.resetAllCompleted();
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
    }
}

/* ---------- Input handlers ---------- */
document.addEventListener('click', handleClick);

