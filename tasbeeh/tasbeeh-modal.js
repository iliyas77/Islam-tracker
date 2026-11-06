/* ============================================================
   Nur Prayer — Digital Tasbeeh: Add / Edit Dhikr Modal Module
   Path: tasbeeh/tasbeeh-modal.js
   Handles:
     - Add / Edit Dhikr modal interaction and input binding
     - Target count chips selection (33, 99, 100, infinite)
     - Dhikr deletion with confirmation
   ============================================================ */

import { normalizeItem, persistItems, persistCalCompletions, TASBEEH_CONSTANTS } from './tasbeeh-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

function getEl(id) {
    return document.getElementById(id);
}

var uid = function () {
    if (typeof _win.uid === 'function' && _win.uid !== uid) return _win.uid();
    return 'tb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
};

var clamp = function (v, min, max) {
    if (typeof _win.clamp === 'function' && _win.clamp !== clamp) return _win.clamp(v, min, max);
    return Math.min(Math.max(v, min), max);
};

function showToast(msg, duration) {
    if (typeof _win.showToast === 'function') {
        _win.showToast(msg, duration);
    }
}

export var editModalInstance = null;

export function syncChips(countMode) {
    var chips = document.querySelectorAll('#tbCountChips button');
    var formCount = getEl('tbFormCount');
    var curVal = formCount ? Number(formCount.value) : 33;

    chips.forEach(function (btn) {
        var v = btn.dataset.count;
        var isOn = (v === 'infinite')
            ? countMode === 'infinite'
            : (countMode === 'finite' && Number(v) === curVal);
        btn.classList.toggle('active', isOn);
    });
}

export function openModal(state, id) {
    state.editingId = id || null;
    var item = null;
    if (id) {
        for (var i = 0; i < state.items.length; i++) {
            if (state.items[i].id === id) { item = state.items[i]; break; }
        }
    }

    var modalTitle = getEl('tbModalTitle');
    if (modalTitle) modalTitle.textContent = item ? 'Edit Dhikr' : 'Add New Dhikr';

    var formTitle = getEl('tbFormTitle');
    if (formTitle) formTitle.value = item ? item.title : '';

    state.countMode = (item && item.targetCount === 'infinite') ? 'infinite' : 'finite';
    var formCount = getEl('tbFormCount');
    if (formCount) {
        formCount.value = (item && item.targetCount !== 'infinite') ? item.targetCount : (TASBEEH_CONSTANTS.DEFAULT_TARGET || 33);
        formCount.disabled = (state.countMode === 'infinite');
    }

    syncChips(state.countMode);

    var delBtn = getEl('tbModalDelBtn');
    if (delBtn) {
        if (item) {
            delBtn.classList.remove('d-none');
        } else {
            delBtn.classList.add('d-none');
        }
    }

    var modalEl = getEl('tasbeehModal');
    if (modalEl) {
        if (!editModalInstance) {
            var ModalClass = _win.UIModal || (_win.bootstrap && _win.bootstrap.Modal);
            editModalInstance = ModalClass ? ModalClass.getOrCreateInstance(modalEl) : null;
            modalEl.addEventListener('hidden.bs.modal', function () {
                state.editingId = null;
                var b = getEl('tbModalDelBtn');
                if (b) b.classList.add('d-none');
            });
        }
        if (editModalInstance) editModalInstance.show();
    }
}

export function saveModal(state) {
    var formTitle = getEl('tbFormTitle');
    var title = formTitle ? formTitle.value.trim() : '';
    if (!title) {
        if (_win.alert) _win.alert('Please enter a chant title.');
        if (formTitle) formTitle.focus();
        return;
    }

    var targetCount = (state.countMode === 'infinite')
        ? 'infinite'
        : clamp(parseInt(getEl('tbFormCount').value, 10) || 33, 1, 9999);

    if (state.editingId) {
        var item = null;
        for (var i = 0; i < state.items.length; i++) {
            if (state.items[i].id === state.editingId) { item = state.items[i]; break; }
        }
        if (item) {
            item.title = title;
            item.targetCount = targetCount;
            item.updatedAt = Date.now();
            showToast('Dhikr updated');
        }
    } else {
        state.items.push(normalizeItem({
            id: uid(),
            title: title,
            targetCount: targetCount,
            updatedAt: Date.now()
        }));
        showToast('Dhikr added');
    }

    persistItems(state.items);
    if (typeof state.render === 'function') state.render();

    if (state.activeId && state.activeId === state.editingId) {
        var act = typeof state.getActiveItem === 'function' ? state.getActiveItem() : null;
        if (act) {
            var topTitleEl = getEl('tbCounterTopTitle');
            if (topTitleEl) topTitleEl.textContent = act.title;
            var titleEl = getEl('tbCounterTitle');
            if (titleEl) titleEl.textContent = act.title;
            if (typeof state.renderCalendar === 'function') state.renderCalendar();
        }
    }

    if (editModalInstance) editModalInstance.hide();
    state.editingId = null;
}

export function deleteItem(state, id) {
    var item = null;
    for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === id) { item = state.items[i]; break; }
    }
    if (!item) return false;

    if (_win.confirm && !_win.confirm('Delete “' + item.title + '”? This will remove its recorded progress.')) {
        return false;
    }

    state.items = state.items.filter(function (it) { return it.id !== id; });

    if (state.activeId === id) {
        if (typeof state.closeCounter === 'function') state.closeCounter();
    }

    if (state.calCompletions && state.calCompletions[id]) {
        delete state.calCompletions[id];
        persistCalCompletions(state.calCompletions);
    }

    persistItems(state.items);
    if (typeof state.render === 'function') state.render();
    showToast('Dhikr deleted');
    return true;
}

