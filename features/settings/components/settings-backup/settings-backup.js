/* ============================================================
   Nur Prayer — Settings Backup & Data Management Component
   Path: features/settings/components/settings-backup/settings-backup.js
   Responsibilities:
     - Owns Data Management & Backup UI
     - Exports user data as JSON
     - Restores user data from JSON files
     - Handles database reset with safety confirmation
   ============================================================ */
'use strict';

import {
    exportBackupData, importBackupData, resetDatabase, unwrap
} from '../../settings-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const SettingsBackupTemplate = {
    element: 'settings-backup-template',
    file: 'features/settings/components/settings-backup/settings-backup.html'
};

export function SettingsBackupViewModel(params) {
    if (params instanceof SettingsBackupViewModel) return params;
    if (!(this instanceof SettingsBackupViewModel)) return new SettingsBackupViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    self.message = obs('');
    self.isError = obs(false);

    self.showMessage = function (msg, isErr) {
        self.message(msg);
        self.isError(!!isErr);
        if (_win.setTimeout) {
            _win.setTimeout(function () {
                self.message('');
            }, 4000);
        }
    };

    self.handleExportBackup = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var data = exportBackupData();
        var jsonStr = JSON.stringify(data, null, 2);

        if (_win.document && typeof _win.Blob !== 'undefined') {
            try {
                var blob = new _win.Blob([jsonStr], { type: 'application/json' });
                var url = _win.URL.createObjectURL(blob);
                var a = _win.document.createElement('a');
                a.href = url;
                a.download = 'nur-prayer-backup-' + new Date().toISOString().slice(0, 10) + '.json';
                _win.document.body.appendChild(a);
                a.click();
                _win.document.body.removeChild(a);
                _win.URL.revokeObjectURL(url);
                self.showMessage('Backup exported successfully!', false);
                return;
            } catch (_) {}
        }

        self.showMessage('Backup data generated (' + Object.keys(data.data || {}).length + ' keys)', false);
    };

    self.triggerImport = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var input = _win.document ? _win.document.getElementById('settingsBackupFileInput') : null;
        if (input) {
            input.value = '';
            input.click();
        }
    };

    self.handleFileChosen = function (vm, event) {
        var file = event && event.target && event.target.files && event.target.files[0];
        if (!file) return;

        if (typeof _win.FileReader !== 'undefined') {
            var reader = new _win.FileReader();
            reader.onload = function (e) {
                var content = e && e.target && e.target.result;
                var res = importBackupData(content);
                self.showMessage(res.message, !res.success);
            };
            reader.readAsText(file);
        }
    };

    self.handleResetDatabase = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof confirm === 'function' && !confirm('Delete ALL prayer records and cached prayer times?')) {
            return;
        }

        resetDatabase();
        self.showMessage('Database reset successfully. Starting fresh!', false);

        if (typeof p.onReset === 'function') {
            p.onReset();
        }
    };
}

if (typeof window !== 'undefined') {
    window.SettingsBackupViewModel = SettingsBackupViewModel;
}

export default {
    template: SettingsBackupTemplate,
    viewModel: SettingsBackupViewModel
};

