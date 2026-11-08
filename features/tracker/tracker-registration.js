/* ============================================================
   Nur Prayer — Tracker Component Registration
   Path: features/tracker/tracker-registration.js
   Responsibilities:
     - Centralizes ALL Knockout component registrations for Tracker feature
     - Registers feature-level components (tracker-page, tracker-header, tracker-nav-tab)
     - Registers modular components for Current, Performance, and History
     - Provides backward-compatibility alias registrations for legacy templates
   ============================================================ */
'use strict';

import {
    TrackerPageTemplate,
    TrackerHeaderTemplate,
    TrackerNavTabTemplate,
    getTrackerViewModel
} from './tracker.js';

import {
    TrackerCurrentCardTemplate, TrackerCurrentCardViewModel,
    TrackerCurrentFeedTemplate, TrackerCurrentFeedViewModel,
    TrackerCurrentFormTemplate, TrackerCurrentFormViewModel,
    TrackerCurrentPageTemplate, TrackerCurrentPageViewModel
} from './tracker-current/tracker-current.js';

import {
    TrackerPerformanceCardTemplate, TrackerPerformanceCardViewModel,
    TrackerPerformanceFeedTemplate, TrackerPerformanceFeedViewModel,
    TrackerPerformancePageTemplate, TrackerPerformancePageViewModel
} from './tracker-performance/tracker-performance.js';

import {
    TrackerHistoryCardTemplate, TrackerHistoryCardViewModel,
    TrackerHistoryFeedTemplate, TrackerHistoryFeedViewModel,
    TrackerHistoryPageTemplate, TrackerHistoryPageViewModel
} from './tracker-history/tracker-history.js';

import {
    PrayerTrackerCardTemplate, PrayerTrackerCardViewModel,
    PrayerStatCardTemplate, PrayerPerfRingTemplate
} from '../prayer-tracking/tracker-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

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
 * Register all Tracker Knockout components
 * @param {Object} [customKo] - Optional Knockout instance (for testing or isolation)
 */
export function registerTrackerComponents(customKo) {
    // 1. Feature Level Components
    registerComponent('tracker-header', function (p) { return p || {}; }, TrackerHeaderTemplate, customKo);
    registerComponent('tracker-nav-tab', function (p) { return p || {}; }, TrackerNavTabTemplate, customKo);
    registerComponent('tracker-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.header && p.subTabs) return p;
        if (p && p.tracker) return p.tracker;
        return getTrackerViewModel();
    }, TrackerPageTemplate, customKo);

    // 2. Current Tab Modular Components
    registerComponent('tracker-current-card', TrackerCurrentCardViewModel, TrackerCurrentCardTemplate, customKo);
    registerComponent('tracker-current-feed', TrackerCurrentFeedViewModel, TrackerCurrentFeedTemplate, customKo);
    registerComponent('tracker-current-form', TrackerCurrentFormViewModel, TrackerCurrentFormTemplate, customKo);
    registerComponent('tracker-current-page', TrackerCurrentPageViewModel, TrackerCurrentPageTemplate, customKo);

    // 3. Performance Tab Modular Components
    registerComponent('tracker-performance-card', TrackerPerformanceCardViewModel, TrackerPerformanceCardTemplate, customKo);
    registerComponent('tracker-performance-feed', TrackerPerformanceFeedViewModel, TrackerPerformanceFeedTemplate, customKo);
    registerComponent('tracker-performance-page', TrackerPerformancePageViewModel, TrackerPerformancePageTemplate, customKo);

    // 4. History Tab Modular Components
    registerComponent('tracker-history-card', TrackerHistoryCardViewModel, TrackerHistoryCardTemplate, customKo);
    registerComponent('tracker-history-feed', TrackerHistoryFeedViewModel, TrackerHistoryFeedTemplate, customKo);
    registerComponent('tracker-history-page', TrackerHistoryPageViewModel, TrackerHistoryPageTemplate, customKo);

    // 5. Backward Compatibility Aliases for Legacy Template Bindings
    registerComponent('prayer-header', function (p) { return p || {}; }, TrackerHeaderTemplate, customKo);
    registerComponent('prayer-tracker-card', PrayerTrackerCardViewModel, PrayerTrackerCardTemplate, customKo);
    registerComponent('prayer-row', TrackerCurrentCardViewModel, TrackerCurrentCardTemplate, customKo);
    registerComponent('prayer-stat-card', function (p) { return p || {}; }, PrayerStatCardTemplate, customKo);
    registerComponent('prayer-perf-ring', function (p) { return p || {}; }, PrayerPerfRingTemplate, customKo);
    registerComponent('prayer-nav-tab', function (p) { return p || {}; }, TrackerNavTabTemplate, customKo);
    registerComponent('prayer-history-card', TrackerHistoryCardViewModel, TrackerHistoryCardTemplate, customKo);
}

if (typeof window !== 'undefined') {
    window.registerTrackerComponents = registerTrackerComponents;
}

export default registerTrackerComponents;

