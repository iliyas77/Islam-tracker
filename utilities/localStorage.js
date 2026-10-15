/**
 * LocalStorage Database Manager for Money Monitor Positions
 * Path: utilities/localStorage.js
 * Handles all client-side database CRUD (Create, Read, Update, Delete) operations for positions.
 */
(function (window) {
    'use strict';

    const STORAGE_KEY = 'money_monitor_positions';

    const PositionsDB = {
        /**
         * Fetch all positions from localStorage
         * @returns {Array} Array of position objects
         */
        getAll: function () {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (err) {
                console.error('Error reading positions from localStorage:', err);
                return [];
            }
        },

        /**
         * Save full positions array to localStorage
         * @param {Array} positions 
         * @returns {boolean} Success status
         */
        saveAll: function (positions) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
                return true;
            } catch (err) {
                console.error('Error saving positions to localStorage:', err);
                return false;
            }
        },

        /**
         * Get position by ID
         * @param {number|string} id 
         * @returns {Object|null} Position object or null
         */
        getById: function (id) {
            const numericId = parseInt(id, 10);
            const positions = this.getAll();
            return positions.find(p => p.id === numericId) || null;
        },

        /**
         * Create a new position and save to localStorage
         * @param {Object} positionData 
         * @returns {Object|null} Created position object
         */
        create: function (positionData) {
            const positions = this.getAll();
            const qty = isNaN(parseInt(positionData.qty, 10)) || parseInt(positionData.qty, 10) <= 0 ? 100 : parseInt(positionData.qty, 10);
            const avgPrice = isNaN(parseFloat(positionData.avgPrice)) || parseFloat(positionData.avgPrice) < 0 ? 100.00 : parseFloat(positionData.avgPrice);
            const ltp = isNaN(parseFloat(positionData.ltp)) || parseFloat(positionData.ltp) < 0 ? 150.00 : parseFloat(positionData.ltp);
            const status = positionData.status || 'OPEN';

            const newPosition = {
                id: Date.now(),
                symbol: (positionData.symbol || '').toUpperCase().trim(),
                name: (positionData.name || '').trim(),
                type: positionData.type || 'Delivery',
                qty: qty,
                avgPrice: avgPrice,
                ltp: ltp,
                dayChangePct: parseFloat(positionData.dayChangePct) || 0,
                status: status,
                realizedPnl: status === 'CLOSED' ? (qty * (ltp - avgPrice)) : 0,
                createdAt: new Date().toISOString()
            };

            positions.unshift(newPosition);
            const saved = this.saveAll(positions);
            return saved ? newPosition : null;
        },

        /**
         * Update an existing position by ID in localStorage
         * @param {number|string} id 
         * @param {Object} updatedData 
         * @returns {Object|null} Updated position object
         */
        update: function (id, updatedData) {
            const numericId = parseInt(id, 10);
            const positions = this.getAll();
            const index = positions.findIndex(p => p.id === numericId);

            if (index === -1) return null;

            const existing = positions[index];
            const qty = parseInt(updatedData.qty, 10);
            const avgPrice = parseFloat(updatedData.avgPrice);
            const ltp = parseFloat(updatedData.ltp);
            const status = updatedData.status || existing.status;

            const updatedPosition = {
                ...existing,
                symbol: (updatedData.symbol || existing.symbol).toUpperCase().trim(),
                name: (updatedData.name || existing.name).trim(),
                type: updatedData.type || existing.type,
                qty: isNaN(qty) ? existing.qty : qty,
                avgPrice: isNaN(avgPrice) ? existing.avgPrice : avgPrice,
                ltp: isNaN(ltp) ? existing.ltp : ltp,
                dayChangePct: parseFloat(updatedData.dayChangePct) ?? existing.dayChangePct,
                status: status,
                updatedAt: new Date().toISOString()
            };

            if (status === 'CLOSED') {
                updatedPosition.realizedPnl = updatedPosition.qty * (updatedPosition.ltp - updatedPosition.avgPrice);
            } else {
                updatedPosition.realizedPnl = 0;
            }

            positions[index] = updatedPosition;
            const saved = this.saveAll(positions);
            return saved ? updatedPosition : null;
        },

        /**
         * Delete position by ID from localStorage
         * @param {number|string} id 
         * @returns {boolean} Success status
         */
        delete: function (id) {
            const numericId = parseInt(id, 10);
            const positions = this.getAll();
            const filtered = positions.filter(p => p.id !== numericId);

            if (filtered.length === positions.length) {
                return false;
            }

            return this.saveAll(filtered);
        },

        /**
         * Get metrics count (all, open, closed)
         * @returns {Object}
         */
        getMetrics: function () {
            const positions = this.getAll();
            return {
                all: positions.length,
                open: positions.filter(p => p.status === 'OPEN').length,
                closed: positions.filter(p => p.status === 'CLOSED').length
            };
        },

        /**
         * Clear all positions
         * @returns {boolean}
         */
        clear: function () {
            try {
                localStorage.removeItem(STORAGE_KEY);
                return true;
            } catch (err) {
                console.error('Error clearing localStorage:', err);
                return false;
            }
        }
    };

    window.PositionsDB = PositionsDB;
})(window);
