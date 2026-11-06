/* ============================================================
   Nur Prayer — Quran Duas Feature Module
   Path: dua.js
   ============================================================ */

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
if (typeof window === 'undefined') {
    globalThis.window = _win;
}

/* ---------- Quran Duas Component Templates ---------- */
export const DuasPageTemplate = { element: 'duas-page-template', file: 'duva/duva.html' };
export const DuvaHeaderTemplate = { element: 'duva-header-template', file: 'duva/templates/duva-header.html' };
export const DuvaSearchBarTemplate = { element: 'duva-search-bar-template', file: 'duva/templates/duva-search-bar.html' };
export const DuvaNavTabTemplate = { element: 'duva-nav-tab-template', file: 'duva/templates/duva-nav-tab.html' };
export const DuvaPinnedCardTemplate = { element: 'duva-pinned-card-template', file: 'duva/templates/duva-pinned-card.html' };
export const DuvaCardTemplate = { element: 'duva-card-template', file: 'duva/templates/duva-card.html' };
export const DuvaTranslationToggleTemplate = { element: 'duva-translation-toggle-template', file: 'duva/templates/duva-translation-toggle.html' };

/* ---------- Knockout ViewModel & Component Registration ---------- */
var duasViewModel = null;

export function getDuasViewModel() {
    if (!duasViewModel && typeof DuasPageViewModel === 'function') {
        duasViewModel = new DuasPageViewModel();
    }
    return duasViewModel;
}

export function DuasPageViewModel(params) {
    params = params || {};
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);

    self.currentSubTab = (k && k.observable) ? k.observable('home') : function () { return 'home'; };

    self.header = {
        title: (k && k.observable) ? k.observable('Quran Duas') : 'Quran Duas',
        progressText: (k && k.observable) ? k.observable('0 pinned') : '0 pinned',
        iconClass: (k && k.observable) ? k.observable('fa-solid fa-hands-praying text-brand') : 'fa-solid fa-hands-praying text-brand'
    };

    self.pinnedTitle = (k && k.observable) ? k.observable('Your Pinned Duas (0/2)') : 'Your Pinned Duas (0/2)';
    self.pinnedDuas = (k && k.observableArray) ? k.observableArray([]) : [];
    self.filteredDuas = (k && k.observableArray) ? k.observableArray([]) : [];
    self.favouriteDuas = (k && k.observableArray) ? k.observableArray([]) : [];

    self.search = {
        query: (k && k.observable) ? k.observable('') : '',
        placeholder: (k && k.observable) ? k.observable('Search by number, Surah, or keywords...') : 'Search by number, Surah, or keywords...'
    };

    self.detail = {
        number: (k && k.observable) ? k.observable(1) : 1,
        surah: (k && k.observable) ? k.observable('') : '',
        uchcharana: (k && k.observable) ? k.observable('') : '',
        ardham: (k && k.observable) ? k.observable('') : ''
    };
}

export function registerDuasComponents(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (_win.ko || null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('duva-header')) {
        k.components.register('duva-header', {
            viewModel: function (params) { return params || {}; },
            template: DuvaHeaderTemplate
        });
    }

    if (!k.components.isRegistered('duva-search-bar')) {
        k.components.register('duva-search-bar', {
            viewModel: function (params) { return params || {}; },
            template: DuvaSearchBarTemplate
        });
    }

    if (!k.components.isRegistered('duva-nav-tab')) {
        k.components.register('duva-nav-tab', {
            viewModel: function (params) { return params || {}; },
            template: DuvaNavTabTemplate
        });
    }

    if (!k.components.isRegistered('duva-pinned-card')) {
        k.components.register('duva-pinned-card', {
            viewModel: function (params) { return params || {}; },
            template: DuvaPinnedCardTemplate
        });
    }

    if (!k.components.isRegistered('duva-card')) {
        k.components.register('duva-card', {
            viewModel: function (params) { return params || {}; },
            template: DuvaCardTemplate
        });
    }

    if (!k.components.isRegistered('duva-translation-toggle')) {
        k.components.register('duva-translation-toggle', {
            viewModel: function (params) { return params || {}; },
            template: DuvaTranslationToggleTemplate
        });
    }

    if (!k.components.isRegistered('duas-page')) {
        k.components.register('duas-page', {
            viewModel: function (params) {
                return (params && params.viewModel) ? params.viewModel : getDuasViewModel();
            },
            template: DuasPageTemplate
        });
    }
}

