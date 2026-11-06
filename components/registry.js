// components/registry.js
import { registerCustomBindings } from './bindings.js';
import { IconViewModel, IconTemplate } from './icon/icon.js';
import { BottomSheetViewModel, BottomSheetTemplate } from './bottom-sheet/bottom-sheet.js';
import {
    DashboardHeaderTemplate,
    DashboardClockTemplate,
    DashboardTimelineItemTemplate,
    DashboardTimelineTemplate,
    DashboardNavCardTemplate,
    DashboardDividerTemplate,
    DashboardPageTemplate,
    getDashboardViewModel
} from '../dashboard/dashboard.js';
import {
    SettingsCardHeaderTemplate,
    SettingsFontSizeBtnTemplate,
    SettingsInfoCardTemplate,
    SettingsPageTemplate,
    getSettingsViewModel
} from '../settings/settings.js';
import {
    TrackerPageTemplate,
    PrayerHeaderTemplate,
    PrayerTrackerCardTemplate,
    PrayerTrackerCardViewModel,
    PrayerRowTemplate,
    PrayerRowViewModel,
    PrayerStatCardTemplate,
    PrayerPerfRingTemplate,
    PrayerNavTabTemplate,
    PrayerHistoryCardTemplate,
    getTrackerViewModel
} from '../prayer-tracking/prayer-tracking.js';
import {
    TasbeehPageTemplate,
    TasbeehHeaderTemplate,
    TasbeehCounterCardTemplate,
    TasbeehCounterCardViewModel,
    TasbeehProgressCircleTemplate,
    TasbeehGoalSetterTemplate,
    TasbeehNavTabTemplate,
    getTasbeehViewModel
} from '../tasbeeh/tasbeeh.js';
import {
    DuasPageTemplate,
    DuvaHeaderTemplate,
    DuvaSearchBarTemplate,
    DuvaNavTabTemplate,
    DuvaPinnedCardTemplate,
    DuvaCardTemplate,
    DuvaTranslationToggleTemplate,
    getDuasViewModel
} from '../duva/duva.js';

// Central map for tracking registered components
export const componentRegistry = new Map();

/**
 * Registers a component with Knockout and tracks it in the registry map
 * @param {string} name - Custom HTML tag name (e.g., 'app-icon')
 * @param {Function} viewModel - Component ViewModel constructor
 * @param {string} template - HTML template string or element binding
 */
export function registerFeatureComponent(name, viewModel, template) {
    var k = typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null);
    if (!k || !k.components) {
        console.warn(`Knockout is not available. Skipping registration for [${name}].`);
        return;
    }

    componentRegistry.set(name, { viewModel, template });

    if (k.components.isRegistered(name)) {
        return;
    }

    k.components.register(name, {
        viewModel: viewModel,
        template: template
    });
}

