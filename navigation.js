/* ---------- Navigation (Constants referenced from utilities/navigation-constants.js) ---------- */
var NAV_CONSTANTS = window.NAVIGATION_CONSTANTS || (window.CONSTANTS && window.CONSTANTS.NAVIGATION) || {};
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
        iconClass: 'fa-regular fa-calendar-days text-gr-accent',
        label: 'Current Prayer'
    },
    old: {
        iconClass: 'fa-solid fa-clock-rotate-left text-gr-warning',
        label: 'Old Tracking'
    },
    performance: {
        iconClass: 'fa-solid fa-chart-simple text-brand',
        label: 'Performance'
    },
    history: {
        iconClass: 'fa-solid fa-list-check text-brand',
        label: 'History'
    }
};
var NAV_CLASSES = NAV_CONSTANTS.NAV_CLASSES || {
    ACTIVE: 'text-brand',
    INACTIVE: 'text-secondary',
    BAR: 'bg-brand rounded-full absolute bottom-1 h-[3px] w-7'
};

var trackerSubTab = SUB_TABS.CURRENT;

var _ko = typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null);

/* ---------- Reactive Navigation State ---------- */
var NavigationState = {
    activePage: (_ko && _ko.observable) ? _ko.observable('dashboard') : function () { return 'dashboard'; },
    trackerSubTab: (_ko && _ko.observable) ? _ko.observable(SUB_TABS.CURRENT) : function () { return SUB_TABS.CURRENT; },
    tasbeehSubTab: (_ko && _ko.observable) ? _ko.observable('home') : function () { return 'home'; },
    duasSubTab: (_ko && _ko.observable) ? _ko.observable('home') : function () { return 'home'; },
    navigateTo: function (page) {
        showPage(page);
    },
    switchTrackerTab: function (tab) {
        switchTrackerSubTab(tab);
    },
    switchTasbeehTab: function (tab) {
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab(tab);
        }
    },
    switchDuasTab: function (tab) {
        if (window.DuasApp && typeof window.DuasApp.switchTab === 'function') {
            window.DuasApp.switchTab(tab);
        }
    }
};

/**
 * Synchronize DOM elements for tracker subtabs (fallback & legacy compatibility)
 */
function syncTrackerDom(activeTab, subText) {
    var tabs = [
        { id: 'tabTrackCurrent', bodyId: 'currentBody', tab: SUB_TABS.CURRENT },
        { id: 'tabTrackOld', bodyId: 'oldBody', tab: SUB_TABS.OLD },
        { id: 'tabTrackPerformance', bodyId: 'performanceBody', tab: SUB_TABS.PERFORMANCE },
        { id: 'tabTrackHistory', bodyId: 'historyBody', tab: SUB_TABS.HISTORY }
    ];
    tabs.forEach(function (item) {
        var btn = $(item.id);
        var body = $(item.bodyId);
        var isActive = (item.tab === activeTab);
        if (btn) {
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        }
        if (body) {
            body.classList.toggle('d-none', !isActive);
        }
    });

    var oldSub = $('oldSub');
    var oldActionBtn = $('oldActionBtn');
    var currentMissedBtn = $('currentMissedBtn');
    var historyEmptyBtn = $('historyEmptyBtn');
    var headerIcon = $('trackerHeaderIcon');
    var headerLabel = $('trackerHeaderLabel');
    var trackerHeaderTitle = $('trackerHeaderTitle');

    if (trackerHeaderTitle) trackerHeaderTitle.classList.toggle('justify-center', activeTab === SUB_TABS.HISTORY);
    if (oldSub) {
        oldSub.classList.toggle('text-center', activeTab === SUB_TABS.HISTORY);
        oldSub.classList.toggle('d-none', activeTab === SUB_TABS.CURRENT);
        if (subText && activeTab !== SUB_TABS.CURRENT) {
            oldSub.textContent = subText;
        }
    }
    if (currentMissedBtn) currentMissedBtn.classList.toggle('d-none', activeTab !== SUB_TABS.CURRENT);
    if (oldActionBtn) oldActionBtn.classList.toggle('d-none', activeTab !== SUB_TABS.OLD);
    if (historyEmptyBtn) historyEmptyBtn.classList.toggle('d-none', activeTab !== SUB_TABS.HISTORY);

    var hConfig = TRACKER_HEADER[activeTab] || TRACKER_HEADER.current;
    if (headerLabel) headerLabel.textContent = hConfig.label;
    if (headerIcon) {
        if (activeTab === SUB_TABS.HISTORY) {
            headerIcon.classList.add('d-none');
        } else {
            headerIcon.classList.remove('d-none');
            if (window.Icon && typeof Icon.update === 'function') {
                Icon.update(headerIcon, hConfig.iconClass);
            } else {
                headerIcon.className = hConfig.iconClass;
            }
        }
    }
}