export function initDuas() {
    registerDuasComponents();
    var el = document.getElementById('duasPage');
    if (el && typeof ko !== 'undefined') {
        var vm = getDuasViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    if (_win.DuasApp && typeof _win.DuasApp.init === 'function' && _win.DuasApp.init !== initDuas) {
        _win.DuasApp.init();
    } else if (_win.DuasApp && typeof _win.DuasApp.fetchDuas === 'function') {
        _win.DuasApp.fetchDuas();
    }
}

'use strict';

window.DuasApp = (function () {
    // ===== CONSTANTS (Referenced from utilities/dua-constants.js) =====
    var DUA_CONSTANTS = window.DUA_CONSTANTS || window.DUAS_CONSTANTS || (window.CONSTANTS && (window.CONSTANTS.DUA || window.CONSTANTS.DUAS)) || {};
    var defaultDuas = [];
    var STORAGE_KEY_DUAS = (DUA_CONSTANTS.STORAGE_KEYS && DUA_CONSTANTS.STORAGE_KEYS.DATA) || 'quranDuas_data';
    var STORAGE_KEY_FAVS = (DUA_CONSTANTS.STORAGE_KEYS && DUA_CONSTANTS.STORAGE_KEYS.FAVS) || 'quranDuas_favourites';
    var STORAGE_KEY_PINS = (DUA_CONSTANTS.STORAGE_KEYS && DUA_CONSTANTS.STORAGE_KEYS.PINS) || 'quranDuas_pins';
    var MAX_PINS = typeof DUA_CONSTANTS.MAX_PINS === 'number' ? DUA_CONSTANTS.MAX_PINS : 2;
    var DUA_TABS = DUA_CONSTANTS.TABS || { HOME: 'home', DUAS: 'duas', FAVOURITES: 'favourites' };
    var DRAWING_PIN_SVG = '<app-icon params="name: \'thumbtack\'"></app-icon>';

    var DUA_ICONS = DUA_CONSTANTS.ICONS || {
        PINNED: DRAWING_PIN_SVG,
        UNPINNED: DRAWING_PIN_SVG,
        FAV: '<app-icon params="name: \'heart\', color: \'text-danger\'"></app-icon>',
        UNFAV: '<app-icon params="name: \'heart\', prefix: \'fa-regular\'"></app-icon>'
    };
    var SEARCH_DEBOUNCE_MS = typeof DUA_CONSTANTS.SEARCH_DEBOUNCE_MS === 'number' ? DUA_CONSTANTS.SEARCH_DEBOUNCE_MS : 80;
    var DUA_API_URL = (DUA_CONSTANTS && DUA_CONSTANTS.API_URL) || 'https://raw.githubusercontent.com/iliyas77/data.github.io/main/duas.json';

    function fetchDuasResource() {
        if (typeof DUA_CONSTANTS.fetchDuas === 'function') {
            return DUA_CONSTANTS.fetchDuas();
        }
        return fetch(DUA_API_URL)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            });
    }

    // ===== STATE =====
    var duasData = [];
    var favourites = [];
    var pins = [];
    var currentIndex = 0;
    var activeTab = DUA_TABS.HOME; // 'home' | 'duas' | 'favourites'
    var detailOpenedFrom = DUA_TABS.HOME;
    var pendingPinIndex = null;
    var searchDebounceTimer = null;
    var isLoaded = false;
    var isLoading = false;
    var fetchPromise = null;
    var loadError = null;

    // ===== DATA HELPERS & NORMALIZATION =====
    function getSurah(d) {
        if (!d) return '';
        if (d.surah) return d.surah;
        if (d.surah_name) {
            return d.ayat_number ? (d.surah_name + ' (' + d.ayat_number + ')') : d.surah_name;
        }
        return '';
    }

    function getUchcharana(d) {
        return d ? (d.telugu_uchcharana || d.uchcharana || '') : '';
    }

    function getArdham(d) {
        return d ? (d.telugu_ardham || d.ardham || '') : '';
    }

    function normalizeDua(d) {
        if (!d) return d;
        d.surah = getSurah(d);
        d.uchcharana = getUchcharana(d);
        d.ardham = getArdham(d);
        return d;
    }

    // ===== LOAD FROM STORAGE =====
    function loadFavsAndPins() {
        var storedFavs = localStorage.getItem(STORAGE_KEY_FAVS);
        if (storedFavs) {
            try {
                var parsedFavs = JSON.parse(storedFavs);
                favourites = Array.isArray(parsedFavs) ? parsedFavs : [];
            } catch (e) { favourites = []; }
        } else {
            favourites = [];
        }

        var storedPins = localStorage.getItem(STORAGE_KEY_PINS);
        if (storedPins) {
            try {
                var parsedPins = JSON.parse(storedPins);
                pins = Array.isArray(parsedPins) ? parsedPins : [];
            } catch (e) { pins = []; }
        } else {
            pins = [];
        }
        pins = pins.filter(function (p) { return p >= 0 && p < duasData.length; }).slice(0, MAX_PINS);
    }

    function loadFromStorage() {
        var storedDuas = localStorage.getItem(STORAGE_KEY_DUAS);
        if (storedDuas) {
            try {
                duasData = JSON.parse(storedDuas);
            } catch (e) {
                if (defaultDuas.length > 0) {
                    duasData = defaultDuas.map(function (d) { return Object.assign({}, d); });
                }
            }
        } else if (defaultDuas.length > 0) {
            duasData = defaultDuas.map(function (d) { return Object.assign({}, d); });
            saveDuasToStorage();
        }

        // If stored data was from old 10-item default or partial, upgrade to full dataset if defaultDuas available
        if (Array.isArray(duasData) && defaultDuas.length > 0 && duasData.length < defaultDuas.length) {
            duasData = defaultDuas.map(function (d) { return Object.assign({}, d); });
            saveDuasToStorage();
        }

        if (Array.isArray(duasData)) {
            duasData.forEach(normalizeDua);
        }
        loadFavsAndPins();
    }

    // ===== FETCH DATA =====
    function fetchDuas() {
        if (isLoaded) {
            return Promise.resolve(duasData);
        }
        if (fetchPromise) {
            return fetchPromise;
        }

        isLoading = true;
        loadError = null;
        renderLoadingState();

        var fetcher = fetchDuasResource();

        fetchPromise = fetcher
            .then(function (data) {
                if (!Array.isArray(data)) {
                    throw new Error('Invalid duas data format: expected an array');
                }
                defaultDuas = data;
                isLoaded = true;
                isLoading = false;
                loadError = null;
                fetchPromise = null;

                var loadingEl = document.getElementById('duaLoadingState');
                var errorEl = document.getElementById('duaErrorState');
                if (loadingEl) loadingEl.classList.add('d-none');
                if (errorEl) errorEl.classList.add('d-none');

                loadFromStorage();
                refreshAllViews();
                return duasData;
            })
            .catch(function (err) {
                isLoading = false;
                fetchPromise = null;
                loadError = err;
                console.error('Failed to load duas.json:', err);

                // Gracefully fallback to localStorage if available
                loadFromStorage();
                if (Array.isArray(duasData) && duasData.length > 0) {
                    isLoaded = true;
                    refreshAllViews();
                    return duasData;
                }

                // If no cached data, fall back to empty state and show error
                duasData = [];
                isLoaded = true;
                renderErrorState(err && err.message ? err.message : 'Unable to load Duas data.');
                return [];
            });

        return fetchPromise;
    }

    function renderLoadingState() {
        var loading = document.getElementById('duaLoadingState');
        var error = document.getElementById('duaErrorState');
        var progressIndicator = document.getElementById('duaProgressIndicator');

        if (loading && (!duasData || duasData.length === 0)) loading.classList.remove('d-none');
        if (error) error.classList.add('d-none');
        if (progressIndicator && (!duasData || duasData.length === 0)) progressIndicator.textContent = 'Loading...';
    }

    function renderErrorState(msg) {
        var loading = document.getElementById('duaLoadingState');
        var error = document.getElementById('duaErrorState');
        var errMsg = document.getElementById('duaErrorMessage');
        var progressIndicator = document.getElementById('duaProgressIndicator');

        if (loading) loading.classList.add('d-none');
        if (error && (!duasData || duasData.length === 0)) {
            error.classList.remove('d-none');
            if (errMsg) errMsg.textContent = msg;
        }
        if (progressIndicator && (!duasData || duasData.length === 0)) progressIndicator.textContent = 'Failed to load';
    }

    // ===== SAVE TO STORAGE =====
    function saveDuasToStorage() {
        localStorage.setItem(STORAGE_KEY_DUAS, JSON.stringify(duasData));
    }
    function saveFavouritesToStorage() {
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favourites));
    }
    function savePinsToStorage() {
        localStorage.setItem(STORAGE_KEY_PINS, JSON.stringify(pins));
    }

    // ===== HTML ESCAPING =====
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ===== FILTERED DATA =====
    function getFilteredData() {
        var searchInput = document.getElementById('duaSearchInput');
        var query = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
        if (query === '') return duasData.slice();
        return duasData.filter(function (d) {
            var surah = getSurah(d).toLowerCase();
            var uch = getUchcharana(d).toLowerCase();
            var ard = getArdham(d).toLowerCase();
            var num = String(d.number);
            var ayat = (d.ayat_number || '').toLowerCase();
            return (num === query) ||
                (surah.indexOf(query) !== -1) ||
                (ayat.indexOf(query) !== -1) ||
                (uch.indexOf(query) !== -1) ||
                (ard.indexOf(query) !== -1);
        });
    }

    // ===== RENDER LIST =====
    function renderList() {
        var listView = document.getElementById('duaListView');
        var emptyState = document.getElementById('duaListEmptyState');
        var progressIndicator = document.getElementById('duaProgressIndicator');
        if (!listView) return;

        var filteredData = getFilteredData();
        var vm = (typeof getDuasViewModel === 'function') ? getDuasViewModel() : null;
        var hasKo = typeof ko !== 'undefined' && vm && typeof vm.filteredDuas === 'function';

        if (filteredData.length === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
            if (hasKo) {
                vm.filteredDuas([]);
            } else {
                listView.innerHTML = '';
            }
            if (progressIndicator) progressIndicator.textContent = '0 duas';
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');
        var mapped = filteredData.map(function (dua) {
            var realIndex = duasData.indexOf(dua);
            var isFav = favourites.indexOf(realIndex) !== -1;
            var isPinned = pins.indexOf(realIndex) !== -1;
            var surahLabel = getSurah(dua);
            var uchPreview = getUchcharana(dua);

            return {
                index: realIndex,
                source: 'duas',
                number: dua.number,
                surah: surahLabel,
                preview: uchPreview,
                isPinned: isPinned,
                isFav: isFav
            };
        });

        if (hasKo) {
            vm.filteredDuas(mapped);
        } else {
            listView.innerHTML = mapped.map(function (d) {
                return '<div class="dua-list-item p-3.5 rounded-xl bg-white border border-borderGrey flex items-center gap-3 cursor-pointer hover:bg-surfaceBg hover:border-brand transition-all mb-2" data-act="dua-open-detail" data-idx="' + d.index + '" data-source="duas">' +
                    '<div class="dua-item-number text-sm font-bold text-brand min-w-[36px]">#' + String(d.number).padStart(2, '0') + '</div>' +
                    '<div class="dua-item-content flex-1 min-w-0">' +
                    '  <div class="dua-item-surah text-sm font-semibold text-brand font-telugu truncate">' + escapeHtml(d.surah) + '</div>' +
                    '  <div class="dua-item-preview text-xs text-gr-textMuted font-telugu truncate mt-0.5">' + escapeHtml(d.preview) + '</div>' +
                    '</div>' +
                    '<button type="button" class="dua-action-btn dua-pin-btn p-1.5 rounded-lg text-lg leading-none cursor-pointer hover:bg-black/5 hover:scale-110 transition-all ' + (d.isPinned ? 'pinned text-pinAmber' : 'opacity-50') + '" data-act="dua-item-pin" data-idx="' + d.index + '" title="' + (d.isPinned ? 'Unpin' : 'Pin to Home') + '">' + (d.isPinned ? DUA_ICONS.PINNED : DUA_ICONS.UNPINNED) + '</button>' +
                    '<button type="button" class="dua-action-btn p-1.5 rounded-lg text-lg leading-none cursor-pointer hover:bg-black/5 hover:scale-110 transition-all" data-act="dua-item-fav" data-idx="' + d.index + '" title="Toggle favourite">' + (d.isFav ? DUA_ICONS.FAV : DUA_ICONS.UNFAV) + '</button>' +
                    '</div>';
            }).join('');
        }

        if (progressIndicator) progressIndicator.textContent = filteredData.length + ' duas';
    }

    // ===== RENDER FAVOURITES =====
    function renderFavourites() {
        var favouritesList = document.getElementById('duaFavouritesList');
        var emptyState = document.getElementById('duaFavsEmptyState');
        var progressIndicator = document.getElementById('duaProgressIndicator');
        if (!favouritesList) return;

        var favList = duasData.filter(function (_, idx) {
            return favourites.indexOf(idx) !== -1;
        });
        var vm = (typeof getDuasViewModel === 'function') ? getDuasViewModel() : null;
        var hasKo = typeof ko !== 'undefined' && vm && typeof vm.favouriteDuas === 'function';

        if (favList.length === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
            if (hasKo) {
                vm.favouriteDuas([]);
            } else {
                favouritesList.innerHTML = '';
            }
            if (progressIndicator) progressIndicator.textContent = '0 favourites';
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');
        var mapped = favList.map(function (dua) {
            var realIndex = duasData.indexOf(dua);
            var isPinned = pins.indexOf(realIndex) !== -1;
            var surahLabel = getSurah(dua);
            var uchPreview = getUchcharana(dua);

            return {
                index: realIndex,
                source: 'favourites',
                number: dua.number,
                surah: surahLabel,
                preview: uchPreview,
                isPinned: isPinned,
                isFav: true
            };
        });

        if (hasKo) {
            vm.favouriteDuas(mapped);
        } else {
            favouritesList.innerHTML = mapped.map(function (d) {
                return '<div class="dua-list-item p-3.5 rounded-xl bg-white border border-borderGrey flex items-center gap-3 cursor-pointer hover:bg-surfaceBg hover:border-brand transition-all mb-2" data-act="dua-open-detail" data-idx="' + d.index + '" data-source="favourites">' +
                    '<div class="dua-item-number text-sm font-bold text-brand min-w-[36px]">#' + String(d.number).padStart(2, '0') + '</div>' +
                    '<div class="dua-item-content flex-1 min-w-0">' +
                    '  <div class="dua-item-surah text-sm font-semibold text-brand font-telugu truncate">' + escapeHtml(d.surah) + '</div>' +
                    '  <div class="dua-item-preview text-xs text-gr-textMuted font-telugu truncate mt-0.5">' + escapeHtml(d.preview) + '</div>' +
                    '</div>' +
                    '<button type="button" class="dua-action-btn dua-pin-btn p-1.5 rounded-lg text-lg leading-none cursor-pointer hover:bg-black/5 hover:scale-110 transition-all ' + (d.isPinned ? 'pinned text-pinAmber' : 'opacity-50') + '" data-act="dua-item-pin" data-idx="' + d.index + '" title="' + (d.isPinned ? 'Unpin' : 'Pin to Home') + '">' + (d.isPinned ? DUA_ICONS.PINNED : DUA_ICONS.UNPINNED) + '</button>' +
                    '<button type="button" class="dua-action-btn p-1.5 rounded-lg text-lg leading-none cursor-pointer hover:bg-black/5 hover:scale-110 transition-all" data-act="dua-item-fav" data-idx="' + d.index + '" title="Remove from favourites">' + DUA_ICONS.FAV + '</button>' +
                    '</div>';
            }).join('');
        }

        if (progressIndicator) progressIndicator.textContent = favList.length + ' favourite' + (favList.length === 1 ? '' : 's');
    }

    // ===== RENDER HOME (PINNED DUAS) =====
    function renderHome() {
        var homeView = document.getElementById('duaHomeView');
        var emptyState = document.getElementById('duaHomeEmptyState');
        var content = document.getElementById('duaHomeContent');
        var titleCount = document.getElementById('duaHomeTitleCount');
        var progressIndicator = document.getElementById('duaProgressIndicator');
        if (!homeView) return;

        var vm = (typeof getDuasViewModel === 'function') ? getDuasViewModel() : null;
        var hasKo = typeof ko !== 'undefined' && vm && typeof vm.pinnedDuas === 'function';

        if (pins.length === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
            if (content) content.classList.add('d-none');
            if (hasKo) {
                vm.pinnedDuas([]);
            } else {
                homeView.innerHTML = '';
            }
            if (progressIndicator) progressIndicator.textContent = '0 pinned';
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');
        if (content) content.classList.remove('d-none');
        var titleText = 'Your Pinned Duas (' + pins.length + '/' + MAX_PINS + ')';
        if (titleCount) titleCount.textContent = titleText;
        if (vm && typeof vm.pinnedTitle === 'function') vm.pinnedTitle(titleText);

        var mapped = pins.map(function (pinIndex) {
            var dua = duasData[pinIndex];
            if (!dua) return null;
            return {
                index: pinIndex,
                number: dua.number,
                surah: getSurah(dua),
                uchcharana: getUchcharana(dua),
                ardham: getArdham(dua)
            };
        }).filter(Boolean);

        if (hasKo) {
            vm.pinnedDuas(mapped);
        } else {
            homeView.innerHTML = mapped.map(function (d) {
                return '<div class="pinned-dua-card bg-white border border-borderGrey rounded-2xl p-4 flex flex-col gap-2.5 border-l-4 border-l-brand relative cursor-pointer hover:bg-surfaceBg transition-all mb-3" data-act="dua-open-detail" data-idx="' + d.index + '" data-source="home">' +
                    '<span class="pinned-badge absolute top-3.5 right-4 text-base inline-flex items-center justify-center text-pinAmber">' + DRAWING_PIN_SVG + '</span>' +
                    '<div class="pinned-dua-number text-sm font-bold text-brand">#' + String(d.number).padStart(2, '0') + '</div>' +
                    '<div class="pinned-dua-surah text-base font-bold text-brand font-telugu pr-8">' + escapeHtml(d.surah) + '</div>' +
                    '<div class="pinned-dua-text text-base text-gr-text leading-relaxed font-telugu">' + escapeHtml(d.uchcharana) + '</div>' +
                    '<div class="pinned-dua-meaning text-sm text-gr-textMuted leading-relaxed font-telugu border-t border-dashed border-borderGrey pt-2.5">' + escapeHtml(d.ardham) + '</div>' +
                    '</div>';
            }).join('');
        }

        if (progressIndicator) progressIndicator.textContent = pins.length + ' pinned';
    }

    // ===== TOGGLE FAVOURITE =====
    function toggleFavourite(index) {
        var pos = favourites.indexOf(index);
        if (pos !== -1) {
            favourites.splice(pos, 1);
        } else {
            favourites.push(index);
        }
        saveFavouritesToStorage();
        refreshAllViews();
        updateDetailFavButton();
    }

    function toggleFavouriteCurrent() {
        toggleFavourite(currentIndex);
    }

    // ===== PIN LOGIC =====
    function requestPin(index) {
        var pos = pins.indexOf(index);
        if (pos !== -1) {
            pins.splice(pos, 1);
            savePinsToStorage();
            refreshAllViews();
            return;
        }

        if (pins.length < MAX_PINS) {
            pins.push(index);
            savePinsToStorage();
            refreshAllViews();
            return;
        }

        pendingPinIndex = index;
        showPinConfirm();
    }

    function showPinConfirm() {
        var pinConfirmList = document.getElementById('duaPinConfirmList');
        var pinConfirmModal = document.getElementById('duaPinConfirmModal');
        if (!pinConfirmList || !pinConfirmModal) return;

        pinConfirmList.innerHTML = pins.map(function (p) {
            var dua = duasData[p];
            if (!dua) return '';
            var surahLabel = getSurah(dua);

            return '<button type="button" class="w-full text-left mb-2 flex items-center gap-2 justify-start border border-borderGrey bg-white text-gr-text font-semibold rounded-xl px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer select-none" data-act="dua-replace-pin" data-old-idx="' + p + '">' +
                '<span class="inline-flex items-center justify-center">' + DRAWING_PIN_SVG + '</span>' +
                '<span class="grow truncate font-telugu">#' + String(dua.number).padStart(2, '0') + ' — ' + escapeHtml(surahLabel) + '</span>' +
                '<span class="text-gr-danger font-bold ml-auto">Unpin</span>' +
                '</button>';
        }).join('');

        pinConfirmModal.classList.add('active');
    }

    function closePinConfirm() {
        var pinConfirmModal = document.getElementById('duaPinConfirmModal');
        if (pinConfirmModal) pinConfirmModal.classList.remove('active');
        pendingPinIndex = null;
    }

    function replacePin(oldPinIndex) {
        if (pendingPinIndex === null) return;
        pins = pins.map(function (p) {
            return p === oldPinIndex ? pendingPinIndex : p;
        });
        savePinsToStorage();
        closePinConfirm();
        refreshAllViews();
    }

    function togglePinCurrent() {
        requestPin(currentIndex);
    }

    function refreshAllViews() {
        renderList();
        renderFavourites();
        renderHome();
        updateDetailPinButton();
        updateDetailFavButton();
    }

    // ===== DETAIL VIEW =====
    function openDetail(realIndex, source) {
        currentIndex = realIndex;
        detailOpenedFrom = source || activeTab;

        var subHome = document.getElementById('duaSubHome');
        var subAll = document.getElementById('duaSubAll');
        var subFavs = document.getElementById('duaSubFavs');
        var subDetail = document.getElementById('duaSubDetail');
        var segBar = document.getElementById('duaSegmentBar');
        var btmNav = document.getElementById('duaBottomNav');
        var fab = document.getElementById('duaFabBtn');

        if (subHome) subHome.classList.add('d-none');
        if (subAll) subAll.classList.add('d-none');
        if (subFavs) subFavs.classList.add('d-none');
        if (subDetail) subDetail.classList.remove('d-none');
        if (segBar) segBar.classList.add('d-none');
        if (btmNav) btmNav.classList.add('d-none');
        if (fab) fab.classList.add('d-none');

        updateDetailUI();
    }

    function goBack() {
        var subDetail = document.getElementById('duaSubDetail');
        var segBar = document.getElementById('duaSegmentBar');
        var btmNav = document.getElementById('duaBottomNav');
        var fab = document.getElementById('duaFabBtn');

        if (subDetail) subDetail.classList.add('d-none');
        if (segBar) segBar.classList.remove('d-none');
        if (btmNav) btmNav.classList.remove('d-none');
        if (fab) fab.classList.remove('d-none');

        switchTab(detailOpenedFrom);
    }

    function updateDetailUI() {
        var currentDua = duasData[currentIndex];
        if (!currentDua) return;

        var elNum = document.getElementById('duaDetailNumber');
        var elSurah = document.getElementById('duaDetailSurah');
        var elUch = document.getElementById('duaDetailUchcharana');
        var elArd = document.getElementById('duaDetailArdham');
        var prevBtn = document.getElementById('duaPrevBtn');
        var nextBtn = document.getElementById('duaNextBtn');
        var prog = document.getElementById('duaProgressIndicator');

        if (elNum) elNum.textContent = '#' + String(currentDua.number).padStart(2, '0');
        if (elSurah) elSurah.textContent = getSurah(currentDua);
        if (elUch) elUch.textContent = getUchcharana(currentDua);
        if (elArd) elArd.textContent = getArdham(currentDua);

        if (prevBtn) prevBtn.disabled = (currentIndex === 0);
        if (nextBtn) nextBtn.disabled = (currentIndex === duasData.length - 1);

        if (prog) prog.textContent = (currentIndex + 1) + ' / ' + duasData.length;

        updateDetailFavButton();
        updateDetailPinButton();
    }

    function updateDetailFavButton() {
        var btn = document.getElementById('duaDetailFavBtn');
        var icon = document.getElementById('duaDetailFavIcon');
        if (!btn || !icon) return;
        var isFav = favourites.indexOf(currentIndex) !== -1;
        btn.classList.toggle('is-fav', isFav);
        icon.innerHTML = isFav ? DUA_ICONS.FAV : DUA_ICONS.UNFAV;
    }

    function updateDetailPinButton() {
        var btn = document.getElementById('duaDetailPinBtn');
        var icon = document.getElementById('duaDetailPinIcon');
        if (!btn || !icon) return;
        var isPinned = pins.indexOf(currentIndex) !== -1;
        btn.classList.toggle('is-pinned', isPinned);
        icon.innerHTML = isPinned ? DUA_ICONS.PINNED : DUA_ICONS.UNPINNED;
    }

    function changeDua(direction) {
        currentIndex += direction;
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex >= duasData.length) currentIndex = duasData.length - 1;
        updateDetailUI();
    }

    // ===== TAB SWITCH =====
    function switchTab(tab) {
        activeTab = tab || DUA_TABS.HOME;

        var subDetail = document.getElementById('duaSubDetail');
        if (subDetail) subDetail.classList.add('d-none');

        var segBar = document.getElementById('duaSegmentBar');
        var btmNav = document.getElementById('duaBottomNav');
        if (segBar) segBar.classList.remove('d-none');
        if (btmNav) btmNav.classList.remove('d-none');

        var fab = document.getElementById('duaFabBtn');
        if (fab) fab.classList.remove('d-none');

        var tabPinned = document.getElementById('duaTabPinned');
        var tabAll = document.getElementById('duaTabAll');
        var tabFavs = document.getElementById('duaTabFavs');

        if (tabPinned) {
            var isPin = activeTab === DUA_TABS.HOME;
            tabPinned.classList.toggle('active', isPin);
            tabPinned.classList.toggle('text-brand', isPin);
            tabPinned.classList.toggle('text-gr-textMuted', !isPin);
            tabPinned.setAttribute('aria-selected', isPin ? 'true' : 'false');
        }
        if (tabAll) {
            var isAll = activeTab === DUA_TABS.DUAS;
            tabAll.classList.toggle('active', isAll);
            tabAll.classList.toggle('text-brand', isAll);
            tabAll.classList.toggle('text-gr-textMuted', !isAll);
            tabAll.setAttribute('aria-selected', isAll ? 'true' : 'false');
        }
        if (tabFavs) {
            var isFav = activeTab === DUA_TABS.FAVOURITES;
            tabFavs.classList.toggle('active', isFav);
            tabFavs.classList.toggle('text-brand', isFav);
            tabFavs.classList.toggle('text-gr-textMuted', !isFav);
            tabFavs.setAttribute('aria-selected', isFav ? 'true' : 'false');
        }

        var subHome = document.getElementById('duaSubHome');
        var subAll = document.getElementById('duaSubAll');
        var subFavs = document.getElementById('duaSubFavs');

        if (subHome) subHome.classList.toggle('d-none', activeTab !== DUA_TABS.HOME);
        if (subAll) subAll.classList.toggle('d-none', activeTab !== DUA_TABS.DUAS);
        if (subFavs) subFavs.classList.toggle('d-none', activeTab !== DUA_TABS.FAVOURITES);

        if (isLoading && duasData.length === 0) {
            renderLoadingState();
            return;
        }

        if (loadError && duasData.length === 0) {
            renderErrorState(loadError.message || 'Failed to load Duas data.');
            return;
        }

        if (activeTab === DUA_TABS.HOME) {
            renderHome();
        } else if (activeTab === DUA_TABS.DUAS) {
            renderList();
        } else {
            renderFavourites();
        }

        if (duasViewModel && typeof duasViewModel.currentSubTab === 'function') {
            duasViewModel.currentSubTab(activeTab);
        }
    }

    // ===== SEARCH INPUT =====
    function handleSearch() {
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(function () {
            renderList();
        }, SEARCH_DEBOUNCE_MS);
    }

    // ===== ADD DUA MODAL =====
    function openAddModal() {
        var addDuaModal = document.getElementById('duaAddModal');
        var addNumber = document.getElementById('duaAddNumber');
        var addSurah = document.getElementById('duaAddSurah');
        var addUch = document.getElementById('duaAddUchcharana');
        var addArd = document.getElementById('duaAddArdham');

        var nextNum = 1;
        if (duasData.length > 0) {
            var maxNum = 0;
            duasData.forEach(function (d) { if (d.number > maxNum) maxNum = d.number; });
            nextNum = maxNum + 1;
        }

        if (addNumber) addNumber.value = nextNum;
        if (addSurah) addSurah.value = '';
        if (addUch) addUch.value = '';
        if (addArd) addArd.value = '';

        if (addDuaModal) addDuaModal.classList.add('active');
        setTimeout(function () {
            if (addNumber) addNumber.focus();
        }, 120);
    }

    function closeAddModal() {
        var addDuaModal = document.getElementById('duaAddModal');
        if (addDuaModal) addDuaModal.classList.remove('active');
    }

    function saveNewDua() {
        var addNumber = document.getElementById('duaAddNumber');
        var addSurah = document.getElementById('duaAddSurah');
        var addUch = document.getElementById('duaAddUchcharana');
        var addArd = document.getElementById('duaAddArdham');

        var number = parseInt(addNumber ? addNumber.value : '', 10);
        var surah = addSurah ? addSurah.value.trim() : '';
        var uchcharana = addUch ? addUch.value.trim() : '';
        var ardham = addArd ? addArd.value.trim() : '';

        if (!number || isNaN(number)) {
            alert('Please enter a valid Dua number.');
            return;
        }
        if (!surah || !uchcharana || !ardham) {
            alert('Please fill in all fields (Surah, Pronunciation, Meaning).');
            return;
        }

        var newDua = {
            number: number,
            surah_name: surah,
            ayat_number: '',
            telugu_uchcharana: uchcharana,
            telugu_ardham: ardham,
            surah: surah,
            uchcharana: uchcharana,
            ardham: ardham
        };
        duasData.push(newDua);
        saveDuasToStorage();

        closeAddModal();
        refreshAllViews();

        var progressIndicator = document.getElementById('duaProgressIndicator');
        if (progressIndicator) progressIndicator.textContent = '✅ Dua #' + number + ' added!';
    }

    // ===== ADMIN MODAL =====
    function openAdminModal() {
        var adminModal = document.getElementById('duaAdminModal');
        if (adminModal) {
            adminModal.classList.add('active');
            renderAdminList();
        }
    }

    function closeAdminModal() {
        var adminModal = document.getElementById('duaAdminModal');
        if (adminModal) adminModal.classList.remove('active');
    }

    function renderAdminList() {
        var adminDuaList = document.getElementById('duaAdminDuaList');
        var emptyState = document.getElementById('duaAdminEmptyState');
        if (!adminDuaList) return;

        if (duasData.length === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
            adminDuaList.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.classList.add('d-none');
        adminDuaList.innerHTML = duasData.map(function (dua, idx) {
            var surahLabel = getSurah(dua);
            return '<div class="dua-admin-item p-2.5 bg-surfaceBg rounded-xl text-sm border border-borderGrey flex items-center gap-2.5 mb-2">' +
                '<span class="dua-item-number text-sm font-bold text-brand min-w-[36px]">#' + String(dua.number).padStart(2, '0') + '</span>' +
                '<span class="admin-item-name flex-1 text-truncate">' + escapeHtml(surahLabel) + '</span>' +
                '<button type="button" class="dua-admin-del-btn p-1 text-base leading-none rounded cursor-pointer hover:bg-red-500/10 transition-colors" data-act="dua-del" data-idx="' + idx + '" title="Delete">🗑️</button>' +
                '</div>';
        }).join('');
    }

    function deleteDua(index) {
        if (!confirm('Are you sure you want to delete this dua?')) return;
        duasData.splice(index, 1);

        favourites = favourites
            .filter(function (f) { return f !== index; })
            .map(function (f) { return f > index ? f - 1 : f; });

        pins = pins
            .filter(function (p) { return p !== index; })
            .map(function (p) { return p > index ? p - 1 : p; });

        saveDuasToStorage();
        saveFavouritesToStorage();
        savePinsToStorage();
        renderAdminList();
        refreshAllViews();
    }

    function resetAllData() {
        if (!confirm('Reset all data to default? This will restore the 100 original Quran duas and reset custom additions, favourites, and pins.')) return;
        function doReset() {
            duasData = defaultDuas.map(function (d) { return Object.assign({}, d); });
            duasData.forEach(normalizeDua);
            favourites = [];
            pins = [];
            saveDuasToStorage();
            saveFavouritesToStorage();
            savePinsToStorage();
            renderAdminList();
            refreshAllViews();
        }
        if (defaultDuas.length > 0) {
            doReset();
        } else {
            fetchDuas().then(doReset);
        }
    }

    // ===== INIT & RENDER =====
    function init() {
        var pageEl = document.getElementById('duasPage');
        if (pageEl && typeof ko !== 'undefined') {
            registerDuasComponents();
            var vm = (typeof getDuasViewModel === 'function') ? getDuasViewModel() : null;
            if (vm && !ko.dataFor(pageEl)) {
                ko.applyBindings(vm, pageEl);
            }
        }
        return fetchDuas();
    }

    function render() {
        var pageEl = document.getElementById('duasPage');
        if (pageEl && typeof ko !== 'undefined' && !ko.dataFor(pageEl)) {
            init();
        }

        var isDomReady = document.getElementById('duaHomeView') || document.getElementById('duaListView');
        if (!isDomReady) {
            setTimeout(function () {
                render();
            }, 30);
            return;
        }

        if (!isLoaded && isLoading) {
            renderLoadingState();
            return;
        }
        if (!isLoaded) {
            renderLoadingState();
            fetchDuas().then(function () {
                switchTab(activeTab || 'home');
            }).catch(function () {
                switchTab(activeTab || 'home');
            });
            return;
        }
        switchTab(activeTab || 'home');
    }

    // Setup search listener when DOM ready
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function () {
            fetchDuas();
            var searchInput = document.getElementById('duaSearchInput');
            if (searchInput) {
                searchInput.addEventListener('input', handleSearch);
            }
            var searchClear = document.getElementById('duaSearchClear');
            if (searchClear && searchInput) {
                searchClear.addEventListener('click', function () {
                    searchInput.value = '';
                    searchClear.classList.add('d-none');
                    renderList();
                    searchInput.focus();
                });
                searchInput.addEventListener('input', function () {
                    if (searchInput.value.length > 0) {
                        searchClear.classList.remove('d-none');
                    } else {
                        searchClear.classList.add('d-none');
                    }
                });
            }
        });
    }

    // Public API
    return {
        init: init,
        fetchDuas: fetchDuas,
        render: render,
        switchTab: switchTab,
        openDetail: openDetail,
        goBack: goBack,
        toggleFavourite: toggleFavourite,
        toggleFavouriteCurrent: toggleFavouriteCurrent,
        requestPin: requestPin,
        replacePin: replacePin,
        togglePinCurrent: togglePinCurrent,
        changeDua: changeDua,
        openAddModal: openAddModal,
        closeAddModal: closeAddModal,
        saveNewDua: saveNewDua,
        openAdminModal: openAdminModal,
        closeAdminModal: closeAdminModal,
        deleteDua: deleteDua,
        resetAllData: resetAllData,
        closePinConfirm: closePinConfirm
    };
})();

if (typeof window !== 'undefined') {
    window.DuaApp = window.DuasApp;
    window.DuasPageViewModel = DuasPageViewModel;
    window.getDuasViewModel = getDuasViewModel;
    window.initDuas = initDuas;
    window.registerDuasComponents = registerDuasComponents;
}

export {
    duasViewModel
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DuasPageTemplate: DuasPageTemplate,
        DuvaHeaderTemplate: DuvaHeaderTemplate,
        DuvaSearchBarTemplate: DuvaSearchBarTemplate,
        DuvaNavTabTemplate: DuvaNavTabTemplate,
        DuvaPinnedCardTemplate: DuvaPinnedCardTemplate,
        DuvaCardTemplate: DuvaCardTemplate,
        DuvaTranslationToggleTemplate: DuvaTranslationToggleTemplate,
        DuasPageViewModel: DuasPageViewModel,
        getDuasViewModel: getDuasViewModel,
        initDuas: initDuas,
        registerDuasComponents: registerDuasComponents
    };
    module.exports.default = (typeof window !== 'undefined' ? window.DuasApp : null);
}

export default (typeof window !== 'undefined' ? window.DuasApp : null);