// Bulk registration function for app bootstrap
export function registerAllComponents() {
    // 0. Register Custom Binding Handlers
    registerCustomBindings();

    // 1. Core UI Components
    registerFeatureComponent('app-icon', IconViewModel, IconTemplate);
    registerFeatureComponent('app-bottom-sheet', BottomSheetViewModel, BottomSheetTemplate);

    // 2. Dashboard Feature Components
    registerFeatureComponent('dashboard-header', function (p) { return p || {}; }, DashboardHeaderTemplate);
    registerFeatureComponent('dashboard-clock', function (p) { return p || {}; }, DashboardClockTemplate);
    registerFeatureComponent('dashboard-timeline-item', function (p) { return p || {}; }, DashboardTimelineItemTemplate);
    registerFeatureComponent('dashboard-timeline', function (p) { return p || {}; }, DashboardTimelineTemplate);
    registerFeatureComponent('dashboard-nav-card', function (p) { return p || {}; }, DashboardNavCardTemplate);
    registerFeatureComponent('dashboard-divider', function (p) { return p || {}; }, DashboardDividerTemplate);
    registerFeatureComponent('dashboard-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.timeline) return p;
        if (p && p.dashboard) return p.dashboard;
        return getDashboardViewModel();
    }, DashboardPageTemplate);

    // 3. Settings Feature Components
    registerFeatureComponent('settings-card-header', function (p) { return (p && p.header) ? p.header : p; }, SettingsCardHeaderTemplate);
    registerFeatureComponent('settings-font-size-btn', function (p) { return (p && p.button) ? p.button : p; }, SettingsFontSizeBtnTemplate);
    registerFeatureComponent('settings-info-card', function (p) { return (p && p.info) ? p.info : p; }, SettingsInfoCardTemplate);
    registerFeatureComponent('settings-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.fontSizes) return p;
        if (p && p.settings) return p.settings;
        return getSettingsViewModel();
    }, SettingsPageTemplate);

    // 4. Prayer Tracking Feature Components
    registerFeatureComponent('prayer-header', function (p) { return p || {}; }, PrayerHeaderTemplate);
    registerFeatureComponent('prayer-tracker-card', PrayerTrackerCardViewModel, PrayerTrackerCardTemplate);
    registerFeatureComponent('prayer-row', PrayerRowViewModel, PrayerRowTemplate);
    registerFeatureComponent('prayer-stat-card', function (p) { return p || {}; }, PrayerStatCardTemplate);
    registerFeatureComponent('prayer-perf-ring', function (p) { return p || {}; }, PrayerPerfRingTemplate);
    registerFeatureComponent('prayer-nav-tab', function (p) { return p || {}; }, PrayerNavTabTemplate);
    registerFeatureComponent('prayer-history-card', function (p) { return p || {}; }, PrayerHistoryCardTemplate);
    registerFeatureComponent('tracker-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.header && p.subTabs) return p;
        if (p && p.tracker) return p.tracker;
        return getTrackerViewModel();
    }, TrackerPageTemplate);

    // 5. Digital Tasbeeh Feature Components
    registerFeatureComponent('tasbeeh-header', function (p) { return p || {}; }, TasbeehHeaderTemplate);
    registerFeatureComponent('tasbeeh-counter-card', TasbeehCounterCardViewModel, TasbeehCounterCardTemplate);
    registerFeatureComponent('tasbeeh-progress-circle', function (p) { return p || {}; }, TasbeehProgressCircleTemplate);
    registerFeatureComponent('tasbeeh-goal-setter', function (p) { return p || {}; }, TasbeehGoalSetterTemplate);
    registerFeatureComponent('tasbeeh-nav-tab', function (p) { return p || {}; }, TasbeehNavTabTemplate);
    registerFeatureComponent('tasbeeh-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.subTabs) return p;
        if (p && p.tasbeeh) return p.tasbeeh;
        return getTasbeehViewModel();
    }, TasbeehPageTemplate);

    // 6. Quran Duas Feature Components
    registerFeatureComponent('duva-header', function (p) { return p || {}; }, DuvaHeaderTemplate);
    registerFeatureComponent('duva-search-bar', function (p) { return (p && p.search) ? p.search : p; }, DuvaSearchBarTemplate);
    registerFeatureComponent('duva-nav-tab', function (p) { return p || {}; }, DuvaNavTabTemplate);
    registerFeatureComponent('duva-pinned-card', function (p) { return p || {}; }, DuvaPinnedCardTemplate);
    registerFeatureComponent('duva-card', function (p) { return p || {}; }, DuvaCardTemplate);
    registerFeatureComponent('duva-translation-toggle', function (p) { return (p && p.detail) ? p.detail : p; }, DuvaTranslationToggleTemplate);
    registerFeatureComponent('duas-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.currentDua) return p;
        if (p && p.duas) return p.duas;
        return getDuasViewModel();
    }, DuasPageTemplate);

    console.info(`Successfully registered ${componentRegistry.size} global components.`);
}

// Backward compatibility with window global
if (typeof window !== 'undefined') {
    window.componentRegistry = componentRegistry;
    window.registerFeatureComponent = registerFeatureComponent;
    window.registerAllComponents = registerAllComponents;
}

export default {
    componentRegistry,
    registerFeatureComponent,
    registerAllComponents
};
