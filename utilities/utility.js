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
        var c1 = gr(sd);
        var wasMissed = c1[p] === true;
        if (!confirm(wasMissed
            ? 'Mark ' + p + ' as Not yet for ' + fr(sd) + '?'
            : 'Mark ' + p + ' as Missed for ' + fr(sd) + '?')) return;
        c1[p] = !wasMissed;
        sr(sd, c1);
        rn();
    } else if (act === 'select-all') {
        var c2 = gr(sd);
        var missedNow = P.filter(function (x) { return c2[x] === true; }).length;
        var allMissed = missedNow === P.length;
        var action = allMissed ? 'Not yet' : 'Missed';
        if (!confirm('Mark all 5 prayers as ' + action + ' for ' + fr(sd) + '?')) return;
        P.forEach(function (x) { c2[x] = !allMissed; });
        sr(sd, c2);
        rn();
    } else if (act === 'jump-today') {
        sd = td(); rn();
    } else if (act === 'missed-open') {
        rMS();
    } else if (act === 'toggle-old') {
        var p2 = t.dataset.p, d2 = t.dataset.d;
        var c3 = grO(d2);
        var was2 = c3[p2] === true;
        if (!confirm(was2
            ? 'Mark ' + p2 + ' as Done for ' + fr(d2) + '?'
            : 'Mark ' + p2 + ' as Missed for ' + fr(d2) + '?')) return;
        c3[p2] = !was2;
        srO(d2, c3);
        rOT();
    } else if (act === 'old-change-period') {
        rPeriod();
    } else if (act === 'jump') {
        sd = t.dataset.d;
        sheet2BS.hide();
        setTimeout(function () { showPage('current'); }, 350);
    } else if (act === 'font') {
        apFS(parseFloat(t.dataset.fs));
        rSET();
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
        if (confirm('Delete ALL prayer records?')) {
            localStorage.removeItem(K);
            localStorage.removeItem(OCK);
            localStorage.removeItem(OK);
            sd = td();
            en(sd);
            rSET();
        }
    } else if (act === 'go-home') {
        showPage('dashboard');
    } else if (act === 'goto-cur') {
        showPage('current');
    } else if (act === 'goto-old') {
        showPage('old');
    } else if (act === 'goto-settings') {
        showPage('settings');
    } else if (act === 'goto-tasbeeh') {
        showPage('tasbeeh');
    }
}

/* ---------- Input handlers ---------- */
document.addEventListener('click', handleClick);

