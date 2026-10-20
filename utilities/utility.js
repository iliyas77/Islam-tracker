/* ============================================================
   Nur Prayer — Utilities
   Path: utilities/utility.js
   ============================================================ */

/* ---------- Helpers ---------- */
function $(id) { return document.getElementById(id); }
function pad2(n) { return String(n).padStart(2, '0'); }

function td() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function fr(ds) {
    return new Date(ds + 'T00:00:00').toLocaleDateString(undefined,
        { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
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
    if (!r) return false;
    if (r[p] === 'done') return true;
    var today = td();
    if (dateStr && dateStr < today) {
        return r[p] !== true && r[p] !== 'missed' && r[p] !== undefined;
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

/* ---------- Prayer data ---------- */
function rd() { return LS.get(K) || {}; }
function gr(d) { return rd()[d] || {}; }
function sr(d, r) { var a = rd(); a[d] = r; LS.set(K, a); }

function en(d) {
    var r = gr(d);
    var c = false;
    var u = Object.assign({}, r);
    P.forEach(function (p) { if (!(p in u)) { u[p] = false; c = true; } });
    if (c) sr(d, u);
    return u;
}

/* ---------- Old tracking data ---------- */
function rdOC() { return LS.get(OCK) || {}; }
function grO(d) { return rdOC()[d] || {}; }
function srO(d, r) { var a = rdOC(); a[d] = r; LS.set(OCK, a); }

/* ---------- Misc data queries ---------- */
function mBD() {
    var a = rd();
    var today = td();
    return Object.keys(a).sort()
        .filter(function (d) { return d !== today; })
        .map(function (d) {
            return { date: d, prayers: P.filter(function (p) { return a[d][p] === true; }) };
        })
        .filter(function (x) { return x.prayers.length > 0; });
}

function tMT() {
    var a = rd();
    var today = td();
    var t = 0;
    Object.keys(a).forEach(function (d) {
        if (d === today) return;
        P.forEach(function (p) { if (a[d][p] === true) t++; });
    });
    return t;
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
    if (!o) return;
    var dates = datesInRange(o.start, o.end);
    var a = rdOC();
    var changed = false;
    dates.forEach(function (d) {
        if (!a[d]) a[d] = {};
        P.forEach(function (p) {
            if (!(p in a[d])) { a[d][p] = true; changed = true; }
        });
    });
    if (changed) LS.set(OCK, a);
}

function currentOldDate() {
    var o = rdOK();
    if (!o) return null;
    var dates = datesInRange(o.start, o.end).slice().reverse();
    var a = rdOC();
    for (var i = 0; i < dates.length; i++) {
        var d = dates[i];
        var r = a[d] || {};
        if (P.filter(function (p) { return r[p] === true; }).length > 0) return d;
    }
    return null;
}

function shrinkOldPeriod() {
    var o = rdOK();
    if (!o) return;
    var a = rdOC();
    var cur = o.end;
    var changed = false;
    while (cur >= o.start) {
        var r = a[cur] || {};
        var mc = P.filter(function (p) { return r[p] === true; }).length;
        if (mc === 0) { delete a[cur]; cur = prevDate(cur); changed = true; }
        else break;
    }
    if (changed) {
        LS.set(OCK, a);
        if (cur < o.start) { localStorage.removeItem(OK); return; }
        wrOK({ start: o.start, end: cur, created: o.created });
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
        var wasDone = typeof isDonePrayer === 'function' ? isDonePrayer(p, sd, c1) : (c1[p] === 'done');
        if (!confirm(wasDone
            ? 'Mark ' + p + ' as Missed for ' + fr(sd) + '?'
            : 'Mark ' + p + ' as Done for ' + fr(sd) + '?')) return;
        c1[p] = wasDone ? (sd < td() ? true : 'missed') : 'done';
        sr(sd, c1);
        rn();
    } else if (act === 'select-all') {
        var c2 = gr(sd);
        var isToday = sd === td();
        var actionable = P.filter(function (x) {
            return !isToday || (typeof isPrayerUpcoming === 'function' && !isPrayerUpcoming(x, sd));
        });
        var doneCount = actionable.filter(function (x) {
            return typeof isDonePrayer === 'function' ? isDonePrayer(x, sd, c2) : (c2[x] === 'done');
        }).length;
        var willMarkDone = doneCount < actionable.length;
        var action = willMarkDone ? 'Done' : 'Missed';
        if (!confirm('Mark available prayers as ' + action + ' for ' + fr(sd) + '?')) return;
        actionable.forEach(function (x) {
            c2[x] = willMarkDone ? 'done' : (sd < td() ? true : 'missed');
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
    } else if (act === 'open-cal') {
        openCal();
    } else if (act === 'old-info') {
        rOldInfo();
    } else if (act === 'old-mark-all-done') {
        var curD = currentOldDate();
        if (!curD) return;
        if (!confirm('Mark all prayers as Done for ' + fr(curD) + '?')) return;
        var cOld = grO(curD);
        P.forEach(function (x) { cOld[x] = false; });
        srO(curD, cOld);
        shrinkOldPeriod();
        rOT();
    } else if (act === 'toggle-old') {
        var p2 = t.dataset.p, d2 = t.dataset.d;
        var c3 = grO(d2);
        var was2 = c3[p2] === true;
        if (!confirm(was2
            ? 'Mark ' + p2 + ' as Done for ' + fr(d2) + '?'
            : 'Mark ' + p2 + ' as Missed for ' + fr(d2) + '?')) return;
        c3[p2] = !was2;
        srO(d2, c3);
        shrinkOldPeriod();
        rOT();
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
        wrOK({ start: s, end: en2, created: Date.now() });
        ensureAllOldMissed();
        rOldInfo();
    } else if (act === 'old-clear') {
        if (confirm('Clear the saved Old Tracking period and all its data?')) {
            localStorage.removeItem(OK);
            localStorage.removeItem(OCK);
            sheet2BS.hide();
            rOT();
        }
    } else if (act === 'reset-db') {
        if (confirm('Delete ALL prayer records and cached prayer times?')) {
            localStorage.removeItem(K);
            localStorage.removeItem(OCK);
            localStorage.removeItem(OK);
            if (typeof PTK_CACHE !== 'undefined') localStorage.removeItem(PTK_CACHE);
            sd = td();
            en(sd);
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
    } else if (act === 'tb-complete-month') {
        if (window.TasbeehApp && typeof window.TasbeehApp.markCurrentMonthCompleted === 'function') {
            window.TasbeehApp.markCurrentMonthCompleted(t.dataset.month);
        }
    } else if (act === 'tb-prev-month') {
        if (window.TasbeehApp && typeof window.TasbeehApp.prevOldMonth === 'function') {
            window.TasbeehApp.prevOldMonth();
        }
    } else if (act === 'tb-next-month') {
        if (window.TasbeehApp && typeof window.TasbeehApp.nextOldMonth === 'function') {
            window.TasbeehApp.nextOldMonth();
        }
    } else if (act === 'tb-old-reopen') {
        if (window.TasbeehApp && typeof window.TasbeehApp.reopenLastMonth === 'function') {
            window.TasbeehApp.reopenLastMonth();
        }
    } else if (act === 'tb-reset-all-completed') {
        if (window.TasbeehApp && typeof window.TasbeehApp.resetAllCompleted === 'function') {
            window.TasbeehApp.resetAllCompleted();
        }
    } else if (act === 'tb-open-old') {
        if (window.TasbeehApp && typeof window.TasbeehApp.openCounterOld === 'function') {
            window.TasbeehApp.openCounterOld(t.dataset.id, t.dataset.month);
        }
    } else if (act === 'tb-edit-old-item') {
        if (window.TasbeehApp && typeof window.TasbeehApp.editOldItemCount === 'function') {
            window.TasbeehApp.editOldItemCount(t.dataset.id, t.dataset.month);
        }
    } else if (act === 'tb-toggle-old-done') {
        if (window.TasbeehApp && typeof window.TasbeehApp.toggleOldItemDone === 'function') {
            window.TasbeehApp.toggleOldItemDone(t.dataset.id, t.dataset.month);
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

