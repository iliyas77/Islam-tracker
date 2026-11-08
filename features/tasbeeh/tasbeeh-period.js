/* ============================================================
   Nur Prayer — Digital Tasbeeh: Period Settings & Storage
   Path: features/tasbeeh/tasbeeh-period.js
   Handles:
     - Old Tasbeeh period settings & local storage persistence
     - Period Settings modal (presets, start/end dates, timeline preview)
     - Reset and Preset helpers
   ============================================================ */

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export var TASBEEH_CONSTANTS = _win.TASBEEH_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.TASBEEH) || {};
export var PERIOD_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.PERIOD) || 'app_tasbeeh_period';
export var PERIOD_PRESETS = TASBEEH_CONSTANTS.PERIOD_PRESETS || {
    THIS_YEAR: 'this-year',
    LAST_6_MONTHS: '6-months',
    LAST_1_YEAR: '1-year'
};

export var periodModalInstance = null;

function getEl(id) {
    return document.getElementById(id);
}

var pad2 = function (n) {
    return n < 10 ? '0' + n : '' + n;
};

var td = function () {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
};

function showToast(msg, duration) {
    if (typeof _win.showToast === 'function') {
        _win.showToast(msg, duration);
    }
}

var formatMonthLabel = function (m) {
    if (!m) return '';
    var parts = m.split('-');
    if (parts.length < 2) return m;
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var d = new Date(yr, mo, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

var renderIcon = function (opt) {
    if (typeof _win.renderIcon === 'function' && _win.renderIcon !== renderIcon) return _win.renderIcon(opt);
    return '';
};

/* ---------- Period Storage Layer (YYYY-MM) ---------- */
export function loadPeriod() {
    var raw = localStorage.getItem(PERIOD_KEY);
    var now = new Date();
    var curMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
    var defaultStart = now.getFullYear() + '-01';
    var defaultEnd = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

    if (!raw) {
        var initial = { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        try { localStorage.setItem(PERIOD_KEY, JSON.stringify(initial)); } catch (_) { }
        return initial;
    }
    try {
        var p = JSON.parse(raw);
        if (!p || !p.startDate) {
            return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        }
        var s = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStart;
        var e = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(p.endDate) : String(p.endDate).slice(0, 7)) || defaultEnd;
        var initE = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(p.initialEnd) : String(p.initialEnd || '').slice(0, 7)) || e;
        if (e >= curMonth) {
            e = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curMonth) : e;
        }
        return {
            startDate: s,
            endDate: e,
            initialEnd: initE,
            updatedAt: p.updatedAt || Date.now()
        };
    } catch (_) {
        return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
    }
}

export function savePeriod(start, end, initialEnd) {
    var cur = loadPeriod();
    var s = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(start) : String(start).slice(0, 7));
    var e = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(end) : String(end).slice(0, 7));
    var initE = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(initialEnd) : String(initialEnd || '').slice(0, 7)) || cur.initialEnd || e;
    var p = {
        startDate: s,
        endDate: e,
        initialEnd: initE,
        updatedAt: Date.now()
    };
    try { localStorage.setItem(PERIOD_KEY, JSON.stringify(p)); } catch (_) { }
    return p;
}

/* ---------- Period Settings Modal Management ---------- */
export function updatePeriodPreview() {
    var startInp = getEl('tbPeriodStart');
    var endInp = getEl('tbPeriodEnd');
    var previewText = getEl('tbPeriodPreviewText');
    if (!startInp || !endInp || !previewText) return;

    var startVal = startInp.value;
    var endVal = endInp.value || td();

    if (!startVal) {
        previewText.innerHTML = '<span class="text-danger">Please pick a Start Date.</span>';
        return;
    }

    var startMonth = typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(startVal) : startVal.slice(0, 7);
    var endMonth = typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(endVal) : endVal.slice(0, 7);
    var curMonthName = formatMonthLabel(typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : '');
    var oldMonths = typeof _win.getPreviousMonthsList === 'function' ? _win.getPreviousMonthsList(startMonth, endMonth) : [];

    if (oldMonths.length === 0) {
        previewText.innerHTML =
            '<div><strong>Current Month:</strong> ' + curMonthName + '</div>' +
            '<div class="text-warning mt-1">' + renderIcon({ name: 'triangle-exclamation', className: 'me-1' }) + 'Start Date is in or after current month. No previous months will show in Old tab.</div>';
    } else {
        var newestOldMonth = formatMonthLabel(oldMonths[0]);
        var oldestMonth = formatMonthLabel(oldMonths[oldMonths.length - 1]);
        previewText.innerHTML =
            '<div class="mb-1"><strong>Old Tab Timeline:</strong> ' + formatMonthLabel(startMonth) + ' → ' + formatMonthLabel(endMonth) + '</div>' +
            '<div class="mb-1"><strong>Step-by-Step:</strong> Starts at <strong>' + newestOldMonth + '</strong>, then navigates backward month by month till <strong>' + oldestMonth + '</strong> (' + oldMonths.length + ' total months).</div>' +
            '<div><strong>Current Tab:</strong> ' + curMonthName + '</div>';
    }
}

