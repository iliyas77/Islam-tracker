/* ============================================================
   Nur Prayer — Application Logic
   ============================================================ */

/* ---------- Constants ---------- */
var P = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
var K = 'namazTrackerData';
var OCK = 'namazOldData';
var FK = 'namazFontSize';
var CK = 'namazCounters';
var SK = 'namazStartDate';
var OK = 'namazOldPeriod';

var T = {
    Fajr: '05:18 AM', Dhuhr: '12:24 PM', Asr: '04:37 PM',
    Maghrib: '06:15 PM', Isha: '07:28 PM'
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
var eid = null;
var addEid = null;
var sheet2BS, counterBS, addBS;
var cView = { q: '', filter: 'all' };
var dashTimer = null;

/* ---------- Zikir Render ---------- */
function cFilteredList() {
    var list = rdC();
    var q = cView.q.trim().toLowerCase();
    if (q) list = list.filter(function (c) { return String(c.name).toLowerCase().indexOf(q) !== -1; });
    if (cView.filter === 'empty') list = list.filter(function (c) { return c.count === 0; });
    list.sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
    return list;
}

function cRenderTools() {
    var chips = [
        { v: 'all', l: 'All' },
        { v: 'empty', l: 'Not started' }
    ].map(function (o) {
        var on = cView.filter === o.v;
        return '<button type="button" class="btn flex-fill fw-bold filter-chip ' +
            (on ? 'btn-brand' : 'btn-light border') + '" data-act="c-filter" data-f="' + o.v + '">' +
            o.l + '</button>';
    }).join('');

    return '<div class="d-flex align-items-center gap-2 mb-2">' +
        '<div class="search-bar flex-grow-1">' +
        '<span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>' +
        '<input type="text" id="cSearch" class="form-control border-0" ' +
        'placeholder="Search zikir by name" value="' + esc(cView.q) + '">' +
        '<button type="button" class="btn px-3 text-muted ' + (cView.q ? '' : 'd-none') + '" ' +
        'data-act="c-clear-search" style="height:48px;border:none;background:#fff">' +
        '<i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
        '<button type="button" class="btn btn-add-zikir" data-act="new-zikir" title="New Zikir">' +
        '<i class="fa-solid fa-plus fs-4"></i></button>' +
        '</div>' +
        '<div class="d-flex gap-2">' + chips + '</div>';
}

function cRenderCard(c) {
    var count = c.count;
    var days = cDaysSince(c.start);
    var avg = cAvgPerDay(c);
    var nameHtml = cHighlight(c.name, cView.q);
    var startedLabel = count === 0 ? 'Not started yet' : ('Started ' + fr(c.start));

    function tile(label, value, color) {
        return '<div class="col-4"><div class="zikir-tile">' +
            '<div class="label">' + label + '</div>' +
            '<div class="value" style="color:' + color + '">' + value + '</div>' +
            '</div></div>';
    }

    return '<div class="card shadow-sm rounded-4 p-3" role="button" data-act="open-add" data-cid="' + c.id +
        '" style="background:#fff;cursor:pointer">' +
        '<div class="d-flex align-items-center gap-3 mb-3">' +
        '<span class="zikir-card-icon"><i class="fa-solid fa-mosque"></i></span>' +
        '<div class="flex-grow-1 min-w-0">' +
        '<div class="fw-bold text-dark text-truncate" style="font-size:1.15rem">' + nameHtml + '</div>' +
        '</div>' +
        '<button class="btn zikir-edit-btn" data-act="edit-counter" data-cid="' + c.id + '" ' +
        'type="button" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
        '</div>' +
        '<div class="row g-2 mb-3">' +
        tile('Completed', count, '#1b7a4b') +
        tile('Target', c.target, '#1a2b23') +
        tile('Avg / Day', avg, '#6f42c1') +
        '</div>' +
        '<div class="zikir-divider"></div>' +
        '<div class="d-flex align-items-center justify-content-between">' +
        '<span class="d-flex align-items-center gap-2 text-muted" style="font-size:.82rem">' +
        '<i class="fa-regular fa-calendar"></i>' + startedLabel + '</span>' +
        '<span class="zikir-day-pill">' + days + ' day' + (days === 1 ? '' : 's') + '</span>' +
        '</div>' +
        '</div>';
}

function cEmptyState() {
    if (!rdC().length) {
        return '<div class="text-center text-muted py-5">' +
            '<i class="fa-solid fa-plus display-4 text-success opacity-50"></i>' +
            '<p class="mt-3 mb-1 fw-bold">No zikir yet</p>' +
            '<p class="mb-0" style="font-size:.85rem">Tap the + button to create one.</p></div>';
    }
    return '<div class="text-center text-muted py-5">' +
        '<i class="fa-solid fa-magnifying-glass display-4 text-secondary opacity-50"></i>' +
        '<p class="mt-3 mb-1 fw-bold">No matching zikir</p>' +
        '<p class="mb-0" style="font-size:.85rem">Try a different search or filter.</p></div>';
}

function cRenderResults() {
    var list = cFilteredList();
    var cl = $('counterList');
    if (!cl) return;
    cl.innerHTML = list.length
        ? '<div class="d-flex flex-column gap-2">' + list.map(cRenderCard).join('') + '</div>'
        : cEmptyState();
}

function rC() {
    var body = $('zikirBody');
    if (!body) return;
    body.innerHTML = '<div id="counterTools" class="mb-2"></div>' +
        '<div id="counterList" class="d-flex flex-column gap-2"></div>';
    var tools = $('counterTools');
    if (tools) tools.innerHTML = cRenderTools();
    cRenderResults();
}

/* ---------- Modals ---------- */
function oCM(ex) {
    eid = ex ? ex.id : null;
    var resetBtn = $('cResetBtn');
    var delBtn = $('cDeleteBtn');
    if (ex) {
        $('counterModalTitleText').textContent = 'Edit Zikir';
        $('cName').value = ex.name;
        $('cTarget').value = ex.target;
        $('cStart').value = ex.start;
        $('cCount').value = ex.count;
        if (resetBtn) resetBtn.style.display = 'block';
        if (delBtn) delBtn.style.display = 'block';
    } else {
        $('counterModalTitleText').textContent = 'Create Zikir';
        $('cName').value = '';
        $('cTarget').value = '';
        $('cStart').value = td();
        $('cCount').value = '0';
        if (resetBtn) resetBtn.style.display = 'none';
        if (delBtn) delBtn.style.display = 'none';
    }
    counterBS.show();
}

function oAM(cid) {
    addEid = cid;
    var c = cFind(cid);
    if (!c) return;
    $('addName').textContent = c.name;
    $('addValue').value = 10;
    updateAddPreview();
    addBS.show();
}

function updateAddPreview() {
    var c = cFind(addEid);
    if (!c) return;
    var v = parseInt($('addValue').value, 10) || 0;
    var nv = Math.min(c.count + v, c.target);
    var willCap = (c.count + v) > c.target;
    $('addPreview').innerHTML = 'New count: ' + nv +
        (willCap ? ' <span class="text-warning">(capped at target)</span>' : '');
    $('addPreview').style.color = willCap ? '#ffc107' : '#1b7a4b';
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', function () {
    sheet2BS = new bootstrap.Offcanvas($('sheet2'));
    counterBS = new bootstrap.Modal($('counterModal'));
    addBS = new bootstrap.Modal($('addModal'));

    apFS(rdFS());
    en(td());
    sd = td();

    showPage('dashboard');

    /* Date picker */
    $('dp').onchange = function (e) { if (e.target.value) go(e.target.value); };

    /* Action buttons */
    $('currentActionBtn').onclick = openCal;
    $('oldActionBtn').onclick = rOldInfo;

    /* Add count modal */
    $('addValue').oninput = updateAddPreview;

    $('addConfirm').onclick = function () {
        var arr = rdC();
        var c = arr.find(function (x) { return x.id === addEid; });
        if (!c) { addBS.hide(); return; }
        var v = parseInt($('addValue').value, 10) || 0;
        if (v < 1) { alert('Please enter a value of at least 1.'); return; }
        var before = c.count;
        var nv = c.count + v;
        if (nv > c.target) nv = c.target;
        var applied = nv - before;
        c.count = nv;
        if (applied > 0) cPushHistory(c, applied);
        wrC(arr);
        addBS.hide();
        rC();
    };

    /* Zikir modal */
    $('cTargetPlus').onclick = function () {
        var v = parseInt($('cTarget').value, 10) || 0;
        $('cTarget').value = v + 100;
    };

    $('cCountPlus').onclick = function () {
        var v = parseInt($('cCount').value, 10) || 0;
        $('cCount').value = v + 100;
    };

    $('cResetBtn').onclick = function () {
        if (!eid) return;
        var cr = cFind(eid);
        if (!cr) return;
        if (!confirm('Reset "' + cr.name + '" count back to 0?\nHistory will be cleared too.')) return;
        cr.count = 0;
        cr.history = [];
        cSaveOne(cr);
        counterBS.hide();
        rC();
    };

    $('cDeleteBtn').onclick = function () {
        if (!eid) return;
        var cd = cFind(eid);
        if (!cd) return;
        if (!confirm('Delete zikir "' + cd.name + '"? This cannot be undone.')) return;
        wrC(rdC().filter(function (x) { return x.id !== eid; }));
        counterBS.hide();
        rC();
    };

    $('counterSave').onclick = function () {
        var n = $('cName').value.trim();
        var tt = parseInt($('cTarget').value, 10);
        var ss = $('cStart').value || td();
        var cc = parseInt($('cCount').value, 10) || 0;
        if (!n) { alert('Please enter a zikir name.'); return; }
        if (!tt || tt < 1) { alert('Please enter a valid target.'); return; }

        var a = rdC();
        if (eid) {
            var x = a.find(function (v) { return v.id === eid; });
            if (x) {
                var oldCount = x.count;
                x.name = n;
                x.target = tt;
                x.start = ss;
                x.count = Math.max(0, cc);
                if (!x.history) x.history = [];
                if (x.count !== oldCount) cPushHistory(x, x.count - oldCount);
            }
        } else {
            a.push({
                id: 'c' + Date.now() + Math.random().toString(36).slice(2, 7),
                name: n,
                target: tt,
                start: ss,
                count: Math.max(0, cc),
                history: [],
                created: Date.now()
            });
        }
        wrC(a);
        counterBS.hide();
        rC();
    };
});