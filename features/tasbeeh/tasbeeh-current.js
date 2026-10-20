/* ============================================================
   Nur Prayer — Digital Tasbeeh: Current View Module
   Path: features/tasbeeh/tasbeeh-current.js
   Handles:
     - Dhikr items data layer & local storage persistence
     - Current month calculations & daily count resets
     - Current tab rendering (TO DO & COMPLETED groups, progress bars)
     - Interactive SVG Bead Ring & full-screen counter overlay
     - Add / Edit Dhikr modal
     - Tab navigation coordinator (Current / Old)
   ============================================================ */
'use strict';

window.TasbeehCurrentApp = (function () {
    /* ---------- Constants & Presets ---------- */
    var STORAGE_KEY = 'app_tasbeeh_data';
    var DAY_KEY = 'app_tasbeeh_day';
    var INFINITE_LAP = 33;
    var MAX_BEADS = 60;
    var SVG_NS = 'http://www.w3.org/2000/svg';

    var DEFAULT_PRESETS = [
        { title: 'SubhanAllah', targetCount: 33, targetCycles: 3, icon: '🌿' },
        { title: 'Alhamdulillah', targetCount: 33, targetCycles: 3, icon: '🕌' },
        { title: 'Allahu Akbar', targetCount: 34, targetCycles: 3, icon: '🌙' },
        { title: 'Astaghfirullah', targetCount: 100, targetCycles: 1, icon: '✨' }
    ];

    var ICON_POOL = ['🌿', '🕌', '🌙', '✨', '📿', '🌟', '🕊️', '🕋'];

    /* ---------- State ---------- */
    var items = [];
    var activeId = null;
    var editingId = null;
    var activeTab = 'current'; // 'current' or 'old'
    var counterMonthKey = null; // When counting for a specific old month
    var countMode = 'finite';
    var flashFull = false;
    var counterLocked = false;

    /* Ring SVG state */
    var beadEls = [];
    var ringN = 33;
    var ringTarget = 33;

    /* Session timer */
    var sessionStart = null;
    var sessionTimer = null;

    /* Modal instances */
    var editModalInstance = null;
    var resetModalInstance = null;

    /* ---------- Storage Layer ---------- */
    function normalizeItem(raw) {
        var norm = {
            id: raw.id || uid(),
            title: raw.title || 'Dhikr',
            targetCount: raw.targetCount === 'infinite' ? 'infinite' : clamp(parseInt(raw.targetCount, 10) || 33, 1, 9999),
            targetCycles: clamp(parseInt(raw.targetCycles, 10) || 1, 1, 99),
            currentCount: clamp(parseInt(raw.currentCount, 10) || 0, 0, 99999),
            currentCycle: clamp(parseInt(raw.currentCycle, 10) || 1, 1, 999),
            totalCountToday: clamp(parseInt(raw.totalCountToday, 10) || 0, 0, 9999999),
            icon: raw.icon || ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)],
            updatedAt: raw.updatedAt || Date.now(),
            dailyHistory: (raw.dailyHistory && typeof raw.dailyHistory === 'object') ? Object.assign({}, raw.dailyHistory) : {},
            monthlyHistory: (raw.monthlyHistory && typeof raw.monthlyHistory === 'object') ? Object.assign({}, raw.monthlyHistory) : {},
            oldTotalCount: clamp(parseInt(raw.oldTotalCount, 10) || 0, 0, 99999999)
        };

        var today = td();
        if (norm.totalCountToday > 0 && !norm.dailyHistory[today]) {
            norm.dailyHistory[today] = norm.totalCountToday;
        }
        var curMonth = getCurrentMonthKey();
        if (norm.totalCountToday > 0 && !norm.monthlyHistory[curMonth]) {
            norm.monthlyHistory[curMonth] = norm.totalCountToday;
        }

        return norm;
    }

    function loadItems() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return DEFAULT_PRESETS.map(function (p) {
                return normalizeItem({
                    title: p.title,
                    targetCount: p.targetCount,
                    targetCycles: p.targetCycles,
                    icon: p.icon,
                    currentCount: 0,
                    currentCycle: 1,
                    totalCountToday: 0
                });
            });
        }
        try {
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
            }
            return parsed.map(normalizeItem);
        } catch (_) {
            return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
        }
    }

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (_) { }
    }

    function checkDailyReset() {
        var today = todayKey();
        var last = localStorage.getItem(DAY_KEY);
        if (last !== today) {
            items.forEach(function (it) { it.totalCountToday = 0; });
            localStorage.setItem(DAY_KEY, today);
            persist();
        }
    }

    function getActiveItem() {
        if (!activeId) return null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === activeId) return items[i];
        }
        return null;
    }

    function getItems() {
        return items;
    }

    function setItems(newItems) {
        items = newItems || [];
        persist();
    }

    /* ---------- Progress Computation ---------- */
    function computeProgress(item) {
        if (item.targetCount === 'infinite') {
            return { pct: 0, done: item.currentCount, total: null };
        }
        var perCycle = item.targetCount;
        var total = perCycle * item.targetCycles;
        var doneCycles = Math.min(item.currentCycle - 1, item.targetCycles);
        var done = doneCycles * perCycle + item.currentCount;
        var pct = total > 0 ? clamp((done / total) * 100, 0, 100) : 0;
        return { pct: pct, done: done, total: total };
    }

    /* ---------- Current Card HTML Generator ---------- */
    function renderCurrentCardHtml(item, isComplete, curMonthKey) {
        var isInfinite = item.targetCount === 'infinite';
        var prog = computeProgress(item);
        var thisMonthCount = (item.monthlyHistory && item.monthlyHistory[curMonthKey]) || 0;
        var metaLine = isInfinite
            ? 'Target: ∞ · Cycles: ∞ · Recited: <strong>' + item.currentCount + '</strong>'
            : 'Target: ' + item.targetCount + ' · Cycles: ' + item.targetCycles + ' · Done: <strong>' + prog.done + '</strong>/' + prog.total;

        return '<div class="tb-card p-3 shadow-sm ' + (isComplete ? 'tb-card-done' : '') + '" data-id="' + item.id + '" data-ref="page.tasbeeh.card">' +
            '<div class="d-flex align-items-center gap-3 mb-2" data-ref="page.tasbeeh.card.header">' +
            '<div class="tb-badge ' + (isComplete ? 'bg-success-subtle text-success' : '') + '" data-ref="page.tasbeeh.card.icon">' + (item.icon || '🌿') + '</div>' +
            '<div class="flex-grow-1 min-w-0" data-ref="page.tasbeeh.card.info">' +
            '<div class="d-flex align-items-center justify-content-between">' +
            '<h6 class="fw-bold mb-0 text-truncate text-gr1" data-ref="page.tasbeeh.card.title">' + escHtml(item.title) + '</h6>' +
            (isComplete ? '<span class="badge-pill-custom badge-done py-1 px-2 fs-xs"><i class="fa-solid fa-check me-1"></i>Completed</span>' : '') +
            '</div>' +
            '<div class="tb-meta mt-1" data-ref="page.tasbeeh.card.meta">' + metaLine + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="progress progress-thin mb-2" data-ref="page.tasbeeh.card.progress">' +
            '<div class="progress-bar ' + (isComplete ? 'bg-success' : '') + '" style="width:' + prog.pct.toFixed(1) + '%" data-ref="page.tasbeeh.card.progress-bar"></div>' +
            '</div>' +
            '<div class="d-flex align-items-center justify-content-between mb-3 px-1">' +
            '<span class="tb-chant-chip ' + (thisMonthCount > 0 ? 'has-count' : '') + '"><i class="fa-regular fa-calendar-check me-1"></i>This Month: <strong>' + thisMonthCount.toLocaleString() + '</strong></span>' +
            '<span class="tb-chant-chip ' + (item.totalCountToday > 0 ? 'has-count' : '') + '"><i class="fa-solid fa-sparkles me-1"></i>Today: <strong>' + (item.totalCountToday || 0) + '</strong></span>' +
            '</div>' +
            '<div class="d-flex align-items-center gap-2 pt-1 border-top" data-ref="page.tasbeeh.card.actions">' +
            '<button type="button" class="btn ' + (isComplete ? 'btn-outline-brand' : 'btn-brand') + ' flex-grow-1 py-2 rounded-3 fw-bold btn-h-42" data-act="tb-open" data-ref="page.tasbeeh.card.open-btn">' +
            '<i class="fa-solid ' + (isComplete ? 'fa-rotate-right' : 'fa-play') + ' me-2"></i>' + (isComplete ? 'Recount / Add' : 'Open Counter') + '</button>' +
            '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-edit" title="Edit" data-ref="page.tasbeeh.card.edit-btn">' +
            '<i class="fa-solid fa-pen text-secondary"></i></button>' +
            '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-del" title="Delete" data-ref="page.tasbeeh.card.del-btn">' +
            '<i class="fa-solid fa-trash text-danger"></i></button>' +
            '</div>' +
            '</div>';
    }

    /* ---------- Rendering: Current Tab (Current Month) ---------- */
    function renderCurrentTab() {
        var curMonthKey = getCurrentMonthKey();
        var listEl = getEl('tbList');
        var emptyEl = getEl('tbEmptyState');

        if (!listEl) return;

        if (items.length === 0) {
            if (emptyEl) emptyEl.classList.remove('d-none');
            listEl.innerHTML = '';
            return;
        }

        if (emptyEl) emptyEl.classList.add('d-none');

        var todoItems = [];
        var doneItems = [];

        items.forEach(function (item) {
            var isComplete = item.targetCount !== 'infinite' && item.currentCycle > item.targetCycles;
            if (isComplete) {
                doneItems.push(item);
            } else {
                todoItems.push(item);
            }
        });

        var todoCardsHtml = todoItems.length > 0
            ? todoItems.map(function (it) { return renderCurrentCardHtml(it, false, curMonthKey); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<i class="fa-solid fa-circle-check text-success fs-3 mb-2"></i>' +
              '<div class="fw-bold text-gr1">All Dhikrs Completed!</div>' +
              '<div class="text-muted small">All your target cycles for this month are complete.</div>' +
              '</div>';

        var doneCardsHtml = doneItems.length > 0
            ? doneItems.map(function (it) { return renderCurrentCardHtml(it, true, curMonthKey); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<div class="text-muted small">No completed Dhikrs yet. Completed chants will appear here.</div>' +
              '</div>';

        var html =
            '<!-- TO DO GROUP -->' +
            '<section class="prayer-group mb-3" data-ref="page.tasbeeh.group.todo">' +
            '<button type="button" class="group-toggle py-1 d-flex align-items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbCurrentTodoList" aria-expanded="true">' +
            '<span class="toggle-icon">▼</span>' +
            '<span class="section-title text-gr1 fw-bold">TO DO</span>' +
            '<span class="badge rounded-pill bg-light text-muted border small px-2 py-1">' + todoItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbCurrentTodoList">' +
            '<div class="d-flex flex-column gap-3 mt-2">' +
            todoCardsHtml +
            '</div>' +
            '</div>' +
            '</section>' +

            '<!-- COMPLETED GROUP -->' +
            '<section class="prayer-group mb-3" data-ref="page.tasbeeh.group.done">' +
            '<button type="button" class="group-toggle py-1 d-flex align-items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbCurrentDoneList" aria-expanded="true">' +
            '<span class="toggle-icon">▼</span>' +
            '<span class="section-title text-success fw-bold">COMPLETED</span>' +
            '<span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle small px-2 py-1">' + doneItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbCurrentDoneList">' +
            '<div class="d-flex flex-column gap-3 mt-2">' +
            doneCardsHtml +
            '</div>' +
            '</div>' +
            '</section>';

        listEl.innerHTML = html;
    }

    /* ---------- Tab Navigation & Rendering ---------- */
    function render() {
        if (activeTab === 'old') {
            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
        } else {
            renderCurrentTab();
        }
    }

    function switchTab(tab) {
        activeTab = tab === 'old' ? 'old' : 'current';
        var btnCur = getEl('tabTbCurrent');
        var btnOld = getEl('tabTbOld');
        var bodyCur = getEl('tbCurrentBody');
        var bodyOld = getEl('tbOldBody');
        var icon = getEl('tbHeaderIcon');
        var label = getEl('tbHeaderLabel');
        var sub = getEl('tbHeaderSub');

        if (activeTab === 'old') {
            if (btnCur) { btnCur.classList.remove('active'); btnCur.setAttribute('aria-selected', 'false'); }
            if (btnOld) { btnOld.classList.add('active'); btnOld.setAttribute('aria-selected', 'true'); }
            if (bodyCur) bodyCur.classList.add('d-none');
            if (bodyOld) bodyOld.classList.remove('d-none');
            if (icon) icon.className = 'fa-solid fa-clock-rotate-left text-warning';
            if (label) label.textContent = 'Old Tasbeeh';

            var curOldM = window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function'
                ? window.TasbeehOldApp.getCurrentOldMonth()
                : null;

            if (sub) {
                sub.textContent = curOldM ? formatMonthLabel(curOldM) : 'All Completed';
            }

            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
        } else {
            if (btnCur) { btnCur.classList.add('active'); btnCur.setAttribute('aria-selected', 'true'); }
            if (btnOld) { btnOld.classList.remove('active'); btnOld.setAttribute('aria-selected', 'false'); }
            if (bodyCur) bodyCur.classList.remove('d-none');
            if (bodyOld) bodyOld.classList.add('d-none');
            if (icon) icon.className = 'fa-regular fa-calendar text-primary';
            if (label) label.textContent = 'Digital Tasbeeh';
            if (sub) sub.textContent = formatMonthLabel(getCurrentMonthKey());
            renderCurrentTab();
        }
    }

    /* ---------- SVG Bead Ring ---------- */
    function buildRing(item) {
        var isInfinite = item.targetCount === 'infinite';
        ringTarget = isInfinite ? INFINITE_LAP : item.targetCount;
        ringN = isInfinite ? INFINITE_LAP : Math.min(item.targetCount, MAX_BEADS);

        var group = getEl('tbBeadGroup');
        if (!group) return;
        group.innerHTML = '';
        beadEls = [];

        var cx = 130, cy = 130, radius = 104;
        var spacing = (2 * Math.PI * radius) / ringN;
        var beadR = clamp(spacing * 0.33, 2.6, 7.5);

        for (var i = 0; i < ringN; i++) {
            var angle = (-90 + (360 / ringN) * i) * (Math.PI / 180);
            var circle = document.createElementNS(SVG_NS, 'circle');

            circle.setAttribute('cx', (cx + radius * Math.cos(angle)).toFixed(2));
            circle.setAttribute('cy', (cy + radius * Math.sin(angle)).toFixed(2));
            circle.setAttribute('r', beadR.toFixed(2));
            circle.setAttribute('class', 'tb-bead');

            group.appendChild(circle);
            beadEls.push(circle);
        }
    }

    /* ---------- Counter View UI Update ---------- */
    function updateCounterUI() {
        var item = getActiveItem();
        if (!item) return;

        var isInfinite = item.targetCount === 'infinite';
        var lapTarget = isInfinite ? INFINITE_LAP : item.targetCount;
        var isComplete, displayCount, displayCycle;

        if (counterMonthKey) {
            var mCount = (item.monthlyHistory && item.monthlyHistory[counterMonthKey]) || 0;
            if (isInfinite) {
                isComplete = false;
                displayCount = mCount;
                displayCycle = Math.floor(mCount / INFINITE_LAP) + 1;
            } else {
                var totalTarget = item.targetCount * item.targetCycles;
                isComplete = mCount >= totalTarget;
                if (flashFull || isComplete) {
                    displayCount = lapTarget;
                    displayCycle = item.targetCycles;
                } else {
                    displayCycle = Math.min(item.targetCycles, Math.floor(mCount / item.targetCount) + 1);
                    displayCount = mCount % item.targetCount;
                }
            }
        } else {
            isComplete = !isInfinite && item.currentCycle > item.targetCycles;
            displayCount = (flashFull || isComplete) ? lapTarget : item.currentCount;
            displayCycle = (flashFull || isComplete) ? Math.min(item.targetCycles, Math.max(1, item.currentCycle - 1)) : item.currentCycle;
        }

        var topTitle = item.title;
        if (counterMonthKey) {
            topTitle += ' (' + formatMonthLabel(counterMonthKey) + ')';
        }

        var topTitleEl = getEl('tbCounterTopTitle');
        if (topTitleEl) topTitleEl.textContent = topTitle;
        var titleEl = getEl('tbCounterTitle');
        if (titleEl) titleEl.textContent = item.title;

        var cycleBadge = getEl('tbCounterCycle');
        if (cycleBadge) {
            if (isInfinite) {
                cycleBadge.textContent = 'Cycle ' + displayCycle + ' / ∞';
                cycleBadge.className = 'badge-pill-custom badge-notyet';
            } else if (isComplete) {
                cycleBadge.textContent = 'All ' + item.targetCycles + ' Cycles Completed ✓';
                cycleBadge.className = 'badge-pill-custom badge-done';
            } else {
                cycleBadge.textContent = 'Cycle ' + displayCycle + ' of ' + item.targetCycles;
                cycleBadge.className = 'badge-pill-custom badge-done';
            }
        }

        var countEl = getEl('tbCounterCount');
        if (countEl) countEl.textContent = displayCount;
        var targetEl = getEl('tbCounterTarget');
        if (targetEl) targetEl.textContent = isInfinite ? 'OF ∞' : 'OF ' + item.targetCount;

        /* Beads */
        var filled;
        if (isInfinite) {
            var lapCount = displayCount === 0 ? 0 : ((displayCount - 1) % INFINITE_LAP) + 1;
            filled = Math.round((lapCount / INFINITE_LAP) * ringN);
        } else {
            filled = isComplete ? ringN : Math.round((displayCount / item.targetCount) * ringN);
        }
        filled = clamp(filled, 0, ringN);

        beadEls.forEach(function (bead, i) {
            bead.classList.toggle('on', i < filled);
            bead.classList.toggle('next', i === filled && !isComplete);
        });

        /* Ring Wrap & Tap Zone */
        var ringWrap = getEl('tbRingWrap') || document.querySelector('[data-ref="page.tasbeeh.counter.ring-wrap"]');
        if (ringWrap) ringWrap.classList.toggle('done', isComplete);

        var tapZone = getEl('tbTapZone');
        var tapLabel = getEl('tbTapLabel');
        if (tapZone) tapZone.classList.toggle('done', isComplete);
        if (tapLabel) tapLabel.textContent = isComplete ? 'COMPLETED ✓' : 'TAP (+1)';

        updateSessionLine();
    }

    /* ---------- Session Timer ---------- */
    function startSession() {
        sessionStart = Date.now();
        clearInterval(sessionTimer);
        sessionTimer = setInterval(updateSessionLine, 1000);
    }

    function stopSession() {
        clearInterval(sessionTimer);
        sessionTimer = null;
        sessionStart = null;
    }

    function updateSessionLine() {
        var item = getActiveItem();
        if (!item) return;

        var timerEl = getEl('tbSessionTimer');
        if (timerEl && sessionStart) {
            var secs = Math.floor((Date.now() - sessionStart) / 1000);
            var mm = String(Math.floor(secs / 60)).padStart(2, '0');
            var ss = String(secs % 60).padStart(2, '0');
            timerEl.innerHTML = '<i class="fa-regular fa-clock me-1"></i>' + mm + ':' + ss;
        }

        var todayEl = getEl('tbSessionToday');
        if (todayEl) {
            if (counterMonthKey) {
                var mCount = (item.monthlyHistory && item.monthlyHistory[counterMonthKey]) || 0;
                todayEl.textContent = formatMonthLabel(counterMonthKey) + ' ' + mCount;
            } else {
                todayEl.textContent = 'Today ' + (item.totalCountToday || 0);
            }
        }
    }

    /* ---------- Counter Actions ---------- */
    function openCounter(id, oldMonthKey) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        activeId = id;
        counterMonthKey = oldMonthKey || null;
        flashFull = false;
        counterLocked = false;

        if (!counterMonthKey && item.targetCount !== 'infinite' && item.currentCount >= item.targetCount) {
            item.currentCount = 0;
            item.currentCycle += 1;
            persist();
        }

        buildRing(item);
        updateCounterUI();
        startSession();

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.remove('d-none');
            counterView.classList.add('d-flex');
        }
    }

    function openCounterOld(id, monthKey) {
        openCounter(id, monthKey);
    }

    function closeCounter() {
        stopSession();
        activeId = null;
        counterMonthKey = null;
        flashFull = false;
        counterLocked = false;

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.add('d-none');
            counterView.classList.remove('d-flex');
        }

        render();
    }

    function increment() {
        var item = getActiveItem();
        if (!item || counterLocked || flashFull) return;

        var isInfinite = item.targetCount === 'infinite';
        var isComplete;

        if (counterMonthKey) {
            var mCount = (item.monthlyHistory && item.monthlyHistory[counterMonthKey]) || 0;
            isComplete = !isInfinite && mCount >= (item.targetCount * item.targetCycles);
        } else {
            isComplete = !isInfinite && item.currentCycle > item.targetCycles;
        }

        if (isComplete) {
            showToast('All cycles complete — reset counter to recount');
            return;
        }

        vibrate(20);
        var countEl = getEl('tbCounterCount');
        if (countEl) {
            countEl.classList.remove('pop');
            void countEl.offsetWidth;
            countEl.classList.add('pop');
        }

        if (counterMonthKey) {
            item.monthlyHistory = item.monthlyHistory || {};
            var prevMCount = item.monthlyHistory[counterMonthKey] || 0;
            var nextMCount = prevMCount + 1;
            item.monthlyHistory[counterMonthKey] = nextMCount;
            item.oldTotalCount = (item.oldTotalCount || 0) + 1;
            item.updatedAt = Date.now();

            if (!isInfinite) {
                var cycleDone = (nextMCount % item.targetCount) === 0;
                var totalTarget = item.targetCount * item.targetCycles;
                if (cycleDone) {
                    var finishedCycle = Math.floor(nextMCount / item.targetCount);
                    flashFull = true;
                    counterLocked = true;
                    updateCounterUI();
                    if (nextMCount >= totalTarget) {
                        showToast('🎉 All ' + item.targetCycles + ' cycles complete for ' + formatMonthLabel(counterMonthKey) + '!', 3000);
                    } else {
                        showToast('Cycle ' + finishedCycle + ' complete · Starting Cycle ' + (finishedCycle + 1) + ' of ' + item.targetCycles);
                    }
                    setTimeout(function () {
                        flashFull = false;
                        counterLocked = false;
                        updateCounterUI();
                    }, 520);
                    persist();
                    return;
                }
            }
            persist();
            updateCounterUI();
            return;
        }

        // Increment existing properties for Current Month
        item.currentCount += 1;
        item.totalCountToday += 1;
        item.updatedAt = Date.now();

        var today = td();
        item.dailyHistory = item.dailyHistory || {};
        item.dailyHistory[today] = (item.dailyHistory[today] || 0) + 1;

        var curMonth = getCurrentMonthKey();
        item.monthlyHistory = item.monthlyHistory || {};
        item.monthlyHistory[curMonth] = (item.monthlyHistory[curMonth] || 0) + 1;

        /* Cycle completion for Current Month */
        if (!isInfinite && item.currentCount >= item.targetCount) {
            var finishedCycle = item.currentCycle;

            item.currentCount = 0;
            item.currentCycle += 1;
            persist();

            flashFull = true;
            counterLocked = true;
            updateCounterUI();

            if (item.currentCycle > item.targetCycles) {
                showToast('🎉 All ' + item.targetCycles + ' cycles complete!', 3000);
            } else {
                showToast('Cycle ' + finishedCycle + ' complete · Starting Cycle ' + item.currentCycle + ' of ' + item.targetCycles);
            }

            setTimeout(function () {
                flashFull = false;
                counterLocked = false;
                updateCounterUI();
            }, 520);

            return;
        }

        persist();
        updateCounterUI();
    }

    function undo() {
        var item = getActiveItem();
        if (!item || counterLocked || flashFull) return;

        var isInfinite = item.targetCount === 'infinite';

        if (counterMonthKey) {
            item.monthlyHistory = item.monthlyHistory || {};
            var curMCount = item.monthlyHistory[counterMonthKey] || 0;
            if (curMCount > 0) {
                item.monthlyHistory[counterMonthKey] = curMCount - 1;
                item.oldTotalCount = Math.max(0, (item.oldTotalCount || 0) - 1);
                item.updatedAt = Date.now();
                persist();
                updateCounterUI();
            } else {
                showToast('Nothing to undo');
            }
            return;
        }

        if (item.currentCount > 0) {
            item.currentCount = Math.max(0, item.currentCount - 1);
        } else if (item.currentCycle > 1) {
            item.currentCycle -= 1;
            item.currentCount = isInfinite ? 0 : Math.max(0, item.targetCount - 1);
        } else {
            showToast('Nothing to undo');
            return;
        }

        if (item.totalCountToday > 0) item.totalCountToday -= 1;
        var today = td();
        if (item.dailyHistory && item.dailyHistory[today] > 0) {
            item.dailyHistory[today] -= 1;
        }
        var curMonth = getCurrentMonthKey();
        if (item.monthlyHistory && item.monthlyHistory[curMonth] > 0) {
            item.monthlyHistory[curMonth] -= 1;
        }

        item.updatedAt = Date.now();
        persist();
        updateCounterUI();
    }

    function promptReset() {
        var item = getActiveItem();
        if (!item) return;

        var modalEl = getEl('tasbeehResetModal');
        if (modalEl) {
            var nameEl = getEl('tbResetModalName');
            if (nameEl) nameEl.textContent = '“' + item.title + '”';
            if (!resetModalInstance) {
                resetModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            }
            resetModalInstance.show();
        } else {
            if (confirm('Reset counter for “' + item.title + '”?')) {
                doReset('all');
            }
        }
    }

    function doReset(type) {
        var item = getActiveItem();
        if (!item) return;

        if (counterMonthKey) {
            item.monthlyHistory = item.monthlyHistory || {};
            var prevVal = item.monthlyHistory[counterMonthKey] || 0;
            if (type === 'round' && item.targetCount !== 'infinite') {
                var inCycle = prevVal % item.targetCount;
                item.monthlyHistory[counterMonthKey] = Math.max(0, prevVal - inCycle);
                item.oldTotalCount = Math.max(0, (item.oldTotalCount || 0) - inCycle);
            } else {
                item.monthlyHistory[counterMonthKey] = 0;
                item.oldTotalCount = Math.max(0, (item.oldTotalCount || 0) - prevVal);
            }
            item.updatedAt = Date.now();
            flashFull = false;
            counterLocked = false;
            persist();
            updateCounterUI();
            if (resetModalInstance) resetModalInstance.hide();
            showToast(type === 'round' ? 'Current round reset' : 'Month count reset to 0');
            return;
        }

        if (type === 'round') {
            item.currentCount = 0;
        } else {
            item.currentCount = 0;
            item.currentCycle = 1;
        }

        item.updatedAt = Date.now();
        flashFull = false;
        counterLocked = false;

        persist();
        updateCounterUI();
        if (resetModalInstance) resetModalInstance.hide();
        showToast(type === 'round' ? 'Current round reset' : 'Counter fully reset');
    }

    /* ---------- Add / Edit Modal ---------- */
    function syncChips() {
        var chips = document.querySelectorAll('#tbCountChips button');
        chips.forEach(function (btn) {
            var v = btn.dataset.count;
            var isOn = v === 'infinite'
                ? countMode === 'infinite'
                : countMode === 'finite' && Number(v) === Number(getEl('tbFormCount').value);
            btn.classList.toggle('active', isOn);
        });
    }

    function openModal(id) {
        editingId = id || null;
        var item = null;
        if (id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) { item = items[i]; break; }
            }
        }

        var modalTitle = getEl('tbModalTitle');
        if (modalTitle) modalTitle.textContent = item ? 'Edit Dhikr' : 'Add New Dhikr';
        var formTitle = getEl('tbFormTitle');
        if (formTitle) formTitle.value = item ? item.title : '';

        countMode = item && item.targetCount === 'infinite' ? 'infinite' : 'finite';
        var formCount = getEl('tbFormCount');
        if (formCount) {
            formCount.value = item && item.targetCount !== 'infinite' ? item.targetCount : 33;
            formCount.disabled = countMode === 'infinite';
        }

        var formCycles = getEl('tbFormCycles');
        if (formCycles) formCycles.value = item ? item.targetCycles : 3;

        syncChips();

        var modalEl = getEl('tasbeehModal');
        if (modalEl) {
            if (!editModalInstance) {
                editModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            }
            editModalInstance.show();
        }
    }

    function saveModal() {
        var formTitle = getEl('tbFormTitle');
        var title = formTitle ? formTitle.value.trim() : '';
        if (!title) {
            alert('Please enter a chant title.');
            if (formTitle) formTitle.focus();
            return;
        }

        var targetCount = countMode === 'infinite'
            ? 'infinite'
            : clamp(parseInt(getEl('tbFormCount').value, 10) || 33, 1, 9999);

        var targetCycles = clamp(parseInt(getEl('tbFormCycles').value, 10) || 1, 1, 99);

        if (editingId) {
            var item = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === editingId) { item = items[i]; break; }
            }
            if (item) {
                item.title = title;
                item.targetCount = targetCount;
                item.targetCycles = targetCycles;
                item.updatedAt = Date.now();

                if (item.currentCycle > targetCycles) item.currentCycle = targetCycles;
                if (targetCount !== 'infinite' && item.currentCount > targetCount) item.currentCount = 0;

                showToast('Dhikr updated');
            }
        } else {
            items.push(normalizeItem({
                id: uid(),
                title: title,
                targetCount: targetCount,
                targetCycles: targetCycles,
                currentCount: 0,
                currentCycle: 1,
                totalCountToday: 0,
                icon: ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)],
                updatedAt: Date.now()
            }));
            showToast('Dhikr added');
        }

        persist();
        render();

        if (activeId && activeId === editingId) {
            var active = getActiveItem();
            if (active) {
                buildRing(active);
                flashFull = false;
                counterLocked = false;
                updateCounterUI();
            }
        }

        if (editModalInstance) editModalInstance.hide();
        editingId = null;
    }

    function deleteItem(id) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        if (!confirm('Delete “' + item.title + '”? This will remove its recorded progress.')) {
            return;
        }

        items = items.filter(function (it) { return it.id !== id; });

        if (activeId === id) {
            closeCounter();
        }

        persist();
        render();
        showToast('Dhikr deleted');
    }

    /* ---------- Event Bindings ---------- */
    function bindEvents() {
        /* Open Dhikr Add modal */
        var addBtn = getEl('tbAddBtn');
        if (addBtn) {
            addBtn.onclick = function () { openModal(null); };
        }

        var saveBtn = getEl('tbModalSaveBtn');
        if (saveBtn) {
            saveBtn.onclick = saveModal;
        }

        /* Subtab Switching */
        var tabCurrent = getEl('tabTbCurrent');
        if (tabCurrent) {
            tabCurrent.onclick = function () { switchTab('current'); };
        }

        var tabOld = getEl('tabTbOld');
        if (tabOld) {
            tabOld.onclick = function () { switchTab('old'); };
        }

        /* Chips */
        var chipsBox = getEl('tbCountChips');
        if (chipsBox) {
            chipsBox.onclick = function (e) {
                var btn = e.target.closest('button[data-count]');
                if (!btn) return;
                var val = btn.dataset.count;
                var countInput = getEl('tbFormCount');
                if (val === 'infinite') {
                    countMode = 'infinite';
                    if (countInput) countInput.disabled = true;
                } else {
                    countMode = 'finite';
                    if (countInput) {
                        countInput.disabled = false;
                        countInput.value = val;
                    }
                }
                syncChips();
            };
        }

        var formCount = getEl('tbFormCount');
        if (formCount) {
            formCount.oninput = function () {
                if (formCount.value !== '') countMode = 'finite';
                syncChips();
            };
        }

        /* Steppers */
        var cycMinus = getEl('tbCyclesMinus');
        var cycPlus = getEl('tbCyclesPlus');
        var cycInput = getEl('tbFormCycles');
        if (cycMinus && cycInput) {
            cycMinus.onclick = function () {
                var v = parseInt(cycInput.value, 10) || 1;
                cycInput.value = clamp(v - 1, 1, 99);
            };
        }
        if (cycPlus && cycInput) {
            cycPlus.onclick = function () {
                var v = parseInt(cycInput.value, 10) || 1;
                cycInput.value = clamp(v + 1, 1, 99);
            };
        }

        /* Current List card delegations */
        var listEl = getEl('tbList');
        if (listEl) {
            listEl.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                var card = e.target.closest('[data-id]');
                if (!card) return;
                e.stopPropagation();
                var id = card.dataset.id;
                if (btn) {
                    var act = btn.dataset.act;
                    if (act === 'tb-open') openCounter(id);
                    else if (act === 'tb-edit') openModal(id);
                    else if (act === 'tb-del') deleteItem(id);
                } else {
                    openCounter(id);
                }
            };
        }

        /* Counter View Controls */
        var btnBack = getEl('tbBtnBack');
        if (btnBack) btnBack.onclick = closeCounter;

        var btnEditActive = getEl('tbBtnEditActive');
        if (btnEditActive) {
            btnEditActive.onclick = function () {
                if (activeId) openModal(activeId);
            };
        }

        /* Ring Wrap Tap Target */
        var ringWrap = getEl('tbRingWrap') || document.querySelector('[data-ref="page.tasbeeh.counter.ring-wrap"]');
        if (ringWrap) {
            ringWrap.addEventListener('pointerdown', function (e) {
                createRipple(e, ringWrap);
            });
            ringWrap.onclick = increment;
            ringWrap.addEventListener('keydown', function (e) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    increment();
                }
            });
        }

        /* Oversized Tap Target */
        var tapZone = getEl('tbTapZone');
        if (tapZone) {
            tapZone.addEventListener('pointerdown', function (e) {
                createRipple(e, tapZone);
            });
            tapZone.onclick = increment;
        }

        /* Counter Footer Action Buttons */
        var counterControls = getEl('tbCounterControls');
        if (counterControls) {
            counterControls.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                if (!btn) return;
                var act = btn.dataset.act;
                if (act === 'tb-reset') {
                    promptReset();
                } else if (act === 'tb-undo') {
                    undo();
                }
            };
        }

        /* Reset Dialog Buttons */
        var btnResetRound = getEl('tbBtnResetRound');
        if (btnResetRound) {
            btnResetRound.onclick = function () { doReset('round'); };
        }
        var btnResetAll = getEl('tbBtnResetAll');
        if (btnResetAll) {
            btnResetAll.onclick = function () { doReset('all'); };
        }

        /* Keyboard shortcuts */
        document.addEventListener('keydown', function (e) {
            var counterView = getEl('tasbeehCounterView');
            var isOverlayOpen = counterView && !counterView.classList.contains('d-none');
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (isOverlayOpen) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    increment();
                } else if (e.code === 'Backspace') {
                    e.preventDefault();
                    undo();
                } else if (e.code === 'Escape') {
                    closeCounter();
                }
            }
        });
    }

    /* ---------- Public API ---------- */
    function init() {
        items = loadItems();
        checkDailyReset();
        persist();
        bindEvents();
        switchTab('current');
    }

    return {
        init: init,
        render: render,
        switchTab: switchTab,
        renderCurrentTab: renderCurrentTab,
        openCounter: openCounter,
        openCounterOld: openCounterOld,
        closeCounter: closeCounter,
        openModal: openModal,
        saveModal: saveModal,
        deleteItem: deleteItem,
        getItems: getItems,
        setItems: setItems,
        persist: persist,
        formatDate: formatDate,
        formatMonthLabel: formatMonthLabel,
        getCurrentMonthKey: getCurrentMonthKey,
        showToast: showToast
    };
})();

// Alias to window.TasbeehApp as primary coordinator
window.TasbeehApp = window.TasbeehCurrentApp;