export function openPeriodModal() {
    var p = loadPeriod();
    var startInp = getEl('tbPeriodStart');
    var endInp = getEl('tbPeriodEnd');
    if (startInp) {
        var sVal = p.startDate || (new Date().getFullYear() + '-01');
        startInp.value = sVal.length === 7 ? (sVal + '-01') : sVal;
    }
    if (endInp) {
        var eVal = p.initialEnd || p.endDate || td();
        endInp.value = eVal.length === 7 ? (eVal + '-01') : eVal;
    }

    updatePeriodPreview();

    var modalEl = getEl('tasbeehPeriodModal');
    if (modalEl) {
        if (!periodModalInstance) {
            var ModalClass = _win.UIModal || (_win.bootstrap && _win.bootstrap.Modal);
            periodModalInstance = ModalClass ? ModalClass.getOrCreateInstance(modalEl) : null;
        }
        if (periodModalInstance) periodModalInstance.show();
    }
}

export function savePeriodModal(onSaved) {
    var startInp = getEl('tbPeriodStart');
    var endInp = getEl('tbPeriodEnd');
    if (!startInp) return;

    var startRaw = startInp.value;
    var endRaw = (endInp && endInp.value) ? endInp.value : td();

    if (!startRaw) {
        if (_win.alert) _win.alert('Please select a Start Date.');
        startInp.focus();
        return;
    }

    var startMonth = typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(startRaw) : startRaw.slice(0, 7);
    var endMonth = typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(endRaw) : endRaw.slice(0, 7);

    if (endMonth < startMonth) {
        if (_win.alert) _win.alert('End Date must be on or after Start Date.');
        if (endInp) endInp.focus();
        return;
    }

    savePeriod(startMonth, endMonth, endMonth);

    if (periodModalInstance) {
        periodModalInstance.hide();
    }

    showToast('Tasbeeh period updated');
    if (typeof onSaved === 'function') {
        onSaved();
    } else if (_win.TasbeehApp && typeof _win.TasbeehApp.switchTab === 'function') {
        _win.TasbeehApp.switchTab('old');
    }
}

export function resetPeriodModal(onReset) {
    var now = new Date();
    var curMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
    var defaultStart = now.getFullYear() + '-01';
    var defaultEnd = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

    var startInp = getEl('tbPeriodStart');
    var endInp = getEl('tbPeriodEnd');
    if (startInp) startInp.value = defaultStart + '-01';
    if (endInp) endInp.value = defaultEnd + '-01';

    savePeriod(defaultStart, defaultEnd, defaultEnd);
    updatePeriodPreview();

    if (periodModalInstance) {
        periodModalInstance.hide();
    }

    showToast('Period reset to current year');
    if (typeof onReset === 'function') {
        onReset();
    } else if (_win.TasbeehApp && typeof _win.TasbeehApp.switchTab === 'function') {
        _win.TasbeehApp.switchTab('old');
    }
}

export function setPeriodPreset(type) {
    var now = new Date();
    var curMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
    var prevMonth = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');
    var startInp = getEl('tbPeriodStart');
    var endInp = getEl('tbPeriodEnd');
    if (!startInp || !endInp) return;

    var startStr = '';
    var endStr = prevMonth + '-01';

    if (type === PERIOD_PRESETS.THIS_YEAR) {
        startStr = now.getFullYear() + '-01-01';
    } else if (type === PERIOD_PRESETS.LAST_6_MONTHS) {
        var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
    } else if (type === PERIOD_PRESETS.LAST_1_YEAR) {
        var d12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        startStr = d12.getFullYear() + '-' + pad2(d12.getMonth() + 1) + '-01';
    }

    startInp.value = startStr;
    endInp.value = endStr;
    updatePeriodPreview();
}

