/* ---------- Navigation (Constants referenced from utilities/constant.js) ---------- */
var NAV_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.NAVIGATION) || {};
var PAGES = NAV_CONSTANTS.PAGES || window.PAGES || ['dashboardPage', 'trackerPage', 'settingsPage', 'tasbeehPage', 'duasPage'];
var NAVS = NAV_CONSTANTS.NAVS || window.NAVS || { dashboard: 'navHome', tracker: 'navCur', current: 'navCur', old: 'navCur', settings: 'navSet', tasbeeh: 'navTasbeeh', duas: 'navDuas' };
var SUB_TABS = NAV_CONSTANTS.SUB_TABS || { CURRENT: 'current', OLD: 'old' };
var PAGE_MAP = NAV_CONSTANTS.PAGE_MAP || {
    dashboard: 'dashboardPage',
    tracker: 'trackerPage',
    current: 'trackerPage',
    old: 'trackerPage',
    settings: 'settingsPage',
    tasbeeh: 'tasbeehPage',
    duas: 'duasPage'
};
var TRACKER_HEADER = NAV_CONSTANTS.TRACKER_HEADER || {
    current: {
        iconClass: 'fa-regular fa-calendar text-gr-accent',
        label: 'Current Prayer'
    },
    old: {
        iconClass: 'fa-solid fa-clock-rotate-left text-warning',
        label: 'Old Tracking'
    }
};
var NAV_CLASSES = NAV_CONSTANTS.NAV_CLASSES || {
    ACTIVE: 'text-brand',
    INACTIVE: 'text-secondary',
    BAR: 'bg-brand rounded-pill nav-active-bar'
};

var trackerSubTab = SUB_TABS.CURRENT;

function switchTrackerSubTab(subTab) {
    trackerSubTab = subTab || SUB_TABS.CURRENT;
    var btnCur = $('tabTrackCurrent');
    var btnOld = $('tabTrackOld');
    var bodyCur = $('currentBody');
    var bodyOld = $('oldBody');
    var oldSub = $('oldSub');
    var oldActionBtn = $('oldActionBtn');
    var currentMissedBtn = $('currentMissedBtn');
    var headerIcon = $('trackerHeaderIcon');
    var headerLabel = $('trackerHeaderLabel');

    if (trackerSubTab === SUB_TABS.OLD) {
        if (btnCur) {
            btnCur.classList.remove('active');
            btnCur.setAttribute('aria-selected', 'false');
        }
        if (btnOld) {
            btnOld.classList.add('active');
            btnOld.setAttribute('aria-selected', 'true');
        }
        if (bodyCur) bodyCur.classList.add('d-none');
        if (bodyOld) bodyOld.classList.remove('d-none');
        if (oldSub) oldSub.classList.remove('d-none');
        if (oldActionBtn) oldActionBtn.classList.remove('d-none');
        if (currentMissedBtn) currentMissedBtn.classList.add('d-none');
        if (headerIcon) {
            if (window.Icon && typeof Icon.update === 'function') {
                Icon.update(headerIcon, TRACKER_HEADER.old.iconClass);
            } else {
                headerIcon.className = TRACKER_HEADER.old.iconClass;
            }
        }
        if (headerLabel) headerLabel.textContent = TRACKER_HEADER.old.label;
        rOT();
    } else {
        if (btnCur) {
            btnCur.classList.add('active');
            btnCur.setAttribute('aria-selected', 'true');
        }
        if (btnOld) {
            btnOld.classList.remove('active');
            btnOld.setAttribute('aria-selected', 'false');
        }
        if (bodyCur) bodyCur.classList.remove('d-none');
        if (bodyOld) bodyOld.classList.add('d-none');
        if (oldSub) oldSub.classList.add('d-none');
        if (oldActionBtn) oldActionBtn.classList.add('d-none');
        if (currentMissedBtn) currentMissedBtn.classList.remove('d-none');
        if (headerIcon) {
            if (window.Icon && typeof Icon.update === 'function') {
                Icon.update(headerIcon, TRACKER_HEADER.current.iconClass);
            } else {
                headerIcon.className = TRACKER_HEADER.current.iconClass;
            }
        }
        if (headerLabel) headerLabel.textContent = TRACKER_HEADER.current.label;
        rn();
    }
}

function setNav(id) {
    Object.values(NAVS).forEach(function (n) {
        var b = $(n);
        if (!b) return;
        b.classList.remove(NAV_CLASSES.ACTIVE);
        b.classList.add(NAV_CLASSES.INACTIVE);
        var bar = b.querySelector('.bg-brand');
        if (bar) bar.remove();
    });
    var el = $(id);
    if (!el) return;
    el.classList.remove(NAV_CLASSES.INACTIVE);
    el.classList.add(NAV_CLASSES.ACTIVE);
    var bar = document.createElement('span');
    bar.className = NAV_CLASSES.BAR;
    el.appendChild(bar);
}

function showPage(kind) {
    PAGES.forEach(function (id) {
        var el = $(id);
        if (el) { el.classList.add('d-none'); el.classList.remove('flex'); }
    });

    var target = PAGE_MAP[kind] || null;

    if (!target) return;

    var el = $(target);
    if (el) {
        el.classList.remove('d-none');
        el.classList.add('flex');
    }

    setNav(NAVS[kind] || 'navCur');

    if (kind !== 'tasbeeh') {
        var cv = $('tasbeehCounterView');
        if (cv && !cv.classList.contains('d-none')) {
            if (window.TasbeehApp && typeof window.TasbeehApp.closeCounter === 'function') {
                window.TasbeehApp.closeCounter();
            }
        }
    }

    if (kind === 'dashboard') {
        rDashboard();
    } else if (kind === 'current') {
        switchTrackerSubTab('current');
    } else if (kind === 'old') {
        switchTrackerSubTab('old');
    } else if (kind === 'tracker') {
        switchTrackerSubTab(trackerSubTab || 'current');
    } else if (kind === 'settings') {
        rSET();
    } else if (kind === 'tasbeeh') {
        if (window.TasbeehApp && typeof window.TasbeehApp.render === 'function') {
            window.TasbeehApp.render();
        }
    } else if (kind === 'duas') {
        if (window.DuasApp && typeof window.DuasApp.render === 'function') {
            window.DuasApp.render();
        }
    }
}
