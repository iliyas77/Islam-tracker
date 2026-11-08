/* ============================================================
   Nur Prayer — Dashboard Component Registration
   Path: features/dashboard/dashboard-registration.js
   Responsibilities:
     - Centralizes Knockout component registrations for Dashboard
     - Registers canonical components: dashboard-clock, dashboard-timeline, dashboard-features-grid, dashboard-page
     - Provides backward-compatible re-exports for seamless integration
   ============================================================ */
'use strict';

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

/* ---------- Dashboard Page Template ---------- */
export const DashboardPageTemplate = {
    element: 'dashboard-page-template',
    file: 'features/dashboard/dashboard-mobile-view.html'
};

import {
    DashboardViewModel,
    getDashboardViewModel,
    initDashboard,
    rDashboard,
    DashboardApp
} from './dashboard.js';

import { registerComponent } from '../../components/component-helper.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

// Re-export for backward compatibility
export {
    DashboardViewModel,
    getDashboardViewModel,
    initDashboard,
    rDashboard,
    DashboardApp
};

/**
 * Registers all Dashboard Knockout components
 * @param {Object} [customKo] - Optional Knockout instance (for testing or isolation)
 */
export function registerDashboardComponents(customKo) {
    // 1. Digital Clock Component
    registerComponent('dashboard-clock', function (params) {
        return (params && params instanceof DashboardClockViewModel) ? params : new DashboardClockViewModel(params);
    }, DashboardClockTemplate, customKo);

    // 2. Prayer Timeline Component
    registerComponent('dashboard-timeline', function (params) {
        return (params && params instanceof DashboardTimelineViewModel) ? params : new DashboardTimelineViewModel(params);
    }, DashboardTimelineTemplate, customKo);

    // 3. Features Grid Component
    registerComponent('dashboard-features-grid', function (params) {
        return (params && params instanceof DashboardFeaturesGridViewModel) ? params : new DashboardFeaturesGridViewModel(params);
    }, DashboardFeaturesGridTemplate, customKo);

    // 4. Dashboard Page
    var pageVmResolver = function (params) {
        if (params && params.viewModel) return params.viewModel;
        if (params && params.timeline) return params;
        if (params && params.dashboard) return params.dashboard;
        return getDashboardViewModel();
    };

    registerComponent('dashboard-page', pageVmResolver, DashboardPageTemplate, customKo);
}

// Global window registration (only exposes component registration for startup registry)
if (typeof window !== 'undefined') {
    window.registerDashboardComponents = registerDashboardComponents;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard: initDashboard,
        rDashboard: rDashboard,
        registerDashboardComponents: registerDashboardComponents,
        DashboardViewModel: DashboardViewModel,
        getDashboardViewModel: getDashboardViewModel,
        DashboardApp: DashboardApp,
        DashboardPageTemplate: DashboardPageTemplate
    };
    module.exports.default = registerDashboardComponents;
}

export default registerDashboardComponents;
