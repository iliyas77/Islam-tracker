/* ============================================================
   Nur Prayer — Dashboard Component Registration & Coordinator
   Path: features/dashboard/dashboard-registration.js
   Responsibilities:
     - Centralizes ALL Knockout component registrations for Dashboard
     - Manages root DashboardViewModel orchestrating sub-viewmodels
     - Registers standardized components: dashboard-clock, dashboard-timeline, dashboard-features-grid
     - Registers dashboard-mobile-view composition
     - Provides DashboardApp interface and lifecycle (init, render)
   ============================================================ */
'use strict';

import {
    DashboardService,
    DASH_STATUSES,
    DASH_STATUS_BADGES,
    getLocationInfo,
    getMissedPrayerCount,
    getTimelinePrayerStatuses,
    getActivePrayerInfo,
    startDashClock,
    setDashCurrentActivePrayer
} from './dashboard-service.js';

import {
    DashboardClockTemplate,
    DashboardClockViewModel
} from './components/dashboard-clock/dashboard-clock.js';

import {
    DashboardTimelineTemplate,
    DashboardTimelineViewModel
} from './components/dashboard-timeline/dashboard-timeline.js';

import {
    DashboardFeaturesGridTemplate,
    DashboardFeaturesGridViewModel
} from './components/dashboard-features-grid/dashboard-features-grid.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Dashboard Component Templates ---------- */
export const DashboardMobileViewTemplate = {
    element: 'dashboard-page-template',
    file: 'features/dashboard/dashboard-mobile-view.html'
};

export const DashboardPageTemplate = DashboardMobileViewTemplate;

// Re-export subcomponent templates
export {
    DashboardClockTemplate,
    DashboardTimelineTemplate,
    DashboardFeaturesGridTemplate
};

/* ---------- Dashboard Root ViewModel ---------- */
var dashboardViewModelInstance = null;

export function getDashboardViewModel() {
    if (!dashboardViewModelInstance && typeof DashboardViewModel === 'function') {
        dashboardViewModelInstance = new DashboardViewModel();
    }
    return dashboardViewModelInstance;
}

export function DashboardViewModel() {
    var self = this;

    function obs(val) {
        return (_ko && typeof _ko.observable === 'function')
            ? _ko.observable(val)
            : function (v) { if (arguments.length) val = v; return val; };
    }

    // 1. Header (Location & Mosque Silhouette)
    var locInfo = getLocationInfo();
    self.header = {
        locationText: obs(locInfo.locationText)
    };

    // 2. Clock Component
    self.clock = new DashboardClockViewModel();

    // 3. Daily Prayer Timeline Component
    self.timeline = new DashboardTimelineViewModel();

    // 4. Features Grid Component
    self.featuresGrid = new DashboardFeaturesGridViewModel();

    // Direct navCards reference for backward compatibility
    self.navCards = self.featuresGrid.navCards;

    // Delegated update methods
    self.updateClock = function () {
        if (self.clock && typeof self.clock.updateClock === 'function') {
            self.clock.updateClock();
        }
    };

    self.updateTimeline = function () {
        if (self.timeline && typeof self.timeline.updateTimeline === 'function') {
            self.timeline.updateTimeline();
        }
    };

    self.updateTrackerBadge = function () {
        if (self.featuresGrid && typeof self.featuresGrid.updateTrackerBadge === 'function') {
            self.featuresGrid.updateTrackerBadge();
        }
    };
}

/* ---------- Dashboard Render ---------- */
export function rDashboard() {
    var activeP = typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : {
        name: 'Fajr',
        time: (_win.T && _win.T.Fajr) || '--:--',
        isYesterday: false
    };
    setDashCurrentActivePrayer(activeP.name);

    var locInfo = getLocationInfo();
    var locText = locInfo.locationText;

    if (!dashboardViewModelInstance && typeof initDashboard === 'function') {
        initDashboard();
    }

    if (dashboardViewModelInstance) {
        if (dashboardViewModelInstance.header && typeof dashboardViewModelInstance.header.locationText === 'function') {
            dashboardViewModelInstance.header.locationText(locText);
        }
        if (typeof dashboardViewModelInstance.updateTimeline === 'function') {
            dashboardViewModelInstance.updateTimeline();
        }
        if (typeof dashboardViewModelInstance.updateTrackerBadge === 'function') {
            dashboardViewModelInstance.updateTrackerBadge();
        }
    }

    var locEl = typeof _win.$ === 'function' ? _win.$('dashLocationText') : null;
    if (locEl) {
        locEl.innerHTML = locText;
    }

    // Direct DOM fallbacks for legacy templates/tests
    var statuses = getTimelinePrayerStatuses();
    var prayers = _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    prayers.forEach(function (p) {
        var st = statuses[p] || DASH_STATUSES.UPCOMING;
        var isActive = st === DASH_STATUSES.ACTIVE;

        var timeEl = typeof _win.$ === 'function' ? _win.$('dashTime' + p) : null;
        if (timeEl) {
            timeEl.textContent = (_win.T && _win.T[p]) || '--:--';
        }

        var badgeEl = typeof _win.$ === 'function' ? _win.$('dashBadge' + p) : null;
        if (badgeEl) {
            var badgeInfo = DASH_STATUS_BADGES[st] || DASH_STATUS_BADGES[DASH_STATUSES.UPCOMING];
            badgeEl.className = 'dash-timeline-badge ' + badgeInfo.className;
            badgeEl.textContent = badgeInfo.text;
        }

        var iconBox = typeof _win.$ === 'function' ? _win.$('dashIconBox' + p) : null;
        if (iconBox) {
            if (isActive) {
                iconBox.classList.add('icon-box-active');
            } else {
                iconBox.classList.remove('icon-box-active');
            }
        }
    });

    var totalMissed = getMissedPrayerCount();
    var trackerBadgeEl = typeof _win.$ === 'function' ? _win.$('trackerMissedBadge') : null;
    if (trackerBadgeEl) {
        if (totalMissed > 0) {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed';
            trackerBadgeEl.textContent = totalMissed + ' missed';
        } else {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed d-none';
            trackerBadgeEl.textContent = '';
        }
    }

    startDashClock();
}

