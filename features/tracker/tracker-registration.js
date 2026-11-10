/* ============================================================
   Nur Prayer — Tracker Component Registration
   Path: features/tracker/tracker-registration.js
   Responsibilities:
     - Centralizes ALL Knockout component registrations for Tracker feature
     - Registers feature-level components (tracker-page, tracker-header, tracker-nav-tab)
     - Registers modular components for Current, Old, Performance, and History
     - Provides backward-compatibility alias registrations for legacy templates
   ============================================================ */
'use strict';

/* ---------- Template Definitions ---------- */
export var TrackerPageTemplate = { element: 'tracker-page-template', file: 'features/tracker/tracker.html' };
export var TrackerHeaderTemplate = { element: 'prayer-header-template', file: 'features/tracker/templates/prayer-header.html' };
export var TrackerNavTabTemplate = { element: 'tracker-nav-tab-template', file: 'features/tracker/templates/tracker-nav-tab.html' };
export var PrayerNavTabTemplate = { element: 'prayer-nav-tab-template', file: 'features/tracker/templates/prayer-nav-tab.html' };
export var PrayerTrackerCardTemplate = { element: 'prayer-tracker-card-template', file: 'features/tracker/templates/prayer-tracker-card.html' };
export var PrayerRowTemplate = { element: 'prayer-row-template', file: 'features/tracker/templates/prayer-row.html' };
export var PrayerStatCardTemplate = { element: 'prayer-stat-card-template', file: 'features/tracker/templates/prayer-stat-card.html' };
export var PrayerPerfRingTemplate = { element: 'prayer-perf-ring-template', file: 'features/tracker/templates/prayer-perf-ring.html' };
export var PrayerHistoryCardTemplate = { element: 'prayer-history-card-template', file: 'features/tracker/templates/prayer-history-card.html' };

import {
    PrayerRowViewModel,
    PrayerTrackerCardViewModel,
    getTrackerViewModel
} from './tracker.js';

import {
    TrackerCurrentCardTemplate, TrackerCurrentCardViewModel,
    TrackerCurrentFeedTemplate, TrackerCurrentFeedViewModel,
    TrackerCurrentFormTemplate, TrackerCurrentFormViewModel,
    TrackerCurrentPageTemplate, TrackerCurrentPageViewModel
} from './tracker-current/tracker-current.js';

import {
    TrackerOldCardTemplate, TrackerOldCardViewModel,
    TrackerOldFeedTemplate, TrackerOldFeedViewModel,
    TrackerOldFormTemplate, TrackerOldFormViewModel,
    TrackerOldPageTemplate, TrackerOldPageViewModel
} from './tracker-old/tracker-old.js';

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

import { registerComponent } from '../../components/component-helper.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

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

    // 3. Old Tab Modular Components
    registerComponent('tracker-old-card', TrackerOldCardViewModel, TrackerOldCardTemplate, customKo);
    registerComponent('tracker-old-feed', TrackerOldFeedViewModel, TrackerOldFeedTemplate, customKo);
    registerComponent('tracker-old-form', TrackerOldFormViewModel, TrackerOldFormTemplate, customKo);
    registerComponent('tracker-old-page', TrackerOldPageViewModel, TrackerOldPageTemplate, customKo);

    // 4. Performance Tab Modular Components
    registerComponent('tracker-performance-card', TrackerPerformanceCardViewModel, TrackerPerformanceCardTemplate, customKo);
    registerComponent('tracker-performance-feed', TrackerPerformanceFeedViewModel, TrackerPerformanceFeedTemplate, customKo);
    registerComponent('tracker-performance-page', TrackerPerformancePageViewModel, TrackerPerformancePageTemplate, customKo);

    // 5. History Tab Modular Components
    registerComponent('tracker-history-card', TrackerHistoryCardViewModel, TrackerHistoryCardTemplate, customKo);
    registerComponent('tracker-history-feed', TrackerHistoryFeedViewModel, TrackerHistoryFeedTemplate, customKo);
    registerComponent('tracker-history-page', TrackerHistoryPageViewModel, TrackerHistoryPageTemplate, customKo);

    // 6. Backward Compatibility Aliases for Legacy Template Bindings
    registerComponent('prayer-header', function (p) { return p || {}; }, TrackerHeaderTemplate, customKo);
    registerComponent('prayer-tracker-card', PrayerTrackerCardViewModel, PrayerTrackerCardTemplate, customKo);
    registerComponent('prayer-row', PrayerRowViewModel, TrackerCurrentCardTemplate, customKo);
    registerComponent('prayer-stat-card', function (p) { return p || {}; }, PrayerStatCardTemplate, customKo);
    registerComponent('prayer-perf-ring', function (p) { return p || {}; }, PrayerPerfRingTemplate, customKo);
    registerComponent('prayer-nav-tab', function (p) { return p || {}; }, PrayerNavTabTemplate, customKo);
    registerComponent('prayer-history-card', TrackerHistoryCardViewModel, TrackerHistoryCardTemplate, customKo);
}

if (typeof window !== 'undefined') {
    window.registerTrackerComponents = registerTrackerComponents;
}

export default registerTrackerComponents;
