/* ============================================================
   Nur Prayer — Quran Component Registration
   Path: quran/quran-registration.js
   Responsibilities:
     - Centralizes ALL Knockout component registrations for the Quran feature
     - Registers feature-level components (quran-page, quran-nav-tab)
     - Registers modular section components for Main, Open, and Bookmark views
     - Adheres to established registration standards across the application
   ============================================================ */
'use strict';

import {
    QuranPageTemplate,
    QuranNavTabTemplate,
    getQuranViewModel
} from './quran.js';

import {
    QuranMainCardTemplate, QuranMainCardViewModel,
    QuranMainFeedTemplate, QuranMainFeedViewModel,
    QuranMainPageTemplate, QuranMainPageViewModel
} from './quran-main/quran-main.js';

import {
    QuranOpenCardTemplate, QuranOpenCardViewModel,
    QuranOpenFeedTemplate, QuranOpenFeedViewModel,
    QuranOpenPageTemplate, QuranOpenPageViewModel
} from './quran-open/quran-open.js';

import {
    QuranBookmarkCardTemplate, QuranBookmarkCardViewModel,
    QuranBookmarkFeedTemplate, QuranBookmarkFeedViewModel,
    QuranBookmarkPageTemplate, QuranBookmarkPageViewModel
} from './quran-bookmark/quran-bookmark.js';

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
 * Register all Quran Knockout components
 * @param {Object} [customKo] - Optional Knockout instance (for testing or isolation)
 */
export function registerQuranComponents(customKo) {
    // 1. Feature Level Components
    registerComponent('quran-nav-tab', function (params) {
        var p = params || {};
        return {
            activeTab: p.activeTab,
            selectTab: function (tabId) {
                if (typeof p.onTabChange === 'function') {
                    p.onTabChange(tabId);
                } else if (p.activeTab && typeof p.activeTab === 'function') {
                    p.activeTab(tabId);
                }
            }
        };
    }, QuranNavTabTemplate, customKo);

    registerComponent('quran-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.currentSubTab) return p;
        if (p && p.quran) return p.quran;
        return getQuranViewModel();
    }, QuranPageTemplate, customKo);

    // 2. Main Tab Modular Components (Surah List)
    registerComponent('quran-main-card', QuranMainCardViewModel, QuranMainCardTemplate, customKo);
    registerComponent('quran-main-feed', QuranMainFeedViewModel, QuranMainFeedTemplate, customKo);
    registerComponent('quran-main-page', QuranMainPageViewModel, QuranMainPageTemplate, customKo);

    // 3. Open Tab Modular Components (Surah Reader)
    registerComponent('quran-open-card', QuranOpenCardViewModel, QuranOpenCardTemplate, customKo);
    registerComponent('quran-open-feed', QuranOpenFeedViewModel, QuranOpenFeedTemplate, customKo);
    registerComponent('quran-open-page', QuranOpenPageViewModel, QuranOpenPageTemplate, customKo);

    // 4. Bookmark Tab Modular Components
    registerComponent('quran-bookmark-card', QuranBookmarkCardViewModel, QuranBookmarkCardTemplate, customKo);
    registerComponent('quran-bookmark-feed', QuranBookmarkFeedViewModel, QuranBookmarkFeedTemplate, customKo);
    registerComponent('quran-bookmark-page', QuranBookmarkPageViewModel, QuranBookmarkPageTemplate, customKo);
}

if (typeof window !== 'undefined') {
    window.registerQuranComponents = registerQuranComponents;
}

export default registerQuranComponents;