/* ---------- Dashboard Initialization ---------- */
export function initDashboard() {
    registerDashboardComponents();
    var el = (_win.document && typeof _win.document.getElementById === 'function')
        ? _win.document.getElementById('dashboardPage')
        : null;
    if (_win.document && !_win.document.getElementById('app') && el && typeof ko !== 'undefined') {
        var vm = getDashboardViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
}

export var dashboardViewModel = dashboardViewModelInstance;

export const DashboardApp = {
    init: initDashboard,
    render: rDashboard,
    registerComponents: registerDashboardComponents,
    getViewModel: getDashboardViewModel
};

function registerComponent(name, viewModel, template, customKo) {
    if (!customKo && typeof _win.registerFeatureComponent === 'function') {
        _win.registerFeatureComponent(name, viewModel, template);
        return;
    }
    var ko = customKo || (typeof _win.ko !== 'undefined' ? _win.ko : (typeof ko !== 'undefined' ? ko : null));
    if (!ko || !ko.components) return;
    if (!ko.components.isRegistered(name)) {
        ko.components.register(name, {
            viewModel: viewModel,
            template: template
        });
    }
}

/**
 * Registers all Dashboard Knockout components
 * @param {Object} [customKo] - Optional Knockout instance
 */
export function registerDashboardComponents(customKo) {
    // 1. Digital Clock Component & Aliases
    registerComponent('dashboard-clock', function (params) {
        return (params && params instanceof DashboardClockViewModel) ? params : new DashboardClockViewModel(params);
    }, DashboardClockTemplate, customKo);

    registerComponent('clock-component', function (params) {
        return (params && params instanceof DashboardClockViewModel) ? params : new DashboardClockViewModel(params);
    }, DashboardClockTemplate, customKo);

    // 2. Prayer Timeline Component & Aliases
    registerComponent('dashboard-timeline', function (params) {
        return (params && params instanceof DashboardTimelineViewModel) ? params : new DashboardTimelineViewModel(params);
    }, DashboardTimelineTemplate, customKo);

    registerComponent('timeline-component', function (params) {
        return (params && params instanceof DashboardTimelineViewModel) ? params : new DashboardTimelineViewModel(params);
    }, DashboardTimelineTemplate, customKo);

    // 3. Features Grid Component & Aliases
    registerComponent('dashboard-features-grid', function (params) {
        return (params && params instanceof DashboardFeaturesGridViewModel) ? params : new DashboardFeaturesGridViewModel(params);
    }, DashboardFeaturesGridTemplate, customKo);

    registerComponent('features-grid-component', function (params) {
        return (params && params instanceof DashboardFeaturesGridViewModel) ? params : new DashboardFeaturesGridViewModel(params);
    }, DashboardFeaturesGridTemplate, customKo);

    registerComponent('features-grid', function (params) {
        return (params && params instanceof DashboardFeaturesGridViewModel) ? params : new DashboardFeaturesGridViewModel(params);
    }, DashboardFeaturesGridTemplate, customKo);

    // 4. Dashboard Mobile View / Page
    var pageVmResolver = function (params) {
        if (params && params.viewModel) return params.viewModel;
        if (params && params.timeline) return params;
        if (params && params.dashboard) return params.dashboard;
        return getDashboardViewModel();
    };

    registerComponent('dashboard-mobile-view', pageVmResolver, DashboardMobileViewTemplate, customKo);
    registerComponent('dashboard-page', pageVmResolver, DashboardMobileViewTemplate, customKo);
}

// Global backward compatibility
if (typeof window !== 'undefined') {
    window.DashboardApp = DashboardApp;
    window.rDashboard = rDashboard;
    window.initDashboard = initDashboard;
    window.DashboardViewModel = DashboardViewModel;
    window.getDashboardViewModel = getDashboardViewModel;
    window.registerDashboardComponents = registerDashboardComponents;
    window.DashboardMobileViewTemplate = DashboardMobileViewTemplate;
    window.DashboardPageTemplate = DashboardPageTemplate;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard: initDashboard,
        rDashboard: rDashboard,
        registerDashboardComponents: registerDashboardComponents,
        DashboardViewModel: DashboardViewModel,
        getDashboardViewModel: getDashboardViewModel
    };
    module.exports.default = DashboardApp;
}

export default DashboardApp;
