/* ============================================================
   Nur Prayer — Dua Component Registration
   Path: features/dua/dua-registration.js
   Responsibilities:
     - Centralizes ALL Knockout component registrations for Dua feature
     - Registers feature-level components (duas-page, dua-header, dua-nav-tab, dua-translation-toggle)
     - Registers modular components for All, Pinned, and Favourites
     - Provides backward-compatibility alias registrations for duva-* components
   ============================================================ */
'use strict';

/* ---------- Template Definitions ---------- */
export var DuasPageTemplate = { element: 'duas-page-template', file: 'features/dua/dua.html' };
export var DuaHeaderTemplate = { element: 'dua-header-template', file: 'features/dua/templates/dua-header.html' };
export var DuaNavTabTemplate = { element: 'dua-nav-tab-template', file: 'features/dua/templates/dua-nav-tab.html' };
export var DuaTranslationToggleTemplate = { element: 'dua-translation-toggle-template', file: 'features/dua/templates/dua-translation-toggle.html' };
export var DuvaSearchBarTemplate = { element: 'duva-search-bar-template', file: 'features/dua/dua-all/dua-all-form/dua-all-form.html' };

import {
    getDuasViewModel,
    DuasPageViewModel,
    DuaPageViewModel,
    initDuas,
    DuasApp,
    DuaApp
} from './dua.js';

import {
    DuaAllCardTemplate, DuaAllCardViewModel,
    DuaAllFeedTemplate, DuaAllFeedViewModel,
    DuaAllFormTemplate, DuaAllFormViewModel,
    DuaAllPageTemplate, DuaAllPageViewModel
} from './dua-all/dua-all.js';

import {
    DuaPinnedCardTemplate, DuaPinnedCardViewModel,
    DuaPinnedFeedTemplate, DuaPinnedFeedViewModel,
    DuaPinnedPageTemplate, DuaPinnedPageViewModel
} from './dua-pinned/dua-pinned.js';

import {
    DuaFavouritesCardTemplate, DuaFavouritesCardViewModel,
    DuaFavouritesFeedTemplate, DuaFavouritesFeedViewModel,
    DuaFavouritesPageTemplate, DuaFavouritesPageViewModel
} from './dua-favourites/dua-favourites.js';

import { registerComponent } from '../../components/component-helper.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

// Re-export for backward compatibility
export {
    getDuasViewModel,
    DuasPageViewModel,
    DuaPageViewModel,
    initDuas,
    DuasApp,
    DuaApp
};

/**
 * Register all Dua Knockout components
 * @param {Object} [customKo] - Optional Knockout instance (for testing or isolation)
 */
export function registerDuaComponents(customKo) {
    // 1. Feature Level Components
    registerComponent('dua-header', function (p) { return p || {}; }, DuaHeaderTemplate, customKo);
    registerComponent('dua-nav-tab', function (p) { return p || {}; }, DuaNavTabTemplate, customKo);
    registerComponent('dua-translation-toggle', function (p) { return (p && p.detail) ? p.detail : p; }, DuaTranslationToggleTemplate, customKo);
    registerComponent('dua-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.currentDua) return p;
        if (p && p.duas) return p.duas;
        return getDuasViewModel();
    }, DuasPageTemplate, customKo);
    registerComponent('duas-page', function (p) {
        if (p && p.viewModel) return p.viewModel;
        if (p && p.currentDua) return p;
        if (p && p.duas) return p.duas;
        return getDuasViewModel();
    }, DuasPageTemplate, customKo);

    // 2. All Duas Tab Modular Components
    registerComponent('dua-all-card', DuaAllCardViewModel, DuaAllCardTemplate, customKo);
    registerComponent('dua-all-feed', DuaAllFeedViewModel, DuaAllFeedTemplate, customKo);
    registerComponent('dua-all-form', DuaAllFormViewModel, DuaAllFormTemplate, customKo);
    registerComponent('dua-all-page', DuaAllPageViewModel, DuaAllPageTemplate, customKo);

    // 3. Pinned Tab Modular Components
    registerComponent('dua-pinned-card', DuaPinnedCardViewModel, DuaPinnedCardTemplate, customKo);
    registerComponent('dua-pinned-feed', DuaPinnedFeedViewModel, DuaPinnedFeedTemplate, customKo);
    registerComponent('dua-pinned-page', DuaPinnedPageViewModel, DuaPinnedPageTemplate, customKo);

    // 4. Favourites Tab Modular Components
    registerComponent('dua-favourites-card', DuaFavouritesCardViewModel, DuaFavouritesCardTemplate, customKo);
    registerComponent('dua-favourites-feed', DuaFavouritesFeedViewModel, DuaFavouritesFeedTemplate, customKo);
    registerComponent('dua-favourites-page', DuaFavouritesPageViewModel, DuaFavouritesPageTemplate, customKo);

    // 5. Backward Compatibility Aliases for duva-* components
    registerComponent('duva-header', function (p) { return p || {}; }, DuaHeaderTemplate, customKo);
    registerComponent('duva-search-bar', function (p) { return (p && p.search) ? p.search : p; }, DuvaSearchBarTemplate, customKo);
    registerComponent('duva-nav-tab', function (p) { return p || {}; }, DuaNavTabTemplate, customKo);
    registerComponent('duva-pinned-card', DuaPinnedCardViewModel, DuaPinnedCardTemplate, customKo);
    registerComponent('duva-card', DuaAllCardViewModel, DuaAllCardTemplate, customKo);
    registerComponent('duva-translation-toggle', function (p) { return (p && p.detail) ? p.detail : p; }, DuaTranslationToggleTemplate, customKo);
}

if (typeof window !== 'undefined') {
    window.registerDuaComponents = registerDuaComponents;
}

export default registerDuaComponents;