var _isSwitchingTrackerSubTab = false;
function switchTrackerSubTab(subTab) {
    if (_isSwitchingTrackerSubTab) return;
    _isSwitchingTrackerSubTab = true;
    try {
        trackerSubTab = subTab || SUB_TABS.CURRENT;
        if (typeof window !== 'undefined') {
            window.trackerSubTab = trackerSubTab;
        }
        if (NavigationState && typeof NavigationState.trackerSubTab === 'function') {
            NavigationState.trackerSubTab(trackerSubTab);
        }
        if (typeof window !== 'undefined' && window.location) {
            var trackerHash = '#/tracker/' + trackerSubTab;
            if (window.location.hash !== trackerHash) {
                try { window.location.hash = trackerHash; } catch (_) {}
            }
        }

        // Determine subtitle text for tracker header
        var subText = '';
        if (trackerSubTab === SUB_TABS.OLD) {
            subText = 'Select a period to begin';
        } else if (trackerSubTab === SUB_TABS.PERFORMANCE) {
            var sdate = typeof rdSD === 'function' ? rdSD() : (typeof td === 'function' ? td() : '');
            var totalDays = (typeof window.datesInRange === 'function' && typeof td === 'function') ? window.datesInRange(sdate, td()).length : 1;
            subText = (typeof fr === 'function' && typeof td === 'function') ? (fr(sdate) + ' → ' + fr(td()) + ' (' + totalDays + (totalDays === 1 ? ' day' : ' days') + ')') : '';
        } else if (trackerSubTab === SUB_TABS.HISTORY) {
            var histEntries = typeof getPrayerHistory === 'function' ? getPrayerHistory() : [];
            subText = 'Activity Log · ' + histEntries.length + (histEntries.length === 1 ? ' entry' : ' entries');
        }

        // Update Knockout Tracker ViewModel reactively
        var vm = (typeof getTrackerViewModel === 'function') ? getTrackerViewModel() : (typeof window !== 'undefined' && window.getTrackerViewModel ? window.getTrackerViewModel() : null);
        if (vm) {
            if (typeof vm.currentSubTab === 'function') {
                vm.currentSubTab(trackerSubTab);
            }
            if (vm.header) {
                var hConfig = TRACKER_HEADER[trackerSubTab] || TRACKER_HEADER.current;
                if (typeof vm.header.iconClass === 'function') vm.header.iconClass(hConfig.iconClass);
                if (typeof vm.header.label === 'function') vm.header.label(hConfig.label);
                if (typeof vm.header.showSubtitle === 'function') vm.header.showSubtitle(trackerSubTab !== SUB_TABS.CURRENT);
                if (typeof vm.header.subtitle === 'function') vm.header.subtitle(subText);
            }
        }

        // Synchronize DOM elements (fallback & legacy test compatibility)
        syncTrackerDom(trackerSubTab, subText);

        // Trigger tab-specific renders
        if (trackerSubTab === SUB_TABS.OLD) {
            if (typeof rOT === 'function') rOT();
        } else if (trackerSubTab === SUB_TABS.PERFORMANCE) {
            if (typeof renderPerformanceTab === 'function') renderPerformanceTab();
        } else if (trackerSubTab === SUB_TABS.HISTORY) {
            if (typeof renderPrayerHistoryTab === 'function') renderPrayerHistoryTab();
        } else {
            if (typeof rn === 'function') rn();
        }
    } finally {
        _isSwitchingTrackerSubTab = false;
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

var _isShowingPage = false;
function showPage(kind) {
    if (_isShowingPage) return;
    _isShowingPage = true;
    try {
        if (NavigationState && typeof NavigationState.activePage === 'function') {
            NavigationState.activePage(kind);
        }
        if (typeof window !== 'undefined') {
            window.currentActivePage = kind;
            if (window.location) {
                var targetHash;
                if (kind === 'current' || kind === 'old' || kind === 'performance' || kind === 'history') {
                    targetHash = '#/tracker/' + kind;
                } else if (kind === 'tracker') {
                    targetHash = '#/tracker/' + (trackerSubTab || 'current');
                } else {
                    targetHash = '#/' + kind;
                }
                if (kind === 'tracker' && window.location.hash && window.location.hash.indexOf('#/tracker') === 0) {
                    // hash is already pointing to tracker route/subtab
                } else if (window.location.hash !== targetHash) {
                    try { window.location.hash = targetHash; } catch (_) {}
                }
            }
        }

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
            if (typeof rDashboard === 'function') {
                rDashboard();
            } else if (window.rDashboard) {
                window.rDashboard();
            } else if (window.DashboardApp && typeof window.DashboardApp.render === 'function') {
                window.DashboardApp.render();
            }
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
            if (typeof rSET === 'function') rSET();
        } else if (kind === 'tasbeeh') {
            if (typeof initTasbeeh === 'function') {
                initTasbeeh();
            } else if (window.initTasbeeh) {
                window.initTasbeeh();
            }
            if (window.TasbeehApp && typeof window.TasbeehApp.render === 'function') {
                window.TasbeehApp.render();
            }
        } else if (kind === 'duas') {
            if (typeof initDuas === 'function') {
                initDuas();
            } else if (window.initDuas) {
                window.initDuas();
            }
            if (window.DuasApp && typeof window.DuasApp.render === 'function') {
                window.DuasApp.render();
            }
        }
    } finally {
        _isShowingPage = false;
    }
}

if (typeof window !== 'undefined') {
    window.switchTrackerSubTab = switchTrackerSubTab;
    window.showPage = showPage;
    window.setNav = setNav;
    window.SUB_TABS = SUB_TABS;
    window.TRACKER_HEADER = TRACKER_HEADER;
    window.NavigationState = NavigationState;
    window.navigationService = NavigationState;
}
