/* ============================================================
   Nur Prayer — Digital Tasbeeh: Component Registration
   Path: features/tasbeeh/tasbeeh-registration.js
   Responsibilities:
     - Centralizes ALL Knockout component registrations for the Tasbeeh feature
     - Registers feature-level components (header, card, progress, nav-tab, page)
     - Registers modular section components for Current, Old, and History tabs
     - Keeps component implementations separated in their own respective files
   ============================================================ */

import {
    TasbeehPageTemplate,
    TasbeehHeaderTemplate,
    TasbeehCounterCardTemplate,
    TasbeehCounterCardViewModel,
    TasbeehProgressCircleTemplate,
    TasbeehNavTabTemplate,
    getTasbeehViewModel
} from './tasbeeh-view-model.js';

import {
    CurrentCardViewModel, CurrentCardTemplate,
    CurrentFeedViewModel, CurrentFeedTemplate,
    CurrentFormViewModel, CurrentFormTemplate,
    CurrentPageViewModel, CurrentPageTemplate
} from './tasbeeh-current/tasbeeh-current.js';

import {
    OldCardViewModel, OldCardTemplate,
    OldFeedViewModel, OldFeedTemplate,
    OldFormViewModel, OldFormTemplate,
    OldPageViewModel, OldPageTemplate
} from './tasbeeh-old/tasbeeh-old.js';

import {
    HistoryCardViewModel, HistoryCardTemplate,
    HistoryFeedViewModel, HistoryFeedTemplate,
    HistoryFormViewModel, HistoryFormTemplate,
    HistoryPageViewModel, HistoryPageTemplate
} from './tasbeeh-history/tasbeeh-history.js';

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
 * Register all Digital Tasbeeh Knockout components
 * @param {Object} [customKo] - Optional Knockout instance (for testing or isolation)
 */
export function registerTasbeehComponents(customKo) {
    // 1. Digital Tasbeeh Feature Components
    registerComponent('tasbeeh-header', function (p) { return p || {}; }, TasbeehHeaderTemplate, customKo);
    registerComponent('tasbeeh-counter-card', TasbeehCounterCardViewModel, TasbeehCounterCardTemplate, customKo);
    registerComponent('tasbeeh-progress-circle', function (p) { return p || {}; }, TasbeehProgressCircleTemplate, customKo);
    registerComponent('tasbeeh-nav-tab', function (p) { return p || {}; }, TasbeehNavTabTemplate, customKo);
    registerComponent('tasbeeh-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.subTabs) return p;
        if (p && p.tasbeeh) return p.tasbeeh;
        return getTasbeehViewModel();
    }, TasbeehPageTemplate, customKo);

    // 2. Current Tab Modular Components
    registerComponent('tasbeeh-current-card', CurrentCardViewModel, CurrentCardTemplate, customKo);
    registerComponent('tasbeeh-current-feed', CurrentFeedViewModel, CurrentFeedTemplate, customKo);
    registerComponent('tasbeeh-current-form', CurrentFormViewModel, CurrentFormTemplate, customKo);
    registerComponent('tasbeeh-current-page', CurrentPageViewModel, CurrentPageTemplate, customKo);

    // 3. Old Tab Modular Components
    registerComponent('tasbeeh-old-card', OldCardViewModel, OldCardTemplate, customKo);
    registerComponent('tasbeeh-old-feed', OldFeedViewModel, OldFeedTemplate, customKo);
    registerComponent('tasbeeh-old-form', OldFormViewModel, OldFormTemplate, customKo);
    registerComponent('tasbeeh-old-page', OldPageViewModel, OldPageTemplate, customKo);

    // 4. History Tab Modular Components
    registerComponent('tasbeeh-history-card', HistoryCardViewModel, HistoryCardTemplate, customKo);
    registerComponent('tasbeeh-history-feed', HistoryFeedViewModel, HistoryFeedTemplate, customKo);
    registerComponent('tasbeeh-history-form', HistoryFormViewModel, HistoryFormTemplate, customKo);
    registerComponent('tasbeeh-history-page', HistoryPageViewModel, HistoryPageTemplate, customKo);
}

if (typeof window !== 'undefined') {
    window.registerTasbeehComponents = registerTasbeehComponents;
}

export default registerTasbeehComponents;

