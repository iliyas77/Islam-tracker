/* ============================================================
   Nur Prayer — Quran Duas Feature Module
   Path: features/duas/duas.js
   ============================================================ */
'use strict';

window.DuasApp = (function () {
    // ===== CONSTANTS (Referenced from utilities/constant.js) =====
    var DUA_CONSTANTS = (window.CONSTANTS && (window.CONSTANTS.DUA || window.CONSTANTS.DUAS)) || {};
    var defaultDuas = DUA_CONSTANTS.DEFAULT_DUAS || [];
    var STORAGE_KEY_DUAS = (DUA_CONSTANTS.STORAGE_KEYS && DUA_CONSTANTS.STORAGE_KEYS.DATA) || 'quranDuas_data';
    var STORAGE_KEY_FAVS = (DUA_CONSTANTS.STORAGE_KEYS && DUA_CONSTANTS.STORAGE_KEYS.FAVS) || 'quranDuas_favourites';
    var STORAGE_KEY_PINS = (DUA_CONSTANTS.STORAGE_KEYS && DUA_CONSTANTS.STORAGE_KEYS.PINS) || 'quranDuas_pins';
    var MAX_PINS = typeof DUA_CONSTANTS.MAX_PINS === 'number' ? DUA_CONSTANTS.MAX_PINS : 2;
    var DUA_TABS = DUA_CONSTANTS.TABS || { HOME: 'home', DUAS: 'duas', FAVOURITES: 'favourites' };
    var DUA_ICONS = DUA_CONSTANTS.ICONS || {
        PINNED: '📌',
        UNPINNED: '📍',
        FAV: '❤️',
        UNFAV: '♡'
    };
    var SEARCH_DEBOUNCE_MS = typeof DUA_CONSTANTS.SEARCH_DEBOUNCE_MS === 'number' ? DUA_CONSTANTS.SEARCH_DEBOUNCE_MS : 80;

    // ===== STATE =====
    var duasData = [];
    var favourites = [];
    var pins = [];
    var currentIndex = 0;
    var activeTab = DUA_TABS.HOME; // 'home' | 'duas' | 'favourites'
    var detailOpenedFrom = DUA_TABS.HOME;
    var pendingPinIndex = null;
    var searchDebounceTimer = null;

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
    function loadFromStorage() {
        var storedDuas = localStorage.getItem(STORAGE_KEY_DUAS);
        if (storedDuas) {
            try { duasData = JSON.parse(storedDuas); }
            catch (e) { duasData = defaultDuas.map(function (d) { return Object.assign({}, d); }); }
        } else {
            duasData = defaultDuas.map(function (d) { return Object.assign({}, d); });
            saveDuasToStorage();
        }

        // If stored data was from old 10-item default or invalid, upgrade to full default dataset
        if (!Array.isArray(duasData) || duasData.length < defaultDuas.length) {
            duasData = defaultDuas.map(function (d) { return Object.assign({}, d); });
            saveDuasToStorage();
        }

        duasData.forEach(normalizeDua);

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
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
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
        var progressIndicator = document.getElementById('duaProgressIndicator');
        if (!listView) return;

        var filteredData = getFilteredData();
        if (filteredData.length === 0) {
            listView.innerHTML = '<div class="dua-empty-state">No duas match your search.</div>';
            if (progressIndicator) progressIndicator.textContent = '0 duas';
            return;
        }

        listView.innerHTML = filteredData.map(function (dua) {
            var realIndex = duasData.indexOf(dua);
            var isFav = favourites.indexOf(realIndex) !== -1;
            var isPinned = pins.indexOf(realIndex) !== -1;
            var surahLabel = getSurah(dua);
            var uchPreview = getUchcharana(dua);

            return '<div class="dua-list-item flex items-center" data-act="dua-open-detail" data-idx="' + realIndex + '" data-source="duas">' +
                '<div class="dua-item-number">#' + String(dua.number).padStart(2, '0') + '</div>' +
                '<div class="dua-item-content flex-1 min-w-0">' +
                '  <div class="dua-item-surah">' + escapeHtml(surahLabel) + '</div>' +
                '  <div class="dua-item-preview">' + escapeHtml(uchPreview) + '</div>' +
                '</div>' +
                '<button type="button" class="dua-action-btn dua-pin-btn ' + (isPinned ? 'pinned' : '') + '"' +
                ' data-act="dua-item-pin" data-idx="' + realIndex + '" title="' + (isPinned ? 'Unpin' : 'Pin to Home') + '">' +
                (isPinned ? DUA_ICONS.PINNED : DUA_ICONS.UNPINNED) +
                '</button>' +
                '<button type="button" class="dua-action-btn" data-act="dua-item-fav" data-idx="' + realIndex + '" title="Toggle favourite">' +
                (isFav ? DUA_ICONS.FAV : DUA_ICONS.UNFAV) +
                '</button>' +
                '</div>';
        }).join('');

        if (progressIndicator) progressIndicator.textContent = filteredData.length + ' duas';
    }

    // ===== RENDER FAVOURITES =====
    function renderFavourites() {
        var favouritesList = document.getElementById('duaFavouritesList');
        var progressIndicator = document.getElementById('duaProgressIndicator');
        if (!favouritesList) return;

        var favList = duasData.filter(function (_, idx) {
            return favourites.indexOf(idx) !== -1;
        });

        if (favList.length === 0) {
            favouritesList.innerHTML = '<div class="dua-empty-state">No favourites yet.<br>Tap the ♡ icon on any dua to add it here.</div>';
            if (progressIndicator) progressIndicator.textContent = '0 favourites';
            return;
        }

        favouritesList.innerHTML = favList.map(function (dua) {
            var realIndex = duasData.indexOf(dua);
            var isPinned = pins.indexOf(realIndex) !== -1;
            var surahLabel = getSurah(dua);
            var uchPreview = getUchcharana(dua);

            return '<div class="dua-list-item flex items-center" data-act="dua-open-detail" data-idx="' + realIndex + '" data-source="favourites">' +
                '<div class="dua-item-number">#' + String(dua.number).padStart(2, '0') + '</div>' +
                '<div class="dua-item-content flex-1 min-w-0">' +
                '  <div class="dua-item-surah">' + escapeHtml(surahLabel) + '</div>' +
                '  <div class="dua-item-preview">' + escapeHtml(uchPreview) + '</div>' +
                '</div>' +
                '<button type="button" class="dua-action-btn dua-pin-btn ' + (isPinned ? 'pinned' : '') + '"' +
                ' data-act="dua-item-pin" data-idx="' + realIndex + '" title="' + (isPinned ? 'Unpin' : 'Pin to Home') + '">' +
                (isPinned ? DUA_ICONS.PINNED : DUA_ICONS.UNPINNED) +
                '</button>' +
                '<button type="button" class="dua-action-btn" data-act="dua-item-fav" data-idx="' + realIndex + '" title="Remove from favourites">' +
                DUA_ICONS.FAV +
                '</button>' +
                '</div>';
        }).join('');

        if (progressIndicator) progressIndicator.textContent = favList.length + ' favourite' + (favList.length === 1 ? '' : 's');
    }

    // ===== RENDER HOME (PINNED DUAS) =====
    function renderHome() {
        var homeView = document.getElementById('duaHomeView');
        var progressIndicator = document.getElementById('duaProgressIndicator');
        if (!homeView) return;

        if (pins.length === 0) {
            homeView.innerHTML = '<div class="dua-empty-state">' +
                '📌 No pinned duas yet.<br>' +
                'Tap the 📍 pin icon on any dua to pin it here.<br>' +
                '<span class="small opacity-75 mt-2 d-block">You can pin up to ' + MAX_PINS + ' duas for quick access.</span>' +
                '</div>';
            if (progressIndicator) progressIndicator.textContent = '0 pinned';
            return;
        }

        homeView.innerHTML = '<div class="home-section-title mb-2">📌 Your Pinned Duas (' + pins.length + '/' + MAX_PINS + ')</div>' +
            pins.map(function (pinIndex) {
                var dua = duasData[pinIndex];
                if (!dua) return '';
                var surahLabel = getSurah(dua);
                var uch = getUchcharana(dua);
                var ard = getArdham(dua);

                return '<div class="pinned-dua-card flex flex-col mb-3" data-act="dua-open-detail" data-idx="' + pinIndex + '" data-source="home">' +
                    '<span class="pinned-badge">📌</span>' +
                    '<div class="pinned-dua-number">#' + String(dua.number).padStart(2, '0') + '</div>' +
                    '<div class="pinned-dua-surah">' + escapeHtml(surahLabel) + '</div>' +
                    '<div class="pinned-dua-text">' + escapeHtml(uch) + '</div>' +
                    '<div class="pinned-dua-meaning">' + escapeHtml(ard) + '</div>' +
                    '</div>';
            }).join('') +
            '<div class="pin-limit-note">Tap the 📌 icon on a dua to unpin it, or pin another (max ' + MAX_PINS + ').</div>';

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

            return '<button class="btn btn-outline-secondary w-100 text-start mb-2 flex items-center gap-2 justify-start" ' +
                'type="button" data-act="dua-replace-pin" data-old-idx="' + p + '">' +
                '<span>📌</span>' +
                '<span class="grow text-truncate font-telugu">' +
                '#' + String(dua.number).padStart(2, '0') + ' — ' + escapeHtml(surahLabel) +
                '</span>' +
                '<span class="text-danger fw-bold ms-auto">Unpin</span>' +
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
        icon.textContent = isFav ? DUA_ICONS.FAV : DUA_ICONS.UNFAV;
    }

    function updateDetailPinButton() {
        var btn = document.getElementById('duaDetailPinBtn');
        var icon = document.getElementById('duaDetailPinIcon');
        if (!btn || !icon) return;
        var isPinned = pins.indexOf(currentIndex) !== -1;
        btn.classList.toggle('is-pinned', isPinned);
        icon.textContent = isPinned ? DUA_ICONS.PINNED : DUA_ICONS.UNPINNED;
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
            tabPinned.classList.toggle('active', activeTab === DUA_TABS.HOME);
            tabPinned.setAttribute('aria-selected', activeTab === DUA_TABS.HOME ? 'true' : 'false');
        }
        if (tabAll) {
            tabAll.classList.toggle('active', activeTab === DUA_TABS.DUAS);
            tabAll.setAttribute('aria-selected', activeTab === DUA_TABS.DUAS ? 'true' : 'false');
        }
        if (tabFavs) {
            tabFavs.classList.toggle('active', activeTab === DUA_TABS.FAVOURITES);
            tabFavs.setAttribute('aria-selected', activeTab === DUA_TABS.FAVOURITES ? 'true' : 'false');
        }

        var subHome = document.getElementById('duaSubHome');
        var subAll = document.getElementById('duaSubAll');
        var subFavs = document.getElementById('duaSubFavs');

        if (subHome) subHome.classList.toggle('d-none', activeTab !== DUA_TABS.HOME);
        if (subAll) subAll.classList.toggle('d-none', activeTab !== DUA_TABS.DUAS);
        if (subFavs) subFavs.classList.toggle('d-none', activeTab !== DUA_TABS.FAVOURITES);

        if (activeTab === DUA_TABS.HOME) {
            renderHome();
        } else if (activeTab === DUA_TABS.DUAS) {
            renderList();
        } else {
            renderFavourites();
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
        if (!adminDuaList) return;

        if (duasData.length === 0) {
            adminDuaList.innerHTML = '<div class="dua-empty-state py-3">No duas yet.</div>';
            return;
        }

        adminDuaList.innerHTML = duasData.map(function (dua, idx) {
            var surahLabel = getSurah(dua);
            return '<div class="dua-admin-item flex items-center">' +
                '<span class="dua-item-number">#' + String(dua.number).padStart(2, '0') + '</span>' +
                '<span class="admin-item-name flex-1 text-truncate">' + escapeHtml(surahLabel) + '</span>' +
                '<button type="button" class="dua-admin-del-btn" data-act="dua-del" data-idx="' + idx + '" title="Delete">🗑️</button>' +
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

    // ===== INIT & RENDER =====
    function render() {
        loadFromStorage();
        switchTab(activeTab || 'home');
    }

    // Setup search listener when DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        loadFromStorage();
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

    // Public API
    return {
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
