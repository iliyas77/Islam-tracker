// tests/dua-components.test.js
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runDuaComponentTests() {
    console.log('▶ Running Dua Modular Component Architecture Tests...');

    // Minimal Mock for Knockout
    const registeredComponents = {};
    const mockKo = {
        observable(init) {
            let v = init;
            const subs = [];
            const fn = function (newVal) {
                if (arguments.length > 0) {
                    if (v !== newVal) {
                        v = newVal;
                        subs.forEach(s => s(v));
                    }
                    return fn;
                }
                return v;
            };
            fn.subscribe = function (cb) { subs.push(cb); return { dispose() {} }; };
            fn.__ko_proto__ = fn;
            return fn;
        },
        observableArray(init) {
            const obs = mockKo.observable(init ? [...init] : []);
            obs.push = function (...args) {
                const arr = obs();
                arr.push(...args);
                obs(arr);
            };
            obs.remove = function (predicateOrItem) {
                const arr = obs();
                const filtered = typeof predicateOrItem === 'function'
                    ? arr.filter(x => !predicateOrItem(x))
                    : arr.filter(x => x !== predicateOrItem);
                obs(filtered);
                return arr.filter(x => !filtered.includes(x));
            };
            obs.removeAll = function () {
                const old = obs();
                obs([]);
                return old;
            };
            return obs;
        },
        pureComputed(readOrOpts) {
            const read = typeof readOrOpts === 'function' ? readOrOpts : (readOrOpts && readOrOpts.read);
            const write = (readOrOpts && typeof readOrOpts.write === 'function') ? readOrOpts.write : function () {};
            const fn = function (val) {
                if (arguments.length > 0) {
                    write(val);
                    return fn;
                }
                return read ? read() : undefined;
            };
            fn.__ko_proto__ = fn;
            fn.subscribe = function () { return { dispose() {} }; };
            return fn;
        },
        computed(read) { return mockKo.pureComputed(read); },
        isObservable(fn) { return typeof fn === 'function' && !!fn.__ko_proto__; },
        unwrap(val) { return typeof val === 'function' && val.__ko_proto__ ? val() : val; },
        components: {
            register(name, config) {
                registeredComponents[name] = config;
            },
            isRegistered(name) {
                return !!registeredComponents[name];
            },
            getRegistered() {
                return registeredComponents;
            }
        }
    };

    globalThis.ko = mockKo;

    // Mock document for Node environment
    globalThis.document = {
        getElementById() { return null; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        addEventListener() {},
        removeEventListener() {}
    };

    // Mock localStorage
    const storageStore = {};
    globalThis.localStorage = {
        getItem(key) { return storageStore[key] || null; },
        setItem(key, val) { storageStore[key] = String(val); },
        removeItem(key) { delete storageStore[key]; },
        clear() { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
    };

    // ==========================================
    // 1. DuaService Verification
    // ==========================================
    const {
        DuaService,
        DUA_STORAGE_KEYS,
        MAX_PINS,
        DUA_API_URL,
        getSurah,
        getUchcharana,
        getArdham,
        normalizeDua,
        loadDuasFromStorage,
        saveDuasToStorage,
        loadFavourites,
        saveFavourites,
        loadPins,
        savePins,
        filterDuas,
        toggleFavourite,
        togglePin
    } = await import(path.join(ROOT, 'features', 'dua', 'dua-service.js'));

    assert(DuaService, 'DuaService must be exported');
    assert.strictEqual(MAX_PINS, 2, 'Maximum pins must be 2');
    assert.strictEqual(DUA_STORAGE_KEYS.DATA, 'quranDuas_data');
    assert.strictEqual(DUA_STORAGE_KEYS.FAVS, 'quranDuas_favourites');
    assert.strictEqual(DUA_STORAGE_KEYS.PINS, 'quranDuas_pins');
    assert(DUA_API_URL.includes('duas.json'));

    // Normalization & Helpers
    const rawDua = {
        number: 1,
        surah_name: 'అల్-బఖర',
        ayat_number: '201',
        telugu_uchcharana: 'రబ్బనా ఆతినా...',
        telugu_ardham: 'ఓ మా ప్రభూ...'
    };
    const norm = normalizeDua(rawDua);
    assert.strictEqual(norm.surah, 'అల్-బఖర (201)');
    assert.strictEqual(norm.uchcharana, 'రబ్బనా ఆతినా...');
    assert.strictEqual(norm.ardham, 'ఓ మా ప్రభూ...');

    // Storage persistence
    saveDuasToStorage([norm]);
    const loadedDuas = loadDuasFromStorage();
    assert.strictEqual(loadedDuas.length, 1);
    assert.strictEqual(loadedDuas[0].surah, 'అల్-బఖర (201)');

    // Search filter
    const searchMatch = filterDuas('బఖర', loadedDuas);
    assert.strictEqual(searchMatch.length, 1);
    const searchNoMatch = filterDuas('నాస్', loadedDuas);
    assert.strictEqual(searchNoMatch.length, 0);

    // Favourites & Pin Limit
    saveFavourites([]);
    toggleFavourite(0);
    assert.deepStrictEqual(loadFavourites(), [0]);
    toggleFavourite(0);
    assert.deepStrictEqual(loadFavourites(), []);

    savePins([]);
    const pinRes1 = togglePin(0);
    assert.deepStrictEqual(pinRes1.pins, [0]);
    const pinRes2 = togglePin(1);
    assert.deepStrictEqual(pinRes2.pins, [0, 1]);
    const pinRes3 = togglePin(2); // Should exceed MAX_PINS
    assert.strictEqual(pinRes3.success, false);
    assert.strictEqual(pinRes3.error, 'limit_reached');

    console.log('  ✔ DuaService: Data normalization, search filtering, persistence, and pin limits verified');

    // ==========================================
    // 2. Dua All Components Verification
    // ==========================================
    const { DuaAllCardViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-card', 'dua-all-card.js')
    );
    const { DuaAllFeedViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-feed', 'dua-all-feed.js')
    );
    const { DuaAllFormViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-form', 'dua-all-form.js')
    );
    const { DuaAllPageViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-page', 'dua-all-page.js')
    );

    // Card ViewModel
    let cardDetailOpened = null;
    let cardPinToggled = null;
    let cardFavToggled = null;
    const cardVm = new DuaAllCardViewModel({
        item: norm,
        index: 0,
        isFav: true,
        isPinned: false,
        onSelectDua: (item, idx) => { cardDetailOpened = { item, idx }; },
        onTogglePin: (item, idx) => { cardPinToggled = { item, idx }; },
        onToggleFav: (item, idx) => { cardFavToggled = { item, idx }; }
    });
    assert.strictEqual(cardVm.displayNumber, '#01');
    assert.strictEqual(cardVm.surah, 'అల్-బఖర (201)');
    assert.strictEqual(cardVm.isFav, true);
    assert.strictEqual(cardVm.isPinned, false);
    cardVm.onOpenDetail({}, { stopPropagation() {} });
    assert.strictEqual(cardDetailOpened.idx, 0);
    cardVm.onTogglePin({}, { stopPropagation() {} });
    assert.strictEqual(cardPinToggled.idx, 0);
    cardVm.onToggleFav({}, { stopPropagation() {} });
    assert.strictEqual(cardFavToggled.idx, 0);

    // Feed ViewModel
    let feedDetail = null;
    const feedVm = new DuaAllFeedViewModel({
        duas: mockKo.observableArray([norm]),
        favourites: mockKo.observableArray([0]),
        pins: mockKo.observableArray([]),
        onSelectDua: (item, idx) => { feedDetail = { item, idx }; }
    });
    assert.strictEqual(feedVm.hasResults(), true);
    assert.strictEqual(feedVm.isFav(norm, 0), true);
    assert.strictEqual(feedVm.isPinned(norm, 0), false);
    feedVm.handleSelect(norm, 0, { stopPropagation() {} });
    assert.strictEqual(feedDetail.idx, 0);

    // Form ViewModel (Add New Dua modal)
    let savedNewDua = null;
    const formVm = new DuaAllFormViewModel({
        isOpen: mockKo.observable(true),
        nextNumber: 2,
        onSaveDua: d => { savedNewDua = d; }
    });
    assert.strictEqual(formVm.isOpen(), true);
    formVm.handleSave({}, { stopPropagation() {} });
    assert(formVm.errorMessage().length > 0, 'Validation requires surah, uchcharana, and ardham');

    formVm.surah('అల్-ఇమ్రాన్');
    formVm.uchcharana('రబ్బనా లా తుజిగ్ ఖులుబనా...');
    formVm.ardham('ఓ మా ప్రభూ, మా హృదయాలను...');
    formVm.handleSave({}, { stopPropagation() {} });
    assert.strictEqual(savedNewDua.surah, 'అల్-ఇమ్రాన్');
    assert.strictEqual(savedNewDua.number, 2);

    // Page ViewModel & Three-Level Communication
    let pageOpenedDetail = null;
    const pageVm = new DuaAllPageViewModel({
        allDuas: mockKo.observableArray([norm]),
        onSelectDua: (item, idx) => { pageOpenedDetail = { item, idx }; }
    });
    assert.strictEqual(pageVm.filteredDuas().length, 1);
    pageVm.searchQuery('నాస్');
    assert.strictEqual(pageVm.filteredDuas().length, 0);
    pageVm.clearSearch();
    assert.strictEqual(pageVm.filteredDuas().length, 1);

    pageVm.handleSelectDua(norm, 0);
    assert.strictEqual(pageOpenedDetail.idx, 0, 'Page handles selection forwarded from feed/card');

    console.log('  ✔ Dua All: Card, Feed, Form, Page, and 3-level communication verified');

    // ==========================================
    // 3. Dua Pinned Components Verification
    // ==========================================
    const { DuaPinnedCardViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-pinned', 'dua-pinned-card', 'dua-pinned-card.js')
    );
    const { DuaPinnedFeedViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-pinned', 'dua-pinned-feed', 'dua-pinned-feed.js')
    );
    const { DuaPinnedPageViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-pinned', 'dua-pinned-page', 'dua-pinned-page.js')
    );

    let unpinnedIdx = null;
    const pinnedCardVm = new DuaPinnedCardViewModel({
        item: norm,
        index: 0,
        onUnpin: (item, idx) => { unpinnedIdx = idx; }
    });
    assert.strictEqual(pinnedCardVm.displayNumber, '#01');
    pinnedCardVm.onUnpin({}, { stopPropagation() {} });
    assert.strictEqual(unpinnedIdx, 0);

    let feedUnpinned = null;
    const pinnedFeedVm = new DuaPinnedFeedViewModel({
        pinnedDuas: mockKo.observableArray([norm]),
        onUnpin: (item, idx) => { feedUnpinned = idx; }
    });
    assert.strictEqual(pinnedFeedVm.hasPinned(), true);
    pinnedFeedVm.handleUnpin(norm, 0, { stopPropagation() {} });
    assert.strictEqual(feedUnpinned, 0);

    const pinnedPageVm = new DuaPinnedPageViewModel({
        allDuas: mockKo.observableArray([norm]),
        pins: mockKo.observableArray([0])
    });
    assert.strictEqual(pinnedPageVm.pinnedDuas().length, 1);

    console.log('  ✔ Dua Pinned: Card, Feed, and Page ViewModels verified');

    // ==========================================
    // 4. Dua Favourites Components Verification
    // ==========================================
    const { DuaFavouritesCardViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-favourites', 'dua-favourites-card', 'dua-favourites-card.js')
    );
    const { DuaFavouritesFeedViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-favourites', 'dua-favourites-feed', 'dua-favourites-feed.js')
    );
    const { DuaFavouritesPageViewModel } = await import(
        path.join(ROOT, 'features', 'dua', 'dua-favourites', 'dua-favourites-page', 'dua-favourites-page.js')
    );

    let favRemovedIdx = null;
    const favCardVm = new DuaFavouritesCardViewModel({
        item: norm,
        index: 0,
        onToggleFav: (item, idx) => { favRemovedIdx = idx; }
    });
    assert.strictEqual(favCardVm.displayNumber, '#01');
    favCardVm.onToggleFav({}, { stopPropagation() {} });
    assert.strictEqual(favRemovedIdx, 0);

    let feedFavToggled = null;
    const favFeedVm = new DuaFavouritesFeedViewModel({
        favouriteDuas: mockKo.observableArray([norm]),
        onToggleFav: (item, idx) => { feedFavToggled = idx; }
    });
    assert.strictEqual(favFeedVm.hasFavourites(), true);
    favFeedVm.handleToggleFav(norm, 0, { stopPropagation() {} });
    assert.strictEqual(feedFavToggled, 0);

    const favPageVm = new DuaFavouritesPageViewModel({
        allDuas: mockKo.observableArray([norm]),
        favourites: mockKo.observableArray([0])
    });
    assert.strictEqual(favPageVm.favouriteDuas().length, 1);

    console.log('  ✔ Dua Favourites: Card, Feed, and Page ViewModels verified');

    // ==========================================
    // 5. Registration Verification
    // ==========================================
    const { registerDuaComponents } = await import(path.join(ROOT, 'features', 'dua', 'dua-registration.js'));
    registerDuaComponents(mockKo);

    const expectedComponents = [
        'dua-all-page',
        'dua-all-feed',
        'dua-all-card',
        'dua-all-form',
        'dua-pinned-page',
        'dua-pinned-feed',
        'dua-pinned-card',
        'dua-favourites-page',
        'dua-favourites-feed',
        'dua-favourites-card',
        // Backward-compatibility aliases
        'duva-header',
        'duva-search-bar',
        'duva-nav-tab',
        'duva-pinned-card',
        'duva-card',
        'duva-translation-toggle'
    ];

    for (const name of expectedComponents) {
        assert(mockKo.components.isRegistered(name), `Component "${name}" must be registered in Knockout`);
    }

    console.log(`  ✔ Dua Registration: All ${expectedComponents.length} components & aliases registered in ko`);

    // ==========================================
    // 6. Root Dua ViewModel & Subtab Switching
    // ==========================================
    const { DuaApp, DuasPageViewModel } = await import(path.join(ROOT, 'features', 'dua', 'dua.js'));
    assert(DuaApp, 'DuaApp export must be defined');

    const mockDuasStore = {
        allDuas: mockKo.observableArray([norm]),
        pins: mockKo.observableArray([0]),
        favourites: mockKo.observableArray([0]),
        currentIndex: mockKo.observable(0)
    };
    globalThis.DuasStore = mockDuasStore;

    const rootVm = new DuasPageViewModel();
    assert.strictEqual(rootVm.currentSubTab(), 'home');
    rootVm.switchTab('duas');
    assert.strictEqual(rootVm.currentSubTab(), 'duas');
    rootVm.switchTab('favs');
    assert.strictEqual(rootVm.currentSubTab(), 'favs');

    // Open detail
    rootVm.openDetail(norm, 0);
    assert.strictEqual(rootVm.currentSubTab(), 'detail');
    assert.strictEqual(rootVm.currentIndex(), 0);

    // Go back returns to previous tab
    rootVm.goBack();
    assert.strictEqual(rootVm.currentSubTab(), 'favs');

    console.log('  ✔ Dua Root: Subtab navigation, detail reader, and ViewModel bridge verified');

    // ==========================================
    // 7. API Data Fetching, Loading State & Chain Verification
    // ==========================================
    const mockApiResponse = [
        {
            number: 1,
            surah_name: 'అల్-బఖరా',
            ayat_number: '2:201',
            telugu_uchcharana: 'రబ్బనా ఆతినా ఫిద్-దున్యా...',
            telugu_ardham: 'మా ప్రభువా! మాకు ఈ లోకంలోనూ...'
        },
        {
            number: 2,
            surah_name: 'ఆలి-ఇమ్రాన్',
            ayat_number: '3:8',
            telugu_uchcharana: 'రబ్బనా లా తుజిగ్ ఖులూబనా...',
            telugu_ardham: 'మా ప్రభువా! మాకు మార్గదర్శకత్వం లభించాక...'
        }
    ];

    // Mock fetch for successful API request
    globalThis.fetch = async (url) => {
        assert(url.includes('duas.json'), 'Fetch must request duas.json endpoint');
        return {
            ok: true,
            status: 200,
            json: async () => mockApiResponse
        };
    };

    // Test DuaService.fetchDuas with forceRefresh
    const fetchedData = await DuaService.fetchDuas(true);
    assert.strictEqual(fetchedData.length, 2, 'Must return normalized duas from API');
    assert.strictEqual(fetchedData[0].surah, 'అల్-బఖరా (2:201)');
    assert.strictEqual(fetchedData[0].uchcharana, 'రబ్బనా ఆతినా ఫిద్-దున్యా...');

    // Test DuasPageViewModel.fetchDuas() loading state and data update
    const testPageVm = new DuasPageViewModel();
    assert.strictEqual(typeof testPageVm.fetchDuas, 'function');
    assert.strictEqual(typeof testPageVm.isLoading, 'function');
    assert.strictEqual(typeof testPageVm.loadError, 'function');

    await testPageVm.fetchDuas(true);
    assert.strictEqual(testPageVm.isLoading(), false, 'isLoading must be false after completion');
    assert.strictEqual(testPageVm.loadError(), null, 'loadError must be null on success');
    assert.strictEqual(testPageVm.allDuas().length, 2, 'allDuas must be updated with API records');

    // Test chain to DuaAllPageViewModel & DuaAllFeedViewModel
    const testAllPageVm = new DuaAllPageViewModel(testPageVm.allPageParams);
    assert.strictEqual(testAllPageVm.allDuas().length, 2, 'All page receives allDuas from root params');
    assert.strictEqual(testAllPageVm.filteredDuas().length, 2, 'Filtered duas computed from allDuas');

    const testFeedVm = new DuaAllFeedViewModel({
        duas: testAllPageVm.filteredDuas,
        isLoading: testPageVm.isLoading,
        loadError: testPageVm.loadError
    });
    assert.strictEqual(typeof testFeedVm.hasResults, 'function');
    assert.strictEqual(testFeedVm.hasResults(), true, 'hasResults must be true when items exist');

    // Verify subtab containers do not have static d-none blocking Knockout visible
    const duaHtml = fs.readFileSync(path.join(ROOT, 'features', 'dua', 'dua.html'), 'utf8');
    const mainHtml = fs.readFileSync(path.join(ROOT, 'main.html'), 'utf8');
    assert(!duaHtml.includes('id="duaSubAll" class="d-none"'), 'duaSubAll in dua.html must not have static d-none');
    assert(!mainHtml.includes('id="duaSubAll" class="d-none"'), 'duaSubAll in main.html must not have static d-none');

    // Test error state and fallback handling
    globalThis.fetch = async () => {
        throw new Error('Network error: failed to connect');
    };
    saveDuasToStorage([norm]); // seed localStorage with fallback

    await testPageVm.fetchDuas(true);
    assert.strictEqual(testPageVm.isLoading(), false, 'isLoading must be false after error');
    assert.strictEqual(testPageVm.loadError(), 'Network error: failed to connect', 'loadError must capture failure message');
    assert.strictEqual(testPageVm.allDuas().length, 1, 'allDuas must fall back to localStorage on API failure');

    console.log('  ✔ Dua API Flow: API request, response handling, loading states, and error fallback verified');
}
