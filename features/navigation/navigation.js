/* ---------- Navigation (Constants referenced from utilities/constant.js) ---------- */
var NAV_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.NAVIGATION) || {};
var PAGES = NAV_CONSTANTS.PAGES || window.PAGES || ['dashboardPage', 'trackerPage', 'settingsPage', 'tasbeehPage', 'duasPage'];
var NAVS = NAV_CONSTANTS.NAVS || window.NAVS || { dashboard: 'navHome', tracker: 'navCur', current: 'navCur', old: 'navCur', performance: 'navCur', settings: 'navSet', tasbeeh: 'navTasbeeh', duas: 'navDuas' };
var SUB_TABS = NAV_CONSTANTS.SUB_TABS || { CURRENT: 'current', OLD: 'old', PERFORMANCE: 'performance', HISTORY: 'history' };
var PAGE_MAP = NAV_CONSTANTS.PAGE_MAP || {
    dashboard: 'dashboardPage',
    tracker: 'trackerPage',
    current: 'trackerPage',
    old: 'trackerPage',
    performance: 'trackerPage',
    history: 'trackerPage',
    settings: 'settingsPage',
    tasbeeh: 'tasbeehPage',
    duas: 'duasPage'
};
var TRACKER_HEADER = NAV_CONSTANTS.TRACKER_HEADER || {
    current: {
        iconClass: 'calendar text-gr-accent',
        label: 'Current Prayer'
    },
    old: {
        iconClass: 'clock-rotate-left text-warning',
        label: 'Old Tracking'
    },
    performance: {
        iconClass: 'chart-simple text-brand',
        label: 'Performance'
    },
    history: {
        iconClass: 'list-check text-brand',
        label: 'History'
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
    if (typeof window !== 'undefined') {
        window.trackerSubTab = trackerSubTab;
    }
    var btnCur = $('tabTrackCurrent');
    var btnOld = $('tabTrackOld');
    var btnPerf = $('tabTrackPerformance');
    var btnHist = $('tabTrackHistory');
    var bodyCur = $('currentBody');
    var bodyOld = $('oldBody');
    var bodyPerf = $('performanceBody');
    var bodyHist = $('historyBody');
    var oldSub = $('oldSub');
    var oldActionBtn = $('oldActionBtn');
    var currentMissedBtn = $('currentMissedBtn');
    var historyEmptyBtn = $('historyEmptyBtn');
    var headerIcon = $('trackerHeaderIcon');
    var headerLabel = $('trackerHeaderLabel');
    var trackerHeaderTitle = $('trackerHeaderTitle');
    if (trackerHeaderTitle) trackerHeaderTitle.classList.remove('justify-center');
    if (oldSub) oldSub.classList.remove('text-center');
    if (headerIcon) headerIcon.classList.remove('d-none');

    if (trackerSubTab === SUB_TABS.OLD) {
        if (btnCur) {
            btnCur.classList.remove('active');
            btnCur.setAttribute('aria-selected', 'false');
        }
        if (btnOld) {
            btnOld.classList.add('active');
            btnOld.setAttribute('aria-selected', 'true');
        }
        if (btnPerf) {
            btnPerf.classList.remove('active');
            btnPerf.setAttribute('aria-selected', 'false');
        }
        if (btnHist) {
            btnHist.classList.remove('active');
            btnHist.setAttribute('aria-selected', 'false');
        }
        if (bodyCur) bodyCur.classList.add('d-none');
        if (bodyOld) bodyOld.classList.remove('d-none');
        if (bodyPerf) bodyPerf.classList.add('d-none');
        if (bodyHist) bodyHist.classList.add('d-none');
        if (oldSub) oldSub.classList.remove('d-none');
        if (oldActionBtn) oldActionBtn.classList.remove('d-none');
        if (currentMissedBtn) currentMissedBtn.classList.add('d-none');
        if (historyEmptyBtn) historyEmptyBtn.classList.add('d-none');
        if (headerIcon) {
            if (window.Icon && typeof Icon.update === 'function') {
                Icon.update(headerIcon, TRACKER_HEADER.old.iconClass);
            } else {
                headerIcon.className = TRACKER_HEADER.old.iconClass;
            }
        }
        if (headerLabel) headerLabel.textContent = TRACKER_HEADER.old.label;
        rOT();
    } else if (trackerSubTab === SUB_TABS.PERFORMANCE) {
        if (btnCur) {
            btnCur.classList.remove('active');
            btnCur.setAttribute('aria-selected', 'false');
        }
        if (btnOld) {
            btnOld.classList.remove('active');
            btnOld.setAttribute('aria-selected', 'false');
        }
        if (btnPerf) {
            btnPerf.classList.add('active');
            btnPerf.setAttribute('aria-selected', 'true');
        }
        if (btnHist) {
            btnHist.classList.remove('active');
            btnHist.setAttribute('aria-selected', 'false');
        }
        if (bodyCur) bodyCur.classList.add('d-none');
        if (bodyOld) bodyOld.classList.add('d-none');
        if (bodyPerf) bodyPerf.classList.remove('d-none');
        if (bodyHist) bodyHist.classList.add('d-none');
        if (oldSub) {
            oldSub.classList.remove('d-none');
            var sdate = typeof rdSD === 'function' ? rdSD() : td();
            var totalDays = typeof window.datesInRange === 'function' ? window.datesInRange(sdate, td()).length : 1;
            oldSub.textContent = fr(sdate) + ' → ' + fr(td()) + ' (' + totalDays + (totalDays === 1 ? ' day' : ' days') + ')';
        }
        if (oldActionBtn) oldActionBtn.classList.add('d-none');
        if (currentMissedBtn) currentMissedBtn.classList.add('d-none');
        if (historyEmptyBtn) historyEmptyBtn.classList.add('d-none');
        if (headerIcon) {
            var perfIcon = (TRACKER_HEADER.performance && TRACKER_HEADER.performance.iconClass) || 'chart-simple text-brand';
            if (window.Icon && typeof Icon.update === 'function') {
                Icon.update(headerIcon, perfIcon);
            } else {
                headerIcon.className = perfIcon;
            }
        }
        if (headerLabel) {
            headerLabel.textContent = (TRACKER_HEADER.performance && TRACKER_HEADER.performance.label) || 'Performance';
        }
        if (typeof renderPerformanceTab === 'function') {
            renderPerformanceTab();
        }
    } else if (trackerSubTab === SUB_TABS.HISTORY) {
        if (btnCur) {
            btnCur.classList.remove('active');
            btnCur.setAttribute('aria-selected', 'false');
        }
        if (btnOld) {
            btnOld.classList.remove('active');
            btnOld.setAttribute('aria-selected', 'false');
        }
        if (btnPerf) {
            btnPerf.classList.remove('active');
            btnPerf.setAttribute('aria-selected', 'false');
        }
        if (btnHist) {
            btnHist.classList.add('active');
            btnHist.setAttribute('aria-selected', 'true');
        }
        if (bodyCur) bodyCur.classList.add('d-none');
        if (bodyOld) bodyOld.classList.add('d-none');
        if (bodyPerf) bodyPerf.classList.add('d-none');
        if (bodyHist) bodyHist.classList.remove('d-none');
        if (oldSub) {
            oldSub.classList.remove('d-none');
            var histEntries = typeof getPrayerHistory === 'function' ? getPrayerHistory() : [];
            oldSub.textContent = 'Activity Log · ' + histEntries.length + (histEntries.length === 1 ? ' entry' : ' entries');
        }
        if (oldActionBtn) oldActionBtn.classList.add('d-none');
        if (currentMissedBtn) currentMissedBtn.classList.add('d-none');
        if (historyEmptyBtn) historyEmptyBtn.classList.remove('d-none');
        if (headerIcon) {
            headerIcon.classList.add('d-none');
        }
        if (headerLabel) {
            headerLabel.textContent = (TRACKER_HEADER.history && TRACKER_HEADER.history.label) || 'History';
        }
        if (trackerHeaderTitle) {
            trackerHeaderTitle.classList.add('justify-center');
        }
        if (oldSub) {
            oldSub.classList.add('text-center');
        }
        if (typeof renderPrayerHistoryTab === 'function') {
            renderPrayerHistoryTab();
        }
    } else {
        if (btnCur) {
            btnCur.classList.add('active');
            btnCur.setAttribute('aria-selected', 'true');
        }
        if (btnOld) {
            btnOld.classList.remove('active');
            btnOld.setAttribute('aria-selected', 'false');
        }
        if (btnPerf) {
            btnPerf.classList.remove('active');
            btnPerf.setAttribute('aria-selected', 'false');
        }
        if (btnHist) {
            btnHist.classList.remove('active');
            btnHist.setAttribute('aria-selected', 'false');
        }
        if (bodyCur) bodyCur.classList.remove('d-none');
        if (bodyOld) bodyOld.classList.add('d-none');
        if (bodyPerf) bodyPerf.classList.add('d-none');
        if (bodyHist) bodyHist.classList.add('d-none');
        if (oldSub) oldSub.classList.add('d-none');
        if (oldActionBtn) oldActionBtn.classList.add('d-none');
        if (currentMissedBtn) currentMissedBtn.classList.remove('d-none');
        if (historyEmptyBtn) historyEmptyBtn.classList.add('d-none');
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
    } else if (kind === 'performance') {
        switchTrackerSubTab('performance');
    } else if (kind === 'history') {
        switchTrackerSubTab('history');
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

if (typeof window !== 'undefined') {
    window.switchTrackerSubTab = switchTrackerSubTab;
    window.showPage = showPage;
    window.setNav = setNav;
    window.SUB_TABS = SUB_TABS;
    window.TRACKER_HEADER = TRACKER_HEADER;
}
