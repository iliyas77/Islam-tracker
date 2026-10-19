/* ============================================================
   Nur Prayer — Digital Tasbeeh Feature Module
   Path: features/tasbeeh/tasbeeh.js
   ============================================================ */
'use strict';

window.TasbeehApp = (function () {
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
    var toastTimer = null;

    /* Modal instances */
    var editModalInstance = null;
    var resetModalInstance = null;

    /* ---------- Helper Utilities ---------- */
    function getEl(id) {
        return document.getElementById(id);
    }

    function clamp(val, min, max) {
        return Math.min(max, Math.max(min, val));
    }

    function uid() {
        return 'tb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function todayKey() {
        return new Date().toDateString();
    }

    /* ---------- Toast ---------- */
    function showToast(message, duration) {
        var el = getEl('tbToast');
        if (!el) return;
        duration = duration || 2200;
        el.textContent = message;
        el.classList.remove('d-none');
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove('show');
            setTimeout(function () { el.classList.add('d-none'); }, 200);
        }, duration);
    }

    /* ---------- Storage Layer ---------- */
    function normalizeItem(raw) {
        return {
            id: raw.id || uid(),
            title: raw.title || 'Dhikr',
            targetCount: raw.targetCount === 'infinite' ? 'infinite' : clamp(parseInt(raw.targetCount, 10) || 33, 1, 9999),
            targetCycles: clamp(parseInt(raw.targetCycles, 10) || 1, 1, 99),
            currentCount: clamp(parseInt(raw.currentCount, 10) || 0, 0, 99999),
            currentCycle: clamp(parseInt(raw.currentCycle, 10) || 1, 1, 999),
            totalCountToday: clamp(parseInt(raw.totalCountToday, 10) || 0, 0, 9999999),
            icon: raw.icon || ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)],
            updatedAt: raw.updatedAt || Date.now()
        };
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

    /* ---------- Rendering: List View ---------- */
    function renderList() {
        var listEl = getEl('tbList');
        var emptyEl = getEl('tbEmptyState');
        var totalEl = getEl('tbTodayTotal');
        if (!listEl) return;

        if (items.length === 0) {
            if (emptyEl) emptyEl.classList.remove('d-none');
            listEl.innerHTML = '';
        } else {
            if (emptyEl) emptyEl.classList.add('d-none');
            var html = '';
            items.forEach(function (item) {
                var isInfinite = item.targetCount === 'infinite';
                var prog = computeProgress(item);
                var metaLine = isInfinite
                    ? 'Target: ∞ · Cycles: ∞ · Recited: <strong>' + item.currentCount + '</strong>'
                    : 'Target: ' + item.targetCount + ' · Cycles: ' + item.targetCycles + ' · Done: <strong>' + prog.done + '</strong>/' + prog.total;

                var isComplete = !isInfinite && item.currentCycle > item.targetCycles;

                html += '<div class="tb-card p-3 shadow-sm" data-id="' + item.id + '" data-ref="page.tasbeeh.card">' +
                    '<div class="d-flex align-items-center gap-3 mb-2" data-ref="page.tasbeeh.card.header">' +
                    '<div class="tb-badge" data-ref="page.tasbeeh.card.icon">' + (item.icon || '🌿') + '</div>' +
                    '<div class="flex-grow-1 min-w-0" data-ref="page.tasbeeh.card.info">' +
                    '<div class="d-flex align-items-center justify-content-between">' +
                    '<h6 class="fw-bold mb-0 text-truncate text-gr1" data-ref="page.tasbeeh.card.title">' + escHtml(item.title) + '</h6>' +
                    (isComplete ? '<span class="badge-pill-custom badge-done py-1 px-2 fs-xs"><i class="fa-solid fa-check"></i>Done</span>' : '') +
                    '</div>' +
                    '<div class="tb-meta mt-1" data-ref="page.tasbeeh.card.meta">' + metaLine + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="progress progress-thin mb-3" data-ref="page.tasbeeh.card.progress">' +
                    '<div class="progress-bar" style="width:' + prog.pct.toFixed(1) + '%" data-ref="page.tasbeeh.card.progress-bar"></div>' +
                    '</div>' +
                    '<div class="d-flex align-items-center gap-2 pt-1 border-top" data-ref="page.tasbeeh.card.actions">' +
                    '<button type="button" class="btn btn-brand flex-grow-1 py-2 rounded-3 fw-bold btn-h-42" data-act="tb-open" data-ref="page.tasbeeh.card.open-btn">' +
                    '<i class="fa-solid fa-play me-2"></i>Open Counter</button>' +
                    '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-edit" title="Edit" data-ref="page.tasbeeh.card.edit-btn">' +
                    '<i class="fa-solid fa-pen text-secondary"></i></button>' +
                    '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-del" title="Delete" data-ref="page.tasbeeh.card.del-btn">' +
                    '<i class="fa-solid fa-trash text-danger"></i></button>' +
                    '</div>' +
                    '</div>';
            });
            listEl.innerHTML = html;
        }

        if (totalEl) {
            var todayTotal = items.reduce(function (sum, it) { return sum + (it.totalCountToday || 0); }, 0);
            totalEl.textContent = todayTotal.toLocaleString();
        }
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
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
        var isComplete = !isInfinite && item.currentCycle > item.targetCycles;

        var displayCount = (flashFull || isComplete) ? lapTarget : item.currentCount;
        var displayCycle = (flashFull || isComplete) ? Math.min(item.targetCycles, Math.max(1, item.currentCycle - 1)) : item.currentCycle;

        getEl('tbCounterTopTitle').textContent = item.title;
        getEl('tbCounterTitle').textContent = item.title;

        var cycleBadge = getEl('tbCounterCycle');
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

        getEl('tbCounterCount').textContent = displayCount;
        getEl('tbCounterTarget').textContent = isInfinite ? 'OF ∞' : 'OF ' + item.targetCount;

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
            todayEl.textContent = 'Today ' + (item.totalCountToday || 0);
        }
    }

    /* ---------- Counter Actions ---------- */
    function openCounter(id) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        activeId = id;
        flashFull = false;
        counterLocked = false;

        if (item.targetCount !== 'infinite' && item.currentCount >= item.targetCount) {
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

    function closeCounter() {
        stopSession();
        activeId = null;
        flashFull = false;
        counterLocked = false;

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.add('d-none');
            counterView.classList.remove('d-flex');
        }

        renderList();
    }

    function increment() {
        var item = getActiveItem();
        if (!item || counterLocked || flashFull) return;

        var isInfinite = item.targetCount === 'infinite';
        var isComplete = !isInfinite && item.currentCycle > item.targetCycles;

        if (isComplete) {
            showToast('All cycles complete — reset counter to recount');
            return;
        }

        if (navigator.vibrate) {
            try { navigator.vibrate(20); } catch (_) {}
        }
        var countEl = getEl('tbCounterCount');
        if (countEl) {
            countEl.classList.remove('pop');
            void countEl.offsetWidth;
            countEl.classList.add('pop');
        }

        item.currentCount += 1;
        item.totalCountToday += 1;
        item.updatedAt = Date.now();

        /* Cycle completion */
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
        item.updatedAt = Date.now();

        persist();
        updateCounterUI();
    }

    function promptReset() {
        var item = getActiveItem();
        if (!item) return;

        var modalEl = getEl('tasbeehResetModal');
        if (modalEl) {
            getEl('tbResetModalName').textContent = '“' + item.title + '”';
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

        getEl('tbModalTitle').textContent = item ? 'Edit Dhikr' : 'Add New Dhikr';
        getEl('tbFormTitle').value = item ? item.title : '';

        countMode = item && item.targetCount === 'infinite' ? 'infinite' : 'finite';
        getEl('tbFormCount').value = item && item.targetCount !== 'infinite' ? item.targetCount : 33;
        getEl('tbFormCount').disabled = countMode === 'infinite';

        getEl('tbFormCycles').value = item ? item.targetCycles : 3;

        syncChips();

        var modalEl = getEl('tasbeehModal');
        if (!editModalInstance) {
            editModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        }
        editModalInstance.show();
    }

    function saveModal() {
        var title = getEl('tbFormTitle').value.trim();
        if (!title) {
            alert('Please enter a chant title.');
            getEl('tbFormTitle').focus();
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
        renderList();

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
        renderList();
        showToast('Dhikr deleted');
    }

    /* ---------- Event Bindings ---------- */
    function bindEvents() {
        /* Open modal */
        var addBtn = getEl('tbAddBtn');
        if (addBtn) {
            addBtn.onclick = function () { openModal(null); };
        }

        var saveBtn = getEl('tbModalSaveBtn');
        if (saveBtn) {
            saveBtn.onclick = saveModal;
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
                    countInput.disabled = true;
                } else {
                    countMode = 'finite';
                    countInput.disabled = false;
                    countInput.value = val;
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

        /* List card delegations */
        var listEl = getEl('tbList');
        if (listEl) {
            listEl.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                var card = e.target.closest('[data-id]');
                if (!card) return;
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

        /* Ripple effect helper */
        function createRipple(e, container) {
            var rect = container.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var ripple = document.createElement('span');
            ripple.className = 'tb-ripple';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            container.appendChild(ripple);
            setTimeout(function () { ripple.remove(); }, 620);
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
            if (!counterView || counterView.classList.contains('d-none')) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                increment();
            } else if (e.code === 'Backspace') {
                e.preventDefault();
                undo();
            } else if (e.code === 'Escape') {
                closeCounter();
            }
        });
    }

    /* ---------- Public API ---------- */
    function init() {
        items = loadItems();
        checkDailyReset();
        persist();
        bindEvents();
        renderList();
    }

    return {
        init: init,
        render: renderList,
        openCounter: openCounter,
        closeCounter: closeCounter,
        openModal: openModal
    };
})();
