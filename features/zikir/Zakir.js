/* ---------- Counters / Zikir ---------- */
function rdC() { return LS.get(CK) || []; }
function wrC(a) { LS.set(CK, a); }

function cFind(id) {
    return rdC().find(function (x) { return x.id === id; }) || null;
}

function cSaveOne(c) {
    var a = rdC();
    var i = -1;
    for (var k = 0; k < a.length; k++) { if (a[k].id === c.id) { i = k; break; } }
    if (i === -1) a.push(c); else a[i] = c;
    wrC(a);
}

function cPercent(c) {
    if (!c.target || c.target <= 0) return 0;
    return Math.min(100, Math.round((c.count / c.target) * 100));
}

function cDaysSince(start) {
    var a = new Date(start + 'T00:00:00');
    var b = new Date(td() + 'T00:00:00');
    var d = Math.round((b - a) / 864e5);
    return d < 0 ? 0 : d + 1;
}

function cAvgPerDay(c) {
    var d = cDaysSince(c.start);
    if (d <= 0) return 0;
    return Math.round((c.count / d) * 10) / 10;
}

function cPushHistory(c, amount) {
    if (!c.history) c.history = [];
    c.history.push({ d: td(), amount: amount, at: Date.now() });
    if (c.history.length > 200) c.history = c.history.slice(-200);
}

function cHighlight(name, q) {
    var safe = esc(name);
    if (!q) return safe;
    var eq = esc(q);
    var idx = safe.toLowerCase().indexOf(eq.toLowerCase());
    if (idx === -1) return safe;
    return safe.slice(0, idx) +
        '<mark class="mark-highlight">' + safe.slice(idx, idx + eq.length) + '</mark>' +
        safe.slice(idx + eq.length);
}
