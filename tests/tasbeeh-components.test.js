// tests/tasbeeh-components.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runTasbeehComponentTests() {
    console.log('▶ Running Knockout.js Modular Tasbeeh Component Tests...');

    // Minimal Mock for Knockout
    const registeredComponents = {};
    globalThis.ko = {
        observable(init) {
            let v = init;
            const subs = [];
            const fn = function(newVal) {
                if (arguments.length > 0) {
                    if (v !== newVal) {
                        v = newVal;
                        subs.forEach(s => s(v));
                    }
                    return fn;
                }
                return v;
            };
            fn.subscribe = function(cb) { subs.push(cb); return { dispose() {} }; };
            fn.__ko_proto__ = fn;
            return fn;
        },
        observableArray(init) {
            const obs = globalThis.ko.observable(init ? [...init] : []);
            obs.push = function(...args) {
                const arr = obs();
                arr.push(...args);
                obs(arr);
            };
            return obs;
        },
        pureComputed(readOrOpts) {
            const read = typeof readOrOpts === 'function' ? readOrOpts : (readOrOpts && readOrOpts.read);
            const write = (readOrOpts && typeof readOrOpts.write === 'function') ? readOrOpts.write : function() {};
            const fn = function(val) {
                if (arguments.length > 0) {
                    write(val);
                    return fn;
                }
                return read ? read() : undefined;
            };
            fn.__ko_proto__ = fn;
            fn.subscribe = function() { return { dispose() {} }; };
            return fn;
        },
        computed(read) { return globalThis.ko.pureComputed(read); },
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

    // Import Modular Tasbeeh Components
    const {
        // Current
        CurrentCardTemplate, CurrentCardViewModel,
        CurrentFeedTemplate, CurrentFeedViewModel,
        CurrentFormTemplate, CurrentFormViewModel,
        CurrentPageTemplate, CurrentPageViewModel,

        // Old
        OldCardTemplate, OldCardViewModel,
        OldFeedTemplate, OldFeedViewModel,
        OldFormTemplate, OldFormViewModel,
        OldPageTemplate, OldPageViewModel,

        // History
        HistoryCardTemplate, HistoryCardViewModel,
        HistoryFeedTemplate, HistoryFeedViewModel,
        HistoryFormTemplate, HistoryFormViewModel,
        HistoryPageTemplate, HistoryPageViewModel,

        // Centralized Service
        TasbeehService
    } = await import(path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh.js'));

    // ==========================================
    // 1. Current Components Verification
    // ==========================================

    // 1.1 CurrentCard
    assert(CurrentCardTemplate && CurrentCardTemplate.element === 'tasbeeh-current-card-template');
    assert.strictEqual(CurrentCardTemplate.file, 'features/tasbeeh/tasbeeh-current/tasbeeh-current-card/tasbeeh-current-card.html');

    let cardClicked = false;
    let editClicked = false;
    const testDhikr = {
        id: 'cur-1',
        title: 'Astaghfirullah',
        targetCount: 100,
        completedDays: 15,
        totalDays: 30,
        isComplete: true,
        isTodayDone: true
    };
    const currentCard = new CurrentCardViewModel({
        item: testDhikr,
        onCardClick: (item) => { cardClicked = (item.id === 'cur-1'); },
        onEditClick: (item) => { editClicked = (item.id === 'cur-1'); }
    });
    assert.strictEqual(currentCard.id, 'cur-1');
    assert.strictEqual(currentCard.title, 'Astaghfirullah');
    assert.strictEqual(currentCard.targetDisplay, 100);
    assert.strictEqual(currentCard.totalDaysText, '30 days');
    assert.strictEqual(currentCard.isComplete, true);
    assert.strictEqual(currentCard.isTodayDone, true);
    currentCard.onCardClick();
    assert.strictEqual(cardClicked, true, 'CurrentCard onCardClick must trigger onCardClick callback');
    currentCard.onEditClick();
    assert.strictEqual(editClicked, true, 'CurrentCard onEditClick must trigger onEditClick callback');

    // 1.1.b Three-Level Pattern & Event Propagation on CurrentCard
    let stoppedEvent = false;
    let cardOnClickItem = null;
    const testEvent = { stopPropagation: () => { stoppedEvent = true; } };
    const decoupledCurrentCard = new CurrentCardViewModel({
        item: testDhikr,
        onClick: (item) => { cardOnClickItem = item; }
    });
    decoupledCurrentCard.handleClick(null, testEvent);
    assert.strictEqual(stoppedEvent, true, 'CurrentCard handleClick must stop event propagation');
    assert.strictEqual(cardOnClickItem && cardOnClickItem.id, 'cur-1', 'CurrentCard handleClick must forward item to onClick');

    // Safe execution without callbacks (no window/root dependency)
    const bareCurrentCard = new CurrentCardViewModel({ item: testDhikr });
    assert.doesNotThrow(() => bareCurrentCard.handleClick(), 'Card must not throw when no callback is provided');

    // 1.2 CurrentFeed
    assert(CurrentFeedTemplate && CurrentFeedTemplate.element === 'tasbeeh-current-feed-template');
    assert.strictEqual(CurrentFeedTemplate.file, 'features/tasbeeh/tasbeeh-current/tasbeeh-current-feed/tasbeeh-current-feed.html');

    let feedCardClicked = false;
    let feedEditClicked = false;
    let feedAdvanceClicked = false;
    let feedTabSwitched = null;
    const parentTodo = globalThis.ko.observableArray([testDhikr]);
    const parentDone = globalThis.ko.observableArray([]);
    const parentActiveTab = globalThis.ko.observable('todo');

    const currentFeed = new CurrentFeedViewModel({
        items: [testDhikr],
        activeTab: parentActiveTab,
        todoItems: parentTodo,
        doneItems: parentDone,
        onTabSwitch: (t) => { feedTabSwitched = t; },
        onCardClick: (it) => { feedCardClicked = (it.id === 'cur-1'); },
        onEditClick: (it) => { feedEditClicked = (it.id === 'cur-1'); },
        onAdvanceMonth: () => { feedAdvanceClicked = true; }
    });
    assert.strictEqual(currentFeed.activeTab(), 'todo');
    assert.strictEqual(currentFeed.isEmpty(), false);
    assert.strictEqual(currentFeed.todoItems().length, 1);
    assert.strictEqual(currentFeed.doneItems().length, 0);

    currentFeed.switchTab('completed');
    assert.strictEqual(currentFeed.activeTab(), 'completed');
    assert.strictEqual(feedTabSwitched, 'completed');

    parentTodo([]);
    parentDone([{ id: 'cur-1', title: 'Astaghfirullah', isComplete: true }]);
    assert.strictEqual(currentFeed.todoItems().length, 0);
    assert.strictEqual(currentFeed.doneItems().length, 1);
    assert.strictEqual(currentFeed.doneItems()[0].id, 'cur-1');

    currentFeed.handleCardClick(testDhikr);
    assert.strictEqual(feedCardClicked, true);
    currentFeed.handleEditClick(testDhikr);
    assert.strictEqual(feedEditClicked, true);
    currentFeed.onAdvanceMonth();
    assert.strictEqual(feedAdvanceClicked, true);

    // 1.3 CurrentForm
    assert(CurrentFormTemplate && CurrentFormTemplate.element === 'tasbeeh-current-form-template');
    assert.strictEqual(CurrentFormTemplate.file, 'features/tasbeeh/tasbeeh-current/tasbeeh-current-form/tasbeeh-current-form.html');

    let formSavedData = null;
    let formDeletedId = null;
    let formClosed = false;
    const formIsOpen = globalThis.ko.observable(true);
    const formItem = globalThis.ko.observable(null); // Add mode

    const currentForm = new CurrentFormViewModel({
        isOpen: formIsOpen,
        item: formItem,
        onSave: (payload) => { formSavedData = payload; },
        onDelete: (id) => { formDeletedId = id; },
        onClose: () => { formClosed = true; }
    });
    assert.strictEqual(currentForm.isEditMode(), false, 'Null item must mean Add mode');
    assert.strictEqual(currentForm.targetCount(), 33, 'Default targetCount is 33');

    // Preset chip selection
    currentForm.selectChip(99);
    assert.strictEqual(currentForm.targetCount(), 99);
    assert.strictEqual(currentForm.isInfinite(), false);
    currentForm.selectChip('infinite');
    assert.strictEqual(currentForm.isInfinite(), true);

    // Save with title
    currentForm.title('SubhanAllah');
    currentForm.save();
    assert(formSavedData !== null, 'Form submit must produce saved payload');
    assert.strictEqual(formSavedData.title, 'SubhanAllah');
    assert.strictEqual(formSavedData.targetCount, 'infinite');

    // Edit mode
    formItem({ id: 'edit-1', title: 'Alhamdulillah', targetCount: 33 });
    assert.strictEqual(currentForm.isEditMode(), true, 'Observable item must reflect edit mode');
    assert.strictEqual(currentForm.title(), 'Alhamdulillah');
    assert.strictEqual(currentForm.targetCount(), 33);
    currentForm.close();
    assert.strictEqual(formClosed, true, 'close must invoke onClose callback');

    // 1.4 CurrentPage
    assert(CurrentPageTemplate && CurrentPageTemplate.element === 'tasbeeh-current-page-template');
    assert.strictEqual(CurrentPageTemplate.file, 'features/tasbeeh/tasbeeh-current/tasbeeh-current-page/tasbeeh-current-page.html');

    let pageBackPressed = false;
    const currentPage = new CurrentPageViewModel({
        item: testDhikr,
        onBack: () => { pageBackPressed = true; }
    });
    assert.strictEqual(currentPage.itemTitle(), 'Astaghfirullah');
    assert.strictEqual(currentPage.targetLabel(), 'Target: 100 / day');
    assert(Array.isArray(currentPage.calendarCells()), 'calendarCells must be an array');
    currentPage.onBack();
    assert.strictEqual(pageBackPressed, true, 'onBack must trigger callback');

    // Robustness against null monthKey / observable(null)
    const nullMonthObservable = ko.observable(null);
    const pageWithNullObs = new CurrentPageViewModel({
        item: testDhikr,
        monthKey: nullMonthObservable
    });
    assert(pageWithNullObs.monthKey() && pageWithNullObs.monthKey().includes('-'), 'Must fall back when observable holds null');
    assert.doesNotThrow(() => pageWithNullObs.buildCalendar(), 'buildCalendar must not throw on null monthKey');

    const pageWithNullParam = new CurrentPageViewModel({
        item: testDhikr,
        monthKey: null
    });
    assert(pageWithNullParam.monthKey() && pageWithNullParam.monthKey().includes('-'), 'Must fall back when param is null');
    assert.doesNotThrow(() => pageWithNullParam.buildCalendar(), 'buildCalendar must not throw on null param');

    // ==========================================
    // 2. Old Components Verification
    // ==========================================

    // 2.1 OldCard
    assert(OldCardTemplate && OldCardTemplate.element === 'tasbeeh-old-card-template');
    assert.strictEqual(OldCardTemplate.file, 'features/tasbeeh/tasbeeh-old/tasbeeh-old-card/tasbeeh-old-card.html');

    let oldCardClicked = false;
    let oldEditClicked = false;
    const oldDhikr = { id: 'old-1', title: 'Allahu Akbar', targetCount: 33, completedDays: 30, totalDays: 30, isComplete: true };
    const oldCard = new OldCardViewModel({
        item: oldDhikr,
        month: '2026-09',
        onCardClick: (it, m) => { oldCardClicked = (it.id === 'old-1' && m === '2026-09'); },
        onEditClick: (it) => { oldEditClicked = (it.id === 'old-1'); }
    });
    assert.strictEqual(oldCard.id, 'old-1');
    assert.strictEqual(oldCard.title, 'Allahu Akbar');
    assert.strictEqual(oldCard.month, '2026-09');
    oldCard.onCardClick();
    assert.strictEqual(oldCardClicked, true);
    oldCard.onEditClick();
    assert.strictEqual(oldEditClicked, true);

    // 2.1.b OldCard Three-Level Pattern & Event Propagation
    let oldStopped = false;
    let oldOnClickItem = null;
    let oldOnClickMonth = null;
    const decoupledOldCard = new OldCardViewModel({
        item: oldDhikr,
        month: '2026-09',
        onClick: (item, m) => { oldOnClickItem = item; oldOnClickMonth = m; }
    });
    decoupledOldCard.handleClick(null, { stopPropagation: () => { oldStopped = true; } });
    assert.strictEqual(oldStopped, true, 'OldCard handleClick must stop propagation');
    assert.strictEqual(oldOnClickItem && oldOnClickItem.id, 'old-1');
    assert.strictEqual(oldOnClickMonth, '2026-09');

    const bareOldCard = new OldCardViewModel({ item: oldDhikr });
    assert.doesNotThrow(() => bareOldCard.handleClick(), 'OldCard must not throw without callback');

    // 2.2 OldFeed
    assert(OldFeedTemplate && OldFeedTemplate.element === 'tasbeeh-old-feed-template');
    assert.strictEqual(OldFeedTemplate.file, 'features/tasbeeh/tasbeeh-old/tasbeeh-old-feed/tasbeeh-old-feed.html');

    let reopenLastCalled = false;
    let resetCompletedCalled = false;
    const oldFeed = new OldFeedViewModel({
        onReopenLastMonth: () => { reopenLastCalled = true; },
        onResetCompleted: () => { resetCompletedCalled = true; }
    });
    assert.strictEqual(oldFeed.activeTab(), 'todo');
    oldFeed.onReopenLastMonth();
    assert.strictEqual(reopenLastCalled, true);
    oldFeed.onResetCompleted();
    assert.strictEqual(resetCompletedCalled, true);

    // 2.3 OldForm
    assert(OldFormTemplate && OldFormTemplate.element === 'tasbeeh-old-form-template');
    assert.strictEqual(OldFormTemplate.file, 'features/tasbeeh/tasbeeh-old/tasbeeh-old-form/tasbeeh-old-form.html');

    let oldFormSaved = null;
    const oldForm = new OldFormViewModel({
        isOpen: globalThis.ko.observable(true),
        item: null,
        onSave: (payload) => { oldFormSaved = payload; }
    });
    oldForm.title('La ilaha illallah');
    oldForm.selectChip(100);
    oldForm.save();
    assert.strictEqual(oldFormSaved.title, 'La ilaha illallah');
    assert.strictEqual(oldFormSaved.targetCount, 100);

    // 2.4 OldPage
    assert(OldPageTemplate && OldPageTemplate.element === 'tasbeeh-old-page-template');
    assert.strictEqual(OldPageTemplate.file, 'features/tasbeeh/tasbeeh-old/tasbeeh-old-page/tasbeeh-old-page.html');

    let oldPageBackPressed = false;
    const oldPage = new OldPageViewModel({
        item: oldDhikr,
        monthKey: '2026-09',
        onBack: () => { oldPageBackPressed = true; }
    });
    assert.strictEqual(oldPage.itemTitle(), 'Allahu Akbar');
    assert.strictEqual(oldPage.monthKey(), '2026-09');
    oldPage.onBack();
    assert.strictEqual(oldPageBackPressed, true);

    // ==========================================
    // 3. History Components Verification
    // ==========================================

    // 3.1 HistoryCard
    assert(HistoryCardTemplate && HistoryCardTemplate.element === 'tasbeeh-history-card-template');
    assert.strictEqual(HistoryCardTemplate.file, 'features/tasbeeh/tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.html');

    let historyReopenedMonth = null;
    const testHistoryMonth = {
        monthKey: '2026-09',
        monthLabel: 'September 2026',
        status: 'completed',
        canReopen: true,
        onReopen: (mKey) => { historyReopenedMonth = mKey; }
    };
    const historyCard = new HistoryCardViewModel(testHistoryMonth);
    assert.strictEqual(historyCard.monthKey, '2026-09');
    assert.strictEqual(historyCard.monthLabel, 'September 2026');
    assert.strictEqual(historyCard.badgeText, 'Completed');
    historyCard.onReopen();
    assert.strictEqual(historyReopenedMonth, '2026-09');

    // 3.1.b HistoryCard Standard Three-Level Params ({ item, onClick }) & Propagation
    let histStopped = false;
    let histClickedMonth = null;
    const standardHistoryCard = new HistoryCardViewModel({
        item: {
            monthKey: '2026-08',
            monthLabel: 'August 2026',
            status: 'completed',
            canReopen: true
        },
        onClick: (mKey) => { histClickedMonth = mKey; }
    });
    assert.strictEqual(standardHistoryCard.monthKey, '2026-08');
    assert.strictEqual(standardHistoryCard.monthLabel, 'August 2026');
    standardHistoryCard.handleClick(null, { stopPropagation: () => { histStopped = true; } });
    assert.strictEqual(histStopped, true, 'HistoryCard handleClick must stop propagation');
    assert.strictEqual(histClickedMonth, '2026-08', 'HistoryCard handleClick must invoke onClick callback');

    const bareHistCard = new HistoryCardViewModel({ item: { monthKey: '2026-07' } });
    assert.doesNotThrow(() => bareHistCard.handleClick(), 'HistoryCard must not throw without callback');

    // 3.2 HistoryFeed
    assert(HistoryFeedTemplate && HistoryFeedTemplate.element === 'tasbeeh-history-feed-template');
    assert.strictEqual(HistoryFeedTemplate.file, 'features/tasbeeh/tasbeeh-history/tasbeeh-history-feed/tasbeeh-history-feed.html');

    let feedReopenMonth = null;
    let feedResetCompleted = false;
    const historyFeed = new HistoryFeedViewModel({
        onReopenMonth: (mKey) => { feedReopenMonth = mKey; },
        onResetCompleted: () => { feedResetCompleted = true; }
    });
    assert(Array.isArray(historyFeed.months()), 'months must be an array');
    historyFeed.handleReopen('2026-08');
    assert.strictEqual(feedReopenMonth, '2026-08');
    historyFeed.onResetCompleted();
    assert.strictEqual(feedResetCompleted, true);

    // 3.3 HistoryForm
    assert(HistoryFormTemplate && HistoryFormTemplate.element === 'tasbeeh-history-form-template');
    assert.strictEqual(HistoryFormTemplate.file, 'features/tasbeeh/tasbeeh-history/tasbeeh-history-form/tasbeeh-history-form.html');

    let savedStart = null;
    let savedEnd = null;
    const historyForm = new HistoryFormViewModel({
        startDate: globalThis.ko.observable('2026-01-01'),
        endDate: globalThis.ko.observable('2026-10-01'),
        onSave: (s, e) => { savedStart = s; savedEnd = e; }
    });
    assert.strictEqual(historyForm.startDate(), '2026-01-01');
    assert.strictEqual(historyForm.endDate(), '2026-10-01');
    historyForm.applyPreset('this-year');
    assert(historyForm.startDate().includes('-01-01'), 'Preset this-year sets start to Jan 1');
    historyForm.save();
    assert(savedStart !== null && savedEnd !== null, 'Save triggers callback with start and end months');

    // 3.4 HistoryPage
    assert(HistoryPageTemplate && HistoryPageTemplate.element === 'tasbeeh-history-page-template');
    assert.strictEqual(HistoryPageTemplate.file, 'features/tasbeeh/tasbeeh-history/tasbeeh-history-page/tasbeeh-history-page.html');

    const historyPage = new HistoryPageViewModel({});
    assert(historyPage.progressStats && typeof historyPage.progressStats.percentCleared === 'function');
    assert(historyPage.formParams && typeof historyPage.formParams.onSave === 'function');
    assert(historyPage.feedParams && typeof historyPage.feedParams.onReopenMonth === 'function');

    // 3.5 Three-Level Knockout Hierarchy Verification (Main Page -> Feed -> Card)
    const { TasbeehPageViewModel } = await import(path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-view-model.js'));
    const mainPage = new TasbeehPageViewModel();
    assert.strictEqual(typeof mainPage.handleCurrentCardClick, 'function', 'Main Page must define handleCurrentCardClick');
    assert.strictEqual(typeof mainPage.handleOldCardClick, 'function', 'Main Page must define handleOldCardClick');
    assert.strictEqual(typeof mainPage.handleReopenMonth, 'function', 'Main Page must define handleReopenMonth');

    // Level 1 -> Level 2: Main Page passes params to Feed
    const level2Feed = new CurrentFeedViewModel(mainPage.currentFeedParams);
    assert.strictEqual(typeof level2Feed.onCardClick, 'function');

    // Level 2 -> Level 3: Feed forwards callback to Card
    const level3Card = new CurrentCardViewModel({
        item: testDhikr,
        onClick: level2Feed.onCardClick
    });

    // Level 3 User Click -> Card.handleClick() -> Feed forwards -> Main Page executes navigation
    assert.strictEqual(mainPage.isCalendarOpen(), false, 'Calendar initially closed');
    level3Card.handleClick();
    assert.strictEqual(mainPage.isCalendarOpen(), true, 'Card click must propagate up 3 levels to Main Page');
    assert.strictEqual(mainPage.activeCalendarItem().id, 'cur-1');

    // ==========================================
    // 4. Knockout Registration Verification (tasbeeh-registration.js)
    // ==========================================
    const {
        registerTasbeehComponents,
        TasbeehPageViewModel: TasbeehVmFromReg,
        getTasbeehViewModel: getTasbeehVmFromReg
    } = await import(path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-registration.js'));
    const {
        TasbeehPageViewModel: TasbeehVmDirect,
        getTasbeehViewModel: getTasbeehVmDirect
    } = await import(path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-view-model.js'));

    assert.strictEqual(TasbeehVmFromReg, TasbeehVmDirect, 'tasbeeh-registration.js should re-export TasbeehPageViewModel');
    assert.strictEqual(getTasbeehVmFromReg, getTasbeehVmDirect, 'tasbeeh-registration.js should re-export getTasbeehViewModel');

    registerTasbeehComponents(globalThis.ko);

    const expectedComponents = [
        'tasbeeh-header',
        'tasbeeh-counter-card',
        'tasbeeh-progress-circle',
        'tasbeeh-nav-tab',
        'tasbeeh-page',
        'tasbeeh-current-card',
        'tasbeeh-current-feed',
        'tasbeeh-current-form',
        'tasbeeh-current-page',
        'tasbeeh-old-card',
        'tasbeeh-old-feed',
        'tasbeeh-old-form',
        'tasbeeh-old-page',
        'tasbeeh-history-card',
        'tasbeeh-history-feed',
        'tasbeeh-history-form',
        'tasbeeh-history-page'
    ];

    for (const name of expectedComponents) {
        assert(globalThis.ko.components.isRegistered(name), `Component "${name}" must be registered in Knockout`);
        const reg = registeredComponents[name];
        assert(reg && reg.viewModel && reg.template, `Component "${name}" must have viewModel and template defined`);
    }

    // Verify subtab containers in tasbeeh.html and main.html do not have static d-none blocking Knockout visible
    const fs = await import('fs');
    const tasbeehHtml = fs.readFileSync(path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh.html'), 'utf8');
    const mainHtml = fs.readFileSync(path.join(ROOT, 'main.html'), 'utf8');
    assert(!tasbeehHtml.includes('id="tbOldBody" class="grow overflow-auto p-2 pb-5 relative d-none"'), 'tbOldBody in tasbeeh.html must not have static d-none');
    assert(!mainHtml.includes('id="tbOldBody" class="grow overflow-auto p-2 pb-5 relative d-none"'), 'tbOldBody in main.html must not have static d-none');
    assert(!tasbeehHtml.includes('id="tbHistoryBody" class="grow overflow-auto p-2 pb-5 relative d-none"'), 'tbHistoryBody in tasbeeh.html must not have static d-none');
    assert(!mainHtml.includes('id="tbHistoryBody" class="grow overflow-auto p-2 pb-5 relative d-none"'), 'tbHistoryBody in main.html must not have static d-none');

    // ==========================================
    // 5. Centralized TasbeehService Verification
    // ==========================================
    assert(TasbeehService, 'TasbeehService must be exported');
    assert.strictEqual(typeof TasbeehService.pad2, 'function');
    assert.strictEqual(typeof TasbeehService.classifyCurrentItems, 'function');
    assert.strictEqual(typeof TasbeehService.classifyOldItems, 'function');
    assert.strictEqual(typeof TasbeehService.buildCalendarCells, 'function');
    assert.strictEqual(typeof TasbeehService.calculateHistoryStats, 'function');
    assert.strictEqual(typeof TasbeehService.calculatePeriodPreset, 'function');
    assert.strictEqual(typeof TasbeehService.saveDhikrItem, 'function');
    assert.strictEqual(typeof TasbeehService.deleteDhikrItem, 'function');

    // 5.1 Utility formatting checks
    assert.strictEqual(TasbeehService.pad2(5), '05');
    assert.strictEqual(TasbeehService.pad2(12), '12');
    assert.strictEqual(TasbeehService.clamp(150, 1, 100), 100);
    assert.strictEqual(TasbeehService.clamp(-5, 1, 100), 1);
    assert.strictEqual(TasbeehService.getPrevMonthKey('2026-01'), '2025-12');
    assert.strictEqual(TasbeehService.getPrevMonthKey('2026-11'), '2026-10');
    assert.strictEqual(TasbeehService.getNextMonthKey('2026-12'), '2027-01');
    assert.strictEqual(TasbeehService.getNextMonthKey('2026-05'), '2026-06');
    assert.strictEqual(typeof globalThis.getPrevMonthKey, 'function');
    assert.strictEqual(globalThis.getPrevMonthKey('2026-03'), '2026-02');

    // 5.2 Month list generation
    const mList = TasbeehService.getPreviousMonthsList('2026-01', '2026-03');
    assert.deepStrictEqual(mList, ['2026-03', '2026-02', '2026-01']);

    // 5.3 Classification logic
    const classifiedCurrent = TasbeehService.classifyCurrentItems([
        { id: 't1', title: 'Test 1', targetCount: 33 },
        { id: 't2', title: 'Test 2', targetCount: 33 }
    ], { 't1': { '2026-11-01': true } }, '2026-11', '2026-11-01');
    assert.strictEqual(classifiedCurrent.todo.length, 1);
    assert.strictEqual(classifiedCurrent.done.length, 1);
    assert.strictEqual(classifiedCurrent.done[0].id, 't1');

    // 5.4 Calendar grid cell building
    const cells = TasbeehService.buildCalendarCells(2026, 8, 't1', { 't1': { '2026-09-05': true } }, '2026-09-05', (v) => globalThis.ko.observable(v));
    assert(cells.length >= 30, 'Calendar must have at least 30 cells including padding');
    const day5 = cells.find(c => c.dayNumber === 5);
    assert(day5, 'Day 5 must exist');
    assert.strictEqual(day5.isToday, true);
    assert.strictEqual(day5.isCompleted(), true);

    // 5.5 History stats calculation
    const histStats = TasbeehService.calculateHistoryStats({ startDate: '2026-01', endDate: '2026-05', initialEnd: '2026-06' });
    assert(histStats.totalMonths >= 6);
    assert.strictEqual(typeof histStats.percentCleared, 'number');

    // 5.6 Period preset calculation
    const preset1Yr = TasbeehService.calculatePeriodPreset('1-year');
    assert(preset1Yr.startDate && preset1Yr.endDate);

    // 5.7 History tab rendering (curOldMonth reference check)
    const { renderHistoryTab } = await import(path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history.js'));
    const elements = {
        'tbHistoryBody': { innerHTML: '', classList: { toggle() {}, remove() {}, add() {} } },
        'tbHistoryList': { innerHTML: '' },
        'tbHistPercentBadge': { textContent: '' },
        'tbHistProgressBar': { style: {}, setAttribute() {} },
        'tbHistTotalMonths': { textContent: '' },
        'tbHistClearedMonths': { textContent: '' },
        'tbHistPendingMonths': { textContent: '' },
        'tbHistPeriodStart': { value: '' },
        'tbHistPeriodEnd': { value: '' },
        'tbHistResetCompletedBtn': { classList: { remove() {}, add() {} } }
    };
    const prevDoc = globalThis.document;
    globalThis.document = {
        getElementById(id) {
            return elements[id] || null;
        }
    };
    assert.doesNotThrow(() => {
        renderHistoryTab();
    }, 'renderHistoryTab should execute without ReferenceError on curOldMonth');
    assert(elements['tbHistoryList'].innerHTML.length > 0, 'tbHistoryList HTML should be populated');
    globalThis.document = prevDoc;

    console.log('  ✔ Modular Components: All 12 ViewModels, Templates, Callbacks, and ko.components.register() passed');
    console.log('  ✔ TasbeehService: Reusable utilities, classification, calendar grid builder, and stats verified');
}
