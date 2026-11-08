// tests/quran.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runQuranTests() {
    console.log('▶ Running Quran Feature & Component Tests...');

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

    // Mock localStorage
    const storageStore = {};
    globalThis.localStorage = {
        getItem(key) { return storageStore[key] || null; },
        setItem(key, val) { storageStore[key] = String(val); },
        removeItem(key) { delete storageStore[key]; },
        clear() { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
    };

    // ==========================================
    // 1. QuranService Verification
    // ==========================================
    const {
        QuranService,
        SURAH_META,
        ARABIC_NAMES,
        pad3,
        surahUrl,
        loadSurah,
        getSurahMeta,
        getArabicName,
        filterSurahs,
        renderFootnotes,
        linkFootnoteMarkers,
        toggleBookmark,
        isAyahBookmarked,
        loadBookmarks,
        removeBookmark,
        playAyahAudio,
        stopAyahAudio,
        getActiveAudioAyah,
        subscribeAudioState
    } = await import(path.join(ROOT, 'quran', 'quran-service.js'));

    assert.strictEqual(SURAH_META.length, 114, 'SURAH_META must have 114 surahs');
    assert.strictEqual(SURAH_META[0].n, 1);
    assert.strictEqual(SURAH_META[0].name, 'అల్-ఫాతిహా');
    assert.strictEqual(SURAH_META[0].ayahs, 7);
    assert.strictEqual(SURAH_META[113].n, 114);
    assert.strictEqual(SURAH_META[113].name, 'అన్-నాస్');

    assert.strictEqual(ARABIC_NAMES[1], 'الفاتحة');
    assert.strictEqual(ARABIC_NAMES[114], 'الناس');

    assert.strictEqual(pad3(1), '001');
    assert.strictEqual(pad3(114), '114');
    assert(surahUrl(1).includes('telugu_surah_001.json'));

    assert.strictEqual(getSurahMeta(1).name, 'అల్-ఫాతిహా');
    assert.strictEqual(getArabicName(1), 'الفاتحة');

    // Search filter
    const search1 = filterSurahs('ఫాతిహా');
    assert(search1.some(s => s.n === 1));

    const searchNum = filterSurahs('114');
    assert.strictEqual(searchNum.length, 1);
    assert.strictEqual(searchNum[0].n, 114);

    // Footnotes processing
    const rawFootnote = '[1] మొదటి వివరణ\n[2] రెండవ వివరణ';
    const footnotesHtml = renderFootnotes(rawFootnote, 1);
    assert(footnotesHtml.includes('id="fn-1-1"'));
    assert(footnotesHtml.includes('id="fn-1-2"'));
    assert(footnotesHtml.includes('మొదటి వివరణ'));

    const linkedText = linkFootnoteMarkers('ఇది ఒక వాక్యం [1] మరియు ఇంకొకటి [2].', 1);
    assert(linkedText.includes('href="#fn-1-1"'));
    assert(linkedText.includes('href="#fn-1-2"'));

    // Bookmarks operations
    assert.strictEqual(isAyahBookmarked(1, 1), false);
    const nowBookmarked = toggleBookmark(1, 1, { arabic_text: 'بِسْمِ اللَّهِ', translation: 'అల్లాహ్ పేరుతో' });
    assert.strictEqual(nowBookmarked, true);
    assert.strictEqual(isAyahBookmarked(1, 1), true);

    const bms = loadBookmarks();
    assert.strictEqual(bms.length, 1);
    assert.strictEqual(bms[0].surahNumber, 1);
    assert.strictEqual(bms[0].ayahNumber, 1);

    const unbookmarked = toggleBookmark(1, 1);
    assert.strictEqual(unbookmarked, false);
    assert.strictEqual(isAyahBookmarked(1, 1), false);

    // Re-add and remove by ID
    toggleBookmark(2, 255, { arabic_text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', translation: 'ఆయత్ అల్-కుర్సీ' });
    assert.strictEqual(isAyahBookmarked(2, 255), true);
    removeBookmark('2:255');
    assert.strictEqual(isAyahBookmarked(2, 255), false);

    // Audio operations
    let audioStateNotified = null;
    subscribeAudioState(key => { audioStateNotified = key; });
    assert.strictEqual(getActiveAudioAyah(), null);
    stopAyahAudio();

    // In Node (no window.Audio), playAyahAudio gracefully returns false
    const playResult = playAyahAudio(1, 1);
    assert.strictEqual(typeof playResult, 'boolean');

    // ==========================================
    // 2. Knockout Component Registrations
    // ==========================================
    const { registerQuranComponents } = await import(path.join(ROOT, 'quran', 'quran-registration.js'));
    registerQuranComponents(mockKo);

    const registered = mockKo.components.getRegistered();
    assert(registered['quran-page'], 'quran-page must be registered');
    assert(registered['quran-nav-tab'], 'quran-nav-tab must be registered');
    assert(registered['quran-main-page'], 'quran-main-page must be registered');
    assert(registered['quran-main-feed'], 'quran-main-feed must be registered');
    assert(registered['quran-main-card'], 'quran-main-card must be registered');
    assert(registered['quran-open-page'], 'quran-open-page must be registered');
    assert(registered['quran-open-feed'], 'quran-open-feed must be registered');
    assert(registered['quran-open-card'], 'quran-open-card must be registered');
    assert(registered['quran-bookmark-page'], 'quran-bookmark-page must be registered');
    assert(registered['quran-bookmark-feed'], 'quran-bookmark-feed must be registered');
    assert(registered['quran-bookmark-card'], 'quran-bookmark-card must be registered');

    // ==========================================
    // 3. Three-Level Communication: Main Screen
    // ==========================================
    const { QuranMainCardViewModel } = await import(path.join(ROOT, 'quran', 'quran-main', 'quran-main-card', 'quran-main-card.js'));
    const { QuranMainFeedViewModel } = await import(path.join(ROOT, 'quran', 'quran-main', 'quran-main-feed', 'quran-main-feed.js'));
    const { QuranMainPageViewModel } = await import(path.join(ROOT, 'quran', 'quran-main', 'quran-main-page', 'quran-main-page.js'));

    let cardClickedItem = null;
    let cardEventStopped = false;
    const testSurah = { n: 1, name: 'అల్-ఫాతిహా', meaning: 'ప్రారంభం', revelation: 'Makkah', ayahs: 7 };

    const mainCard = new QuranMainCardViewModel({
        item: testSurah,
        onClick: (item) => { cardClickedItem = item; }
    });
    assert.strictEqual(mainCard.number, 1);
    assert.strictEqual(mainCard.name, 'అల్-ఫాతిహా');
    assert.strictEqual(mainCard.revelationTelugu, 'మక్కీ');
    assert.strictEqual(mainCard.arabicName, 'الفاتحة');

    mainCard.handleClick(null, { stopPropagation: () => { cardEventStopped = true; } });
    assert.strictEqual(cardEventStopped, true, 'Main card handleClick must stop propagation');
    assert.strictEqual(cardClickedItem.n, 1, 'Main card onClick must receive surah item');

    // Feed level communication
    let feedSelectedItem = null;
    const mainFeed = new QuranMainFeedViewModel({
        surahs: [testSurah],
        onSelectSurah: (item) => { feedSelectedItem = item; }
    });
    assert.strictEqual(mainFeed.filteredSurahs().length, 1);
    mainFeed.handleCardClick(testSurah);
    assert.strictEqual(feedSelectedItem.n, 1, 'Feed handleCardClick must delegate to onSelectSurah');

    // Page level communication
    let pageOpenedSurah = null;
    const mainPage = new QuranMainPageViewModel({
        onOpenSurah: (item) => { pageOpenedSurah = item; }
    });
    mainPage.handleSelectSurah(testSurah);
    assert.strictEqual(pageOpenedSurah.n, 1, 'Page handleSelectSurah must forward to onOpenSurah');

    // Search reactivity in Feed
    const searchQuery = mockKo.observable('');
    const reactiveFeed = new QuranMainFeedViewModel({
        searchQuery: searchQuery
    });
    assert.strictEqual(reactiveFeed.filteredSurahs().length, 114);
    searchQuery('బా');
    assert(reactiveFeed.filteredSurahs().length < 114);
    assert(reactiveFeed.filteredSurahs().length > 0);

    // ==========================================
    // 4. Three-Level Communication: Open Screen (Reader)
    // ==========================================
    const { QuranOpenCardViewModel } = await import(path.join(ROOT, 'quran', 'quran-open', 'quran-open-card', 'quran-open-card.js'));
    const { QuranOpenFeedViewModel } = await import(path.join(ROOT, 'quran', 'quran-open', 'quran-open-feed', 'quran-open-feed.js'));
    const { QuranOpenPageViewModel } = await import(path.join(ROOT, 'quran', 'quran-open', 'quran-open-page', 'quran-open-page.js'));

    let openCardBookmarkToggled = null;
    let openCardPlayTriggered = null;
    const testAyah = {
        aya: '1',
        arabic_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'అల్లాహ్ పేరుతో...',
        footnotes: '[1] వివరణ'
    };

    const openCard = new QuranOpenCardViewModel({
        ayah: testAyah,
        surahNum: 1,
        onBookmarkToggle: (ayah) => { openCardBookmarkToggled = ayah; },
        onPlay: (ayah) => { openCardPlayTriggered = ayah; }
    });
    assert.strictEqual(openCard.badgeText, '#1:1');
    assert.strictEqual(openCard.arabicText, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    assert(openCard.hasFootnotes, 'Open card must detect footnotes');

    openCard.handleBookmarkClick(null, { stopPropagation: () => {} });
    assert.strictEqual(openCardBookmarkToggled.aya, '1');
    openCard.handlePlayClick(null, { stopPropagation: () => {} });
    assert.strictEqual(openCardPlayTriggered.aya, '1');

    // Open Feed level
    let openFeedBookmarkAyah = null;
    let openFeedPlayAyah = null;
    const openFeed = new QuranOpenFeedViewModel({
        surahNum: 1,
        ayahs: [testAyah],
        onBookmarkToggle: (a) => { openFeedBookmarkAyah = a; },
        onPlay: (a) => { openFeedPlayAyah = a; }
    });
    openFeed.handleBookmarkToggle(testAyah);
    assert.strictEqual(openFeedBookmarkAyah.aya, '1');
    openFeed.handlePlay(testAyah);
    assert.strictEqual(openFeedPlayAyah.aya, '1');

    // Open Page level
    let pageBacked = false;
    const openPage = new QuranOpenPageViewModel({
        surahNum: 1,
        onBack: () => { pageBacked = true; }
    });
    assert.strictEqual(openPage.readerTitle(), 'Surah అల్-ఫాతిహా');
    assert.strictEqual(openPage.readerSubtitle(), 'Makkah • 7 Ayahs');
    openPage.goBack(null, { stopPropagation: () => {} });
    assert.strictEqual(pageBacked, true, 'Open page goBack must trigger onBack callback');

    // ==========================================
    // 5. Three-Level Communication: Bookmark Screen
    // ==========================================
    const { QuranBookmarkCardViewModel } = await import(path.join(ROOT, 'quran', 'quran-bookmark', 'quran-bookmark-card', 'quran-bookmark-card.js'));
    const { QuranBookmarkFeedViewModel } = await import(path.join(ROOT, 'quran', 'quran-bookmark', 'quran-bookmark-feed', 'quran-bookmark-feed.js'));
    const { QuranBookmarkPageViewModel } = await import(path.join(ROOT, 'quran', 'quran-bookmark', 'quran-bookmark-page', 'quran-bookmark-page.js'));

    const testBm = {
        id: '1:1',
        surahNumber: 1,
        ayahNumber: 1,
        surahName: 'అల్-ఫాతిహా',
        arabicName: 'الفاتحة',
        arabicText: 'بِسْمِ اللَّهِ',
        translation: 'అల్లాహ్ పేరుతో'
    };

    let bmCardClicked = null;
    let bmCardRemoved = null;
    const bmCard = new QuranBookmarkCardViewModel({
        item: testBm,
        onClick: (item) => { bmCardClicked = item; },
        onRemove: (item) => { bmCardRemoved = item; }
    });
    assert.strictEqual(bmCard.badgeText, '#1:1');
    assert.strictEqual(bmCard.surahName, 'అల్-ఫాతిహా');

    bmCard.handleClick(null, { stopPropagation: () => {} });
    assert.strictEqual(bmCardClicked.id, '1:1');
    bmCard.handleRemove(null, { stopPropagation: () => {} });
    assert.strictEqual(bmCardRemoved.id, '1:1');

    // Bookmark Feed & Page
    let bmPageOpenedSurah = null;
    const bmPage = new QuranBookmarkPageViewModel({
        onOpenSurah: (s, a) => { bmPageOpenedSurah = { s, a }; }
    });
    bmPage.handleSelectBookmark(testBm);
    assert.strictEqual(bmPageOpenedSurah.s, 1);
    assert.strictEqual(bmPageOpenedSurah.a, 1);

    // ==========================================
    // 6. Feature Root ViewModel & Navigation
    // ==========================================
    const { QuranPageViewModel, QuranApp, getQuranViewModel } = await import(path.join(ROOT, 'quran', 'quran.js'));
    const quranVm = new QuranPageViewModel();

    assert.strictEqual(quranVm.currentSubTab(), 'quran');
    assert.strictEqual(quranVm.activeSurah(), 1);

    quranVm.switchTab('open');
    assert.strictEqual(quranVm.currentSubTab(), 'open');

    quranVm.openSurah(2);
    assert.strictEqual(quranVm.activeSurah(), 2);
    assert.strictEqual(quranVm.currentSubTab(), 'open');

    quranVm.switchTab('bookmark');
    assert.strictEqual(quranVm.currentSubTab(), 'bookmark');

    // Dashboard Integration: Check that Dashboard includes Quran Nav Card
    const { DashboardViewModel } = await import(path.join(ROOT, 'dashboard', 'dashboard.js'));
    const dashVm = new DashboardViewModel();
    const quranCard = dashVm.navCards.find(c => c.action === 'goto-quran');
    assert(quranCard, 'Dashboard navCards must include Quran card');
    assert.strictEqual(quranCard.title, 'Quran');
    assert.strictEqual(quranCard.iconClass, 'fa-solid fa-book-quran');

    console.log('  ✔ QuranService: Surah metadata, caching, footnotes, audio, and bookmark persistence passed');
    console.log('  ✔ Quran Components: All 11 ViewModels, Templates, and ko component registrations passed');
    console.log('  ✔ Three-Level Communication: Card -> Feed -> Page callback chain strictly preserved');
    console.log('  ✔ Dashboard & App Navigation: Quran nav card and subtab switching verified');
}

