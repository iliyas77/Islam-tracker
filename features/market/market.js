/* ============================================================
   Nur Prayer — Market (Stock Quote Viewer) Feature Module
   Path: features/market/market.js
   ============================================================ */

var MarketApp = (function () {
    'use strict';

    // =================================================================
    // 1. DATA: COMPREHENSIVE NSE COMPANIES BY INDUSTRY
    // =================================================================
    var NSE_COMPANIES = [
        // 1. Financial Services
        { symbol: "HDFCBANK", name: "HDFC Bank Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "ICICIBANK", name: "ICICI Bank Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "SBIN", name: "State Bank of India", industry: "Financial Services", exchange: "NSE" },
        { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "AXISBANK", name: "Axis Bank Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "PNB", name: "Punjab National Bank", industry: "Financial Services", exchange: "NSE" },
        { symbol: "BANKBARODA", name: "Bank of Baroda", industry: "Financial Services", exchange: "NSE" },
        { symbol: "SHRIRAMFIN", name: "Shriram Finance Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "CHOLAFIN", name: "Cholamandalam Investment and Finance Co Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "SBILIFE", name: "SBI Life Insurance Company Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "HDFCLIFE", name: "HDFC Life Insurance Company Ltd", industry: "Financial Services", exchange: "NSE" },
        { symbol: "MUTHOOTFIN", name: "Muthoot Finance Ltd", industry: "Financial Services", exchange: "NSE" },

        // 2. Information Technology
        { symbol: "TCS", name: "Tata Consultancy Services Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "INFY", name: "Infosys Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "HCLTECH", name: "HCL Technologies Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "WIPRO", name: "Wipro Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "TECHM", name: "Tech Mahindra Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "LTIM", name: "LTIMindtree Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "PERSISTENT", name: "Persistent Systems Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "COFORGE", name: "Coforge Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "MPHASIS", name: "Mphasis Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "TATAELXSI", name: "Tata Elxsi Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "KPITTECH", name: "KPIT Technologies Ltd", industry: "Information Technology", exchange: "NSE" },
        { symbol: "OFSS", name: "Oracle Financial Services Software Ltd", industry: "Information Technology", exchange: "NSE" },

        // 3. Automobile and Auto Components
        { symbol: "MARUTI", name: "Maruti Suzuki India Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "TATAMOTORS", name: "Tata Motors Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "M&M", name: "Mahindra & Mahindra Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "EICHERMOT", name: "Eicher Motors Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "TVSMOTOR", name: "TVS Motor Company Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "BHARATFORG", name: "Bharat Forge Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "MOTHERSON", name: "Samvardhana Motherson International Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "BOSCHLTD", name: "Bosch Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "MRF", name: "MRF Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },
        { symbol: "APOLLOTYRE", name: "Apollo Tyres Ltd", industry: "Automobile and Auto Components", exchange: "NSE" },

        // 4. Oil, Gas & Consumable Fuels
        { symbol: "RELIANCE", name: "Reliance Industries Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "COALINDIA", name: "Coal India Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "IOC", name: "Indian Oil Corporation Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "HINDPETRO", name: "Hindustan Petroleum Corporation Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "GAIL", name: "GAIL (India) Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "OIL", name: "Oil India Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },
        { symbol: "PETRONET", name: "Petronet LNG Ltd", industry: "Oil, Gas & Consumable Fuels", exchange: "NSE" },

        // 5. Healthcare
        { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "CIPLA", name: "Cipla Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "LUPIN", name: "Lupin Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "TORNTPHARM", name: "Torrent Pharmaceuticals Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "ZYDUSLIFE", name: "Zydus Lifesciences Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "MANKIND", name: "Mankind Pharma Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "MAXHEALTH", name: "Max Healthcare Institute Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "AUROPHARMA", name: "Aurobindo Pharma Ltd", industry: "Healthcare", exchange: "NSE" },
        { symbol: "BIOCON", name: "Biocon Ltd", industry: "Healthcare", exchange: "NSE" },

        // 6. Fast Moving Consumer Goods
        { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "ITC", name: "ITC Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "NESTLEIND", name: "Nestlé India Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "BRITANNIA", name: "Britannia Industries Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "GODREJCP", name: "Godrej Consumer Products Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "DABUR", name: "Dabur India Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "MARICO", name: "Marico Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "VBL", name: "Varun Beverages Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },
        { symbol: "COLPAL", name: "Colgate-Palmolive (India) Ltd", industry: "Fast Moving Consumer Goods", exchange: "NSE" },

        // 7. Metals & Mining
        { symbol: "TATASTEEL", name: "Tata Steel Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "JSWSTEEL", name: "JSW Steel Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "HINDALCO", name: "Hindalco Industries Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "JINDALSTEL", name: "Jindal Steel & Power Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "SAIL", name: "Steel Authority of India Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "VEDL", name: "Vedanta Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "NATIONALUM", name: "National Aluminium Company Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "NMDC", name: "NMDC Ltd", industry: "Metals & Mining", exchange: "NSE" },
        { symbol: "ADANIENT", name: "Adani Enterprises Ltd", industry: "Metals & Mining", exchange: "NSE" },

        // 8. Power
        { symbol: "NTPC", name: "NTPC Ltd", industry: "Power", exchange: "NSE" },
        { symbol: "POWERGRID", name: "Power Grid Corporation of India Ltd", industry: "Power", exchange: "NSE" },
        { symbol: "TATAPOWER", name: "Tata Power Company Ltd", industry: "Power", exchange: "NSE" },
        { symbol: "ADANIPOWER", name: "Adani Power Ltd", industry: "Power", exchange: "NSE" },
        { symbol: "ADANIGREEN", name: "Adani Green Energy Ltd", industry: "Power", exchange: "NSE" },
        { symbol: "JSWENERGY", name: "JSW Energy Ltd", industry: "Power", exchange: "NSE" },
        { symbol: "NHPC", name: "NHPC Ltd", industry: "Power", exchange: "NSE" },
        { symbol: "SUZLON", name: "Suzlon Energy Ltd", industry: "Power", exchange: "NSE" },

        // 9. Consumer Durables
        { symbol: "TITAN", name: "Titan Company Ltd", industry: "Consumer Durables", exchange: "NSE" },
        { symbol: "ASIANPAINT", name: "Asian Paints Ltd", industry: "Consumer Durables", exchange: "NSE" },
        { symbol: "BERGEPAINT", name: "Berger Paints India Ltd", industry: "Consumer Durables", exchange: "NSE" },
        { symbol: "HAVELLS", name: "Havells India Ltd", industry: "Consumer Durables", exchange: "NSE" },
        { symbol: "VOLTAS", name: "Voltas Ltd", industry: "Consumer Durables", exchange: "NSE" },
        { symbol: "POLYCAB", name: "Polycab India Ltd", industry: "Consumer Durables", exchange: "NSE" },
        { symbol: "DIXON", name: "Dixon Technologies (India) Ltd", industry: "Consumer Durables", exchange: "NSE" },

        // 10. Capital Goods
        { symbol: "BEL", name: "Bharat Electronics Ltd", industry: "Capital Goods", exchange: "NSE" },
        { symbol: "HAL", name: "Hindustan Aeronautics Ltd", industry: "Capital Goods", exchange: "NSE" },
        { symbol: "SIEMENS", name: "Siemens Ltd", industry: "Capital Goods", exchange: "NSE" },
        { symbol: "ABB", name: "ABB India Ltd", industry: "Capital Goods", exchange: "NSE" },
        { symbol: "BHEL", name: "Bharat Heavy Electricals Ltd", industry: "Capital Goods", exchange: "NSE" },

        // 11. Chemicals
        { symbol: "PIIND", name: "PI Industries Ltd", industry: "Chemicals", exchange: "NSE" },
        { symbol: "SRF", name: "SRF Ltd", industry: "Chemicals", exchange: "NSE" },
        { symbol: "DEEPAKNTR", name: "Deepak Nitrite Ltd", industry: "Chemicals", exchange: "NSE" },
        { symbol: "TATACHEM", name: "Tata Chemicals Ltd", industry: "Chemicals", exchange: "NSE" },
        { symbol: "UPL", name: "UPL Ltd", industry: "Chemicals", exchange: "NSE" },

        // 12. Consumer Services
        { symbol: "TRENT", name: "Trent Ltd", industry: "Consumer Services", exchange: "NSE" },
        { symbol: "ZOMATO", name: "Zomato Ltd", industry: "Consumer Services", exchange: "NSE" },
        { symbol: "NAUKRI", name: "Info Edge (India) Ltd", industry: "Consumer Services", exchange: "NSE" },
        { symbol: "NYKAA", name: "FSN E-Commerce Ventures Ltd", industry: "Consumer Services", exchange: "NSE" },
        { symbol: "IRCTC", name: "Indian Railway Catering and Tourism Corp", industry: "Consumer Services", exchange: "NSE" },

        // 13. Construction Materials
        { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd", industry: "Construction Materials", exchange: "NSE" },
        { symbol: "GRASIM", name: "Grasim Industries Ltd", industry: "Construction Materials", exchange: "NSE" },
        { symbol: "AMBUJACEM", name: "Ambuja Cements Ltd", industry: "Construction Materials", exchange: "NSE" },
        { symbol: "ACC", name: "ACC Ltd", industry: "Construction Materials", exchange: "NSE" },
        { symbol: "SHREECEM", name: "Shree Cement Ltd", industry: "Construction Materials", exchange: "NSE" },

        // 14. Telecommunication
        { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", industry: "Telecommunication", exchange: "NSE" },
        { symbol: "INDUSTOWER", name: "Indus Towers Ltd", industry: "Telecommunication", exchange: "NSE" },
        { symbol: "IDEA", name: "Vodafone Idea Ltd", industry: "Telecommunication", exchange: "NSE" },
        { symbol: "TATACOMM", name: "Tata Communications Ltd", industry: "Telecommunication", exchange: "NSE" },

        // 15. Construction & Infrastructure
        { symbol: "LT", name: "Larsen & Toubro Ltd", industry: "Construction", exchange: "NSE" },
        { symbol: "IRB", name: "IRB Infrastructure Developers Ltd", industry: "Construction", exchange: "NSE" },

        // 16. Services & Logistics
        { symbol: "ADANIPORTS", name: "Adani Ports and SEZ Ltd", industry: "Services", exchange: "NSE" },
        { symbol: "GMRINFRA", name: "GMR Airports Infrastructure Ltd", industry: "Services", exchange: "NSE" }
    ];

    var BENCHMARK_SYMBOLS = [
        { symbol: "RELIANCE", name: "Reliance Industries Ltd", industry: "Oil & Gas" },
        { symbol: "TCS", name: "Tata Consultancy Services Ltd", industry: "IT" },
        { symbol: "HDFCBANK", name: "HDFC Bank Ltd", industry: "Banking" },
        { symbol: "INFY", name: "Infosys Ltd", industry: "IT" },
        { symbol: "ICICIBANK", name: "ICICI Bank Ltd", industry: "Banking" },
        { symbol: "TATAMOTORS", name: "Tata Motors Ltd", industry: "Auto" }
    ];

    // Sorted list of all unique industries with their company count and icons
    var ALL_INDUSTRIES = (function () {
        var set = {};
        NSE_COMPANIES.forEach(function (c) {
            set[c.industry] = (set[c.industry] || 0) + 1;
        });

        function getIcon(name) {
            if (name.indexOf('Financial') !== -1) return '🏦';
            if (name.indexOf('Technology') !== -1) return '💻';
            if (name.indexOf('Automobile') !== -1) return '🚗';
            if (name.indexOf('Healthcare') !== -1) return '💊';
            if (name.indexOf('Oil') !== -1) return '🛢️';
            if (name.indexOf('Consumer Goods') !== -1) return '🛒';
            if (name.indexOf('Metals') !== -1) return '🏗️';
            if (name.indexOf('Power') !== -1) return '⚡';
            if (name.indexOf('Durables') !== -1) return '💎';
            if (name.indexOf('Capital Goods') !== -1) return '🛡️';
            if (name.indexOf('Chemicals') !== -1) return '🧪';
            if (name.indexOf('Consumer Services') !== -1) return '🛍️';
            if (name.indexOf('Construction Materials') !== -1) return '🧱';
            if (name.indexOf('Telecommunication') !== -1) return '📡';
            if (name.indexOf('Construction') !== -1) return '🏛️';
            return '📦';
        }

        return Object.keys(set).sort().map(function (ind) {
            return {
                name: ind,
                count: set[ind],
                icon: getIcon(ind)
            };
        });
    })();

    // =================================================================
    // 2. REAL-TIME FEED CONFIGURATION & PROXIES
    // =================================================================
    var WORKER_PROXY_URL = "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev";
    var REQUEST_TIMEOUT_MS = 3500;
    var CACHE_PREFIX = 'mkt_quote_cache_';
    var WATCHLIST_STORAGE_KEY = 'mkt_watchlist_groups';
    var YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

    function getProxies() {
        var proxies = [];

        var customWorker = localStorage.getItem('market_worker_proxy');
        var workerUrl = (customWorker && customWorker.trim()) || WORKER_PROXY_URL;
        if (workerUrl && workerUrl.indexOf("YOUR-WORKER-NAME") === -1) {
            proxies.push({
                name: "Cloudflare Worker",
                type: "raw",
                build: function (url) { return workerUrl.replace(/\/+$/, '') + "/?url=" + encodeURIComponent(url); }
            });
        }

        proxies.push({
            name: "allorigins",
            type: "allorigins",
            build: function (url) { return "https://api.allorigins.win/get?url=" + encodeURIComponent(url) + "&_t=" + Date.now(); }
        });

        proxies.push({
            name: "codetabs",
            type: "raw",
            build: function (url) { return "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(url); }
        });

        return proxies;
    }

    // =================================================================
    // 3. CACHING & NUMBER HELPERS
    // =================================================================
    function formatNumber(value, decimals) {
        if (typeof decimals === 'undefined') decimals = 2;
        var num = parseFloat(value);
        if (!isFinite(num)) return '—';
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function cacheQuote(sym, exch, item) {
        try {
            localStorage.setItem(CACHE_PREFIX + sym + '_' + exch, JSON.stringify({
                data: item,
                timestamp: Date.now()
            }));
        } catch (_) {}
    }

    function getCachedQuote(sym, exch) {
        try {
            var raw = localStorage.getItem(CACHE_PREFIX + sym + '_' + exch);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && parsed.data) return parsed.data;
            }
        } catch (_) {}
        return null;
    }

    function fetchWithTimeout(url, ms, parentSignal) {
        if (!ms) ms = REQUEST_TIMEOUT_MS;
        var controller = new AbortController();
        var timer = setTimeout(function () {
            controller.abort();
        }, ms);

        if (parentSignal) {
            parentSignal.addEventListener('abort', function () {
                clearTimeout(timer);
                controller.abort();
            });
        }

        return fetch(url, { signal: controller.signal })
            .then(function (resp) {
                return resp.text().then(function (text) {
                    clearTimeout(timer);
                    return { ok: resp.ok, status: resp.status, text: text };
                });
            })
            .catch(function (err) {
                clearTimeout(timer);
                throw err;
            });
    }

    function fetchJsonViaProxies(targetUrl, parentSignal) {
        var proxies = getProxies();
        if (proxies.length === 0) {
            return Promise.reject(new Error('No proxy configured.'));
        }

        var attempts = proxies.map(function (proxy) {
            var proxyUrl = proxy.build(targetUrl);
            return fetchWithTimeout(proxyUrl, REQUEST_TIMEOUT_MS, parentSignal).then(function (result) {
                if (!result.ok) throw new Error(proxy.name + ' HTTP ' + result.status);

                var trimmed = result.text.trim();
                if (!trimmed || trimmed.charAt(0) === '<') throw new Error(proxy.name + ' returned HTML');

                var json;
                try {
                    json = JSON.parse(trimmed);
                } catch (e) {
                    throw new Error(proxy.name + ' invalid JSON');
                }

                if (proxy.type === 'allorigins' && json && typeof json.contents === 'string') {
                    if (json.status && json.status.http_code && json.status.http_code !== 200) {
                        throw new Error('AllOrigins target HTTP ' + json.status.http_code);
                    }
                    try {
                        json = JSON.parse(json.contents);
                    } catch (e) {
                        throw new Error('AllOrigins content JSON parse failed');
                    }
                }

                return json;
            });
        });

        if (typeof Promise.any === 'function') {
            return Promise.any(attempts);
        } else {
            return new Promise(function (resolve, reject) {
                var errors = [];
                var remaining = attempts.length;
                attempts.forEach(function (p) {
                    p.then(resolve).catch(function (err) {
                        errors.push(err);
                        remaining--;
                        if (remaining === 0) reject(errors[0] || new Error('All proxies failed'));
                    });
                });
            });
        }
    }

    // =================================================================
    // 4. WATCHLIST STORAGE
    // =================================================================
    var DEFAULT_GROUPS = [
        {
            id: 'grp_fav',
            name: 'Favorites',
            icon: '⭐',
            symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY']
        },
        {
            id: 'grp_tech',
            name: 'Tech Picks',
            icon: '💻',
            symbols: ['TCS', 'INFY', 'HCLTECH', 'WIPRO']
        }
    ];

    function loadGroups() {
        try {
            var raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (_) {}
        saveGroups(DEFAULT_GROUPS);
        return DEFAULT_GROUPS.slice();
    }

    function saveGroups(groupsList) {
        try {
            localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(groupsList));
        } catch (_) {}
    }

    // =================================================================
    // 5. APPLICATION STATE
    // =================================================================
    var currentTab = 'feed'; // 'feed' | 'watchlist' | 'industries'
    var feedSearchQuery = '';
    var industrySearchQuery = '';
    var selectedIndustry = null; // null = viewing complete industries list; string = viewing companies of selected industry
    var companySearchQuery = ''; // Search query to filter companies within selected industry
    var groups = loadGroups();
    var isCreatingGroup = false;
    var fetchingSymbols = {};
    var sheetCurrentGroupId = null;
    var nifty50IndexData = getCachedQuote('^NSEI', 'NSE') || null;
    var isFetchingIndex = false;

    function countAllWatchlistStocks() {
        var set = {};
        groups.forEach(function (g) {
            (g.symbols || []).forEach(function (s) { set[s] = true; });
        });
        return Object.keys(set).length;
    }

    function isStockInAnyGroup(symbol) {
        for (var i = 0; i < groups.length; i++) {
            if ((groups[i].symbols || []).indexOf(symbol) !== -1) return true;
        }
        return false;
    }

    // =================================================================
    // 6. REAL-TIME FEED ENGINE
    // =================================================================
    function fetchNiftyIndexLive(callback) {
        var targetUrl = YAHOO_BASE + "%5ENSEI?range=1d&interval=1d";
        isFetchingIndex = true;
        updateNiftyIndexUI();

        fetchJsonViaProxies(targetUrl).then(function (data) {
            isFetchingIndex = false;
            var res = data && data.chart && data.chart.result && data.chart.result[0];
            if (!res || !res.meta) throw new Error('Index result empty');

            var meta = res.meta;
            var price = meta.regularMarketPrice;
            var prevClose = meta.chartPreviousClose || meta.previousClose;
            var change = (isFinite(price) && isFinite(prevClose)) ? (price - prevClose) : null;
            var changePercent = (change !== null && prevClose) ? ((change / prevClose) * 100) : null;

            nifty50IndexData = {
                price: price,
                prevClose: prevClose,
                change: change,
                changePercent: changePercent,
                high: meta.regularMarketDayHigh,
                low: meta.regularMarketDayLow,
                timestamp: Date.now()
            };

            cacheQuote('^NSEI', 'NSE', nifty50IndexData);
            updateNiftyIndexUI();
            if (typeof callback === 'function') callback(null, nifty50IndexData);

        }).catch(function (err) {
            isFetchingIndex = false;
            console.warn('[market] Real-time Nifty 50 Index error:', err.message);
            updateNiftyIndexUI();
            if (typeof callback === 'function') callback(err);
        });
    }

    function updateNiftyIndexUI() {
        var indexPriceEl = $('mktIndexPrice');
        var indexChangeEl = $('mktIndexChange');
        var indexHighEl = $('mktIndexHigh');
        var indexLowEl = $('mktIndexLow');
        var indexStatusEl = $('mktIndexStatus');

        if (!indexPriceEl) return;

        if (isFetchingIndex) {
            if (indexStatusEl) indexStatusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-gr-accent me-1"></i>Streaming live feed…';
            return;
        }

        if (nifty50IndexData && isFinite(nifty50IndexData.price)) {
            indexPriceEl.textContent = formatNumber(nifty50IndexData.price);
            if (nifty50IndexData.change !== null && indexChangeEl) {
                var isPos = nifty50IndexData.change >= 0;
                var sign = isPos ? '+' : '';
                indexChangeEl.textContent = sign + formatNumber(nifty50IndexData.change) + ' (' + sign + formatNumber(nifty50IndexData.changePercent) + '%)';
                indexChangeEl.className = 'badge rounded-pill fs-6 ' + (isPos ? 'bg-gr-success-soft text-gr-success' : 'bg-gr-danger-soft text-gr-danger');
            }
            if (indexHighEl && isFinite(nifty50IndexData.high)) indexHighEl.textContent = 'H: ₹' + formatNumber(nifty50IndexData.high);
            if (indexLowEl && isFinite(nifty50IndexData.low)) indexLowEl.textContent = 'L: ₹' + formatNumber(nifty50IndexData.low);

            var timeStr = new Date(nifty50IndexData.timestamp).toLocaleTimeString();
            if (indexStatusEl) indexStatusEl.innerHTML = '<span class="text-success"><i class="fa-solid fa-circle me-1 small"></i>Live Feed</span> <span class="text-gr-muted ms-1">(' + timeStr + ')</span>';
        } else {
            indexPriceEl.textContent = '—';
            if (indexChangeEl) indexChangeEl.textContent = 'Live Feed Connecting…';
            if (indexStatusEl) indexStatusEl.innerHTML = '<button type="button" class="btn btn-sm btn-link p-0 text-gr-accent text-decoration-none" data-act="mkt-refresh-feed"><i class="fa-solid fa-rotate me-1"></i>Connect Live Feed</button>';
        }
    }

    function fetchSinglePrice(symbol, exch, callback) {
        if (!exch) exch = 'NS';
        var yahooSymbol = symbol + '.' + exch;
        var targetUrl = YAHOO_BASE + encodeURIComponent(yahooSymbol) + "?range=1d&interval=1d";

        fetchingSymbols[symbol] = true;
        updateStockCardPriceUI(symbol);

        fetchJsonViaProxies(targetUrl).then(function (data) {
            delete fetchingSymbols[symbol];
            if (data && data.chart && data.chart.error) {
                throw new Error(data.chart.error.description || 'Data unavailable');
            }
            var res = data && data.chart && data.chart.result && data.chart.result[0];
            if (!res || !res.meta) throw new Error('Quote result empty');

            var meta = res.meta;
            var price = meta.regularMarketPrice;
            var prevClose = meta.chartPreviousClose || meta.previousClose;
            var change = (isFinite(price) && isFinite(prevClose)) ? (price - prevClose) : null;
            var changePercent = (change !== null && prevClose) ? ((change / prevClose) * 100) : null;

            var quoteData = {
                price: price,
                prevClose: prevClose,
                change: change,
                changePercent: changePercent,
                high: meta.regularMarketDayHigh,
                low: meta.regularMarketDayLow,
                volume: meta.regularMarketVolume,
                open: meta.regularMarketOpen,
                timestamp: Date.now()
            };

            cacheQuote(symbol, exch === 'NS' ? 'NSE' : 'BSE', quoteData);
            updateStockCardPriceUI(symbol);
            if (typeof callback === 'function') callback(null, quoteData);

        }).catch(function (err) {
            delete fetchingSymbols[symbol];
            console.warn('[market] Real-time price error for ' + symbol + ':', err.message);
            updateStockCardPriceUI(symbol);
            if (typeof callback === 'function') callback(err);
        });
    }

    function updateStockCardPriceUI(symbol) {
        var quote = getCachedQuote(symbol, 'NSE');
        var isFetching = !!fetchingSymbols[symbol];

        var priceNodes = document.querySelectorAll('[data-mkt-price-for="' + symbol + '"]');
        priceNodes.forEach(function (el) {
            if (isFetching) {
                el.innerHTML = '<span class="text-gr-muted small"><i class="fa-solid fa-spinner fa-spin me-1 text-gr-accent"></i>Live feed…</span>';
                return;
            }
            if (quote && isFinite(quote.price)) {
                var changeHtml = '';
                if (quote.change !== null) {
                    var isPos = quote.change >= 0;
                    var sign = isPos ? '+' : '';
                    var badgeClass = isPos ? 'bg-gr-success-soft text-gr-success' : 'bg-gr-danger-soft text-gr-danger';
                    changeHtml = ' <span class="badge rounded-pill ' + badgeClass + ' ms-1" style="font-size:11px">' +
                        sign + formatNumber(quote.change) + ' (' + sign + formatNumber(quote.changePercent) + '%)' +
                        '</span>';
                }
                el.innerHTML = '<span class="fw-bold fs-6 text-gr1">₹' + formatNumber(quote.price) + '</span>' + changeHtml;
            } else {
                el.innerHTML = '<button type="button" class="btn btn-sm btn-light border-gr rounded-pill py-0 px-2 text-gr-accent small" data-act="mkt-fetch-single" data-symbol="' + symbol + '" data-ref="page.market.companies.card-' + symbol + '.fetch-btn">' +
                    '<i class="fa-solid fa-bolt me-1"></i>Fetch Live' +
                    '</button>';
            }
        });
    }

    function autoFetchVisibleCompanies(companiesList) {
        if (!companiesList || companiesList.length === 0) return;

        var symbols = companiesList.map(function (c) { return c.symbol; });
        var idx = 0;
        function next() {
            if (idx >= symbols.length) return;
            var sym = symbols[idx++];
            fetchSinglePrice(sym, 'NS', function () {
                setTimeout(next, 250);
            });
        }
        next();
    }

    // =================================================================
    // 7. SYNC BOTTOM NAVIGATION BAR
    // =================================================================
    function syncBottomNav() {
        var navFeed = $('mktNavFeed');
        var navWatchlist = $('mktNavWatchlist');
        var navIndustries = $('mktNavIndustries');

        if (navFeed) {
            navFeed.className = 'nav-tab flex-fill d-flex flex-column align-items-center justify-content-center text-decoration-none border-0 bg-transparent ' +
                (currentTab === 'feed' ? 'text-success fw-bold' : 'text-secondary');
        }
        if (navWatchlist) {
            navWatchlist.className = 'nav-tab flex-fill d-flex flex-column align-items-center justify-content-center text-decoration-none border-0 bg-transparent ' +
                (currentTab === 'watchlist' ? 'text-success fw-bold' : 'text-secondary');
        }
        if (navIndustries) {
            navIndustries.className = 'nav-tab flex-fill d-flex flex-column align-items-center justify-content-center text-decoration-none border-0 bg-transparent ' +
                (currentTab === 'industries' ? 'text-success fw-bold' : 'text-secondary');
        }
    }

    // =================================================================
    // 8. TAB 1: FEED TAB
    // =================================================================
    function renderFeedTab() {
        // Nifty 50 Index Benchmark Card
        var indexPrice = (nifty50IndexData && isFinite(nifty50IndexData.price)) ? formatNumber(nifty50IndexData.price) : '—';
        var indexChange = 'Live Feed Connecting…';
        var indexChangeClass = 'badge rounded-pill fs-6 bg-gr-soft text-gr-muted';
        if (nifty50IndexData && nifty50IndexData.change !== null) {
            var isPos = nifty50IndexData.change >= 0;
            var sign = isPos ? '+' : '';
            indexChange = sign + formatNumber(nifty50IndexData.change) + ' (' + sign + formatNumber(nifty50IndexData.changePercent) + '%)';
            indexChangeClass = 'badge rounded-pill fs-6 ' + (isPos ? 'bg-gr-success-soft text-gr-success' : 'bg-gr-danger-soft text-gr-danger');
        }

        var niftyCardHtml = '' +
            '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white mb-3" data-ref="page.market.feed.nifty-card">' +
            '  <div class="d-flex align-items-center justify-content-between mb-2" data-ref="page.market.feed.nifty-card.top">' +
            '    <div class="d-flex align-items-center gap-2">' +
            '      <span class="modal-icon-badge" style="width:38px;height:38px;background:var(--blue500-soft)" data-ref="page.market.feed.nifty-card.icon">' +
            '        <i class="fa-solid fa-chart-line text-blue500"></i>' +
            '      </span>' +
            '      <div>' +
            '        <div class="fw-bold text-gr1 fs-6" data-ref="page.market.feed.nifty-card.title">NIFTY 50 Benchmark</div>' +
            '        <div class="small" id="mktIndexStatus" data-ref="page.market.feed.nifty-card.status"><span class="text-success"><i class="fa-solid fa-circle me-1 small"></i>Live Feed</span></div>' +
            '      </div>' +
            '    </div>' +
            '    <button type="button" class="btn btn-sm btn-light border-0 text-gr-accent rounded-circle p-1" data-act="mkt-refresh-feed" title="Refresh Live Feed" data-ref="page.market.feed.nifty-card.refresh-btn">' +
            '      <i class="fa-solid fa-rotate-right"></i>' +
            '    </button>' +
            '  </div>' +
            '  <div class="d-flex align-items-baseline justify-content-between pt-1 border-top border-gr" data-ref="page.market.feed.nifty-card.values">' +
            '    <div class="d-flex align-items-baseline gap-2">' +
            '      <span class="fw-bold fs-3 text-gr1" id="mktIndexPrice" data-ref="page.market.feed.nifty-card.price">' + indexPrice + '</span>' +
            '      <span class="' + indexChangeClass + '" id="mktIndexChange" data-ref="page.market.feed.nifty-card.change">' + indexChange + '</span>' +
            '    </div>' +
            '    <div class="small text-gr-muted text-end" data-ref="page.market.feed.nifty-card.range">' +
            '      <span id="mktIndexHigh">' + (nifty50IndexData && nifty50IndexData.high ? 'H: ₹' + formatNumber(nifty50IndexData.high) : '') + '</span> ' +
            '      <span id="mktIndexLow">' + (nifty50IndexData && nifty50IndexData.low ? 'L: ₹' + formatNumber(nifty50IndexData.low) : '') + '</span>' +
            '    </div>' +
            '  </div>' +
            '</div>';

        // Search Bar with Search button & Quick chips
        var searchHtml = '' +
            '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white mb-3" data-ref="page.market.feed.search-card">' +
            '  <div class="fw-bold text-gr1 fs-6 mb-2" data-ref="page.market.feed.search-card.title">' +
            '    <i class="fa-solid fa-magnifying-glass text-gr-accent me-1"></i>Search Real-Time Quote' +
            '  </div>' +
            '  <div class="input-group mb-2" data-ref="page.market.feed.search-group">' +
            '    <input type="text" id="mktFeedSearchInput" class="form-control bg-gr-input border-gr text-gr1" placeholder="e.g. RELIANCE, TCS, INFY" value="' + feedSearchQuery + '" data-ref="page.market.feed.search-input">' +
            '    <button type="button" class="btn btn-success fw-bold px-3" data-act="mkt-feed-search-submit" data-ref="page.market.feed.search-btn">Get Quote</button>' +
            '  </div>' +
            '  <div class="d-flex gap-1 overflow-auto py-1" data-ref="page.market.feed.quick-chips">' +
            '    <button type="button" class="btn btn-sm btn-light border rounded-pill fw-semibold px-2 py-1 small text-nowrap text-gr1" data-act="mkt-quick-symbol" data-symbol="RELIANCE">RELIANCE</button>' +
            '    <button type="button" class="btn btn-sm btn-light border rounded-pill fw-semibold px-2 py-1 small text-nowrap text-gr1" data-act="mkt-quick-symbol" data-symbol="TCS">TCS</button>' +
            '    <button type="button" class="btn btn-sm btn-light border rounded-pill fw-semibold px-2 py-1 small text-nowrap text-gr1" data-act="mkt-quick-symbol" data-symbol="INFY">INFY</button>' +
            '    <button type="button" class="btn btn-sm btn-light border rounded-pill fw-semibold px-2 py-1 small text-nowrap text-gr1" data-act="mkt-quick-symbol" data-symbol="HDFCBANK">HDFCBANK</button>' +
            '    <button type="button" class="btn btn-sm btn-light border rounded-pill fw-semibold px-2 py-1 small text-nowrap text-gr1" data-act="mkt-quick-symbol" data-symbol="TATAMOTORS">TATAMOTORS</button>' +
            '  </div>' +
            '</div>';

        // Benchmark Movers Live Feed List
        var moversHtml = '' +
            '<div class="d-flex align-items-center justify-content-between px-1 mb-2" data-ref="page.market.feed.movers-header">' +
            '  <div class="small fw-semibold text-gr-muted" data-ref="page.market.feed.movers-title">' +
            '    <span class="text-gr1 fw-bold">Live Benchmark Feed</span> (NSE)' +
            '  </div>' +
            '  <button type="button" class="btn btn-sm btn-light border-0 text-gr-accent fw-semibold" data-act="mkt-refresh-feed" data-ref="page.market.feed.refresh-btn">' +
            '    <i class="fa-solid fa-rotate me-1"></i>Refresh Feed' +
            '  </button>' +
            '</div>' +
            '<div class="d-flex flex-column gap-2" data-ref="page.market.feed.movers-list">';

        BENCHMARK_SYMBOLS.forEach(function (c) {
            var quote = getCachedQuote(c.symbol, 'NSE');
            var isFetching = !!fetchingSymbols[c.symbol];

            var priceContent = '';
            if (isFetching) {
                priceContent = '<span class="text-gr-muted small"><i class="fa-solid fa-spinner fa-spin me-1 text-gr-accent"></i>Live feed…</span>';
            } else if (quote && isFinite(quote.price)) {
                var changeHtml = '';
                if (quote.change !== null) {
                    var isPos = quote.change >= 0;
                    var sign = isPos ? '+' : '';
                    var badgeClass = isPos ? 'bg-gr-success-soft text-gr-success' : 'bg-gr-danger-soft text-gr-danger';
                    changeHtml = ' <span class="badge rounded-pill ' + badgeClass + ' ms-1" style="font-size:11px">' +
                        sign + formatNumber(quote.change) + ' (' + sign + formatNumber(quote.changePercent) + '%)' +
                        '</span>';
                }
                priceContent = '<span class="fw-bold fs-6 text-gr1">₹' + formatNumber(quote.price) + '</span>' + changeHtml;
            } else {
                priceContent = '<button type="button" class="btn btn-sm btn-light border-gr rounded-pill py-0 px-2 text-gr-accent small" data-act="mkt-fetch-single" data-symbol="' + c.symbol + '">' +
                    '<i class="fa-solid fa-bolt me-1"></i>Fetch Live' +
                    '</button>';
            }

            moversHtml += '' +
                '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white" data-ref="page.market.feed.card-' + c.symbol + '">' +
                '  <div class="d-flex align-items-center justify-content-between mb-2">' +
                '    <div class="flex-grow-1 min-w-0 pe-2">' +
                '      <div class="fw-bold text-gr1 fs-6 text-truncate">' + c.name + '</div>' +
                '      <div class="d-flex align-items-center gap-1 mt-1">' +
                '        <span class="badge bg-gr-soft text-gr1 border-gr fw-semibold">' + c.symbol + ' · NSE</span>' +
                '        <span class="badge bg-blue500-soft text-blue500 fw-normal">' + c.industry + '</span>' +
                '      </div>' +
                '    </div>' +
                '    <div>' +
                '      <button type="button" class="btn btn-sm btn-outline-success rounded-pill px-2 py-1 small fw-semibold" data-act="mkt-add-to-wl" data-symbol="' + c.symbol + '">' +
                '        <i class="fa-solid fa-plus me-1"></i>Watchlist' +
                '      </button>' +
                '    </div>' +
                '  </div>' +
                '  <div class="d-flex align-items-center justify-content-between pt-2 border-top border-gr">' +
                '    <div class="d-flex align-items-center" data-mkt-price-for="' + c.symbol + '">' +
                priceContent +
                '    </div>' +
                '    <button type="button" class="btn btn-sm btn-light border-0 text-gr-muted rounded-circle p-1" data-act="mkt-fetch-single" data-symbol="' + c.symbol + '" title="Refresh Live Quote">' +
                '      <i class="fa-solid fa-rotate-right"></i>' +
                '    </button>' +
                '  </div>' +
                '</div>';
        });
        moversHtml += '</div>';

        return '' +
            '<div class="d-flex flex-column gap-2" data-ref="page.market.feed.container">' +
            niftyCardHtml +
            searchHtml +
            moversHtml +
            '</div>';
    }

    // =================================================================
    // 9. TAB 2: WATCHLIST TAB
    // =================================================================
    function renderWatchlistTab() {
        var createGroupFormHtml = '';
        if (isCreatingGroup) {
            createGroupFormHtml = '' +
                '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white mb-3" data-ref="page.market.watchlist.new-group-card">' +
                '  <div class="d-flex align-items-center justify-content-between mb-2" data-ref="page.market.watchlist.new-group-card.title-row">' +
                '    <div class="fw-bold text-gr1 fs-6" data-ref="page.market.watchlist.new-group-card.title">' +
                '      <i class="fa-solid fa-folder-plus text-success me-1"></i>Create New Group' +
                '    </div>' +
                '    <button type="button" class="btn-close" data-act="mkt-cancel-group" data-ref="page.market.watchlist.new-group-card.close-btn"></button>' +
                '  </div>' +
                '  <div class="mb-2" data-ref="page.market.watchlist.new-group-card.name-field">' +
                '    <label class="form-label small text-gr-muted mb-1">Group Name</label>' +
                '    <input type="text" id="mktNewGroupName" class="form-control bg-gr-input border-gr text-gr1" placeholder="e.g. Banking Stocks, Tech Picks, Long Term" data-ref="page.market.watchlist.new-group-card.name-input">' +
                '  </div>' +
                '  <div class="d-flex gap-2 justify-content-end" data-ref="page.market.watchlist.new-group-card.actions">' +
                '    <button type="button" class="btn btn-sm btn-light border-gr rounded-pill px-3" data-act="mkt-cancel-group">Cancel</button>' +
                '    <button type="button" class="btn btn-sm btn-success rounded-pill px-3 fw-bold" data-act="mkt-save-group">Create Group</button>' +
                '  </div>' +
                '</div>';
        }

        var groupsListHtml = '';
        if (groups.length === 0) {
            groupsListHtml = '' +
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white my-3" data-ref="page.market.watchlist.empty-state">' +
                '  <div class="mb-2" data-ref="page.market.watchlist.empty-state.icon-wrap">' +
                '    <i class="fa-solid fa-layer-group fs-1 text-gr-muted opacity-50"></i>' +
                '  </div>' +
                '  <h6 class="fw-bold text-gr1 mb-1">No Watchlist Groups Yet</h6>' +
                '  <p class="text-gr-muted small mb-3">Create custom groups to organize your favorite companies.</p>' +
                '  <div><button type="button" class="btn btn-success rounded-pill px-4 fw-bold" data-act="mkt-new-group-btn"><i class="fa-solid fa-plus me-1"></i>Create First Group</button></div>' +
                '</div>';
        } else {
            groupsListHtml = '<div class="d-flex flex-column gap-3" data-ref="page.market.watchlist.groups-list">';
            groups.forEach(function (g) {
                var stockCount = (g.symbols || []).length;

                var stocksListHtml = '';
                if (stockCount === 0) {
                    stocksListHtml = '' +
                        '<div class="p-3 text-center rounded-3 bg-gr-soft border-gr my-2" data-ref="page.market.watchlist.group-' + g.id + '.empty">' +
                        '  <div class="small text-gr-muted mb-2">No companies in this group yet.</div>' +
                        '  <button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3" data-act="mkt-group-add-company" data-group-id="' + g.id + '">' +
                        '    <i class="fa-solid fa-plus me-1"></i>Add Company' +
                        '  </button>' +
                        '</div>';
                } else {
                    stocksListHtml = '<div class="d-flex flex-column gap-2 mt-2" data-ref="page.market.watchlist.group-' + g.id + '.stocks">';
                    (g.symbols || []).forEach(function (sym) {
                        var companyInfo = NSE_COMPANIES.find(function (item) { return item.symbol === sym; }) || {
                            symbol: sym,
                            name: sym,
                            industry: 'Stock'
                        };
                        var quote = getCachedQuote(sym, 'NSE');
                        var isFetching = !!fetchingSymbols[sym];

                        var priceContent = '';
                        if (isFetching) {
                            priceContent = '<span class="text-gr-muted small"><i class="fa-solid fa-spinner fa-spin me-1 text-gr-accent"></i>Live feed…</span>';
                        } else if (quote && isFinite(quote.price)) {
                            var changeHtml = '';
                            if (quote.change !== null) {
                                var isPos = quote.change >= 0;
                                var sign = isPos ? '+' : '';
                                var badgeClass = isPos ? 'bg-gr-success-soft text-gr-success' : 'bg-gr-danger-soft text-gr-danger';
                                changeHtml = ' <span class="badge rounded-pill ' + badgeClass + ' ms-1" style="font-size:11px">' +
                                    sign + formatNumber(quote.change) + ' (' + sign + formatNumber(quote.changePercent) + '%)' +
                                    '</span>';
                            }
                            priceContent = '<span class="fw-bold fs-6 text-gr1">₹' + formatNumber(quote.price) + '</span>' + changeHtml;
                        } else {
                            priceContent = '<button type="button" class="btn btn-sm btn-light border-gr rounded-pill py-0 px-2 text-gr-accent small" data-act="mkt-fetch-single" data-symbol="' + sym + '">' +
                                '<i class="fa-solid fa-bolt me-1"></i>Fetch Live' +
                                '</button>';
                        }

                        stocksListHtml += '' +
                            '<div class="p-2 rounded-3 bg-gr-soft border-gr d-flex align-items-center justify-content-between gap-2" data-ref="page.market.watchlist.group-' + g.id + '.stock-' + sym + '">' +
                            '  <div class="flex-grow-1 min-w-0">' +
                            '    <div class="d-flex align-items-center gap-1">' +
                            '      <span class="fw-bold text-gr1 small text-truncate">' + companyInfo.name + '</span>' +
                            '      <span class="badge bg-white text-gr1 border-gr" style="font-size:10px">' + sym + '</span>' +
                            '    </div>' +
                            '    <div class="d-flex align-items-center justify-content-between mt-1">' +
                            '      <span class="badge bg-blue500-soft text-blue500 fw-normal" style="font-size:10px">' + companyInfo.industry + '</span>' +
                            '      <div class="d-flex align-items-center" data-mkt-price-for="' + sym + '">' +
                            priceContent +
                            '      </div>' +
                            '    </div>' +
                            '  </div>' +
                            '  <div class="flex-shrink-0">' +
                            '    <button type="button" class="btn btn-sm btn-light border-0 text-gr-danger rounded-circle p-1" data-act="mkt-group-remove-stock" data-group-id="' + g.id + '" data-symbol="' + sym + '" title="Remove ' + sym + ' from ' + g.name + '">' +
                            '      <i class="fa-solid fa-xmark fs-6"></i>' +
                            '    </button>' +
                            '  </div>' +
                            '</div>';
                    });
                    stocksListHtml += '</div>';
                }

                groupsListHtml += '' +
                    '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white" data-ref="page.market.watchlist.group-' + g.id + '">' +
                    '  <div class="d-flex align-items-center justify-content-between pb-2 border-bottom border-gr">' +
                    '    <div class="d-flex align-items-center gap-2">' +
                    '      <span class="fs-5">' + (g.icon || '📁') + '</span>' +
                    '      <div>' +
                    '        <div class="fw-bold text-gr1 fs-6">' + g.name + '</div>' +
                    '        <div class="small text-gr-muted">' + stockCount + ' ' + (stockCount === 1 ? 'company' : 'companies') + '</div>' +
                    '      </div>' +
                    '    </div>' +
                    '    <div class="d-flex align-items-center gap-1">' +
                    '      <button type="button" class="btn btn-sm btn-success rounded-pill px-3 py-1 fw-semibold small" data-act="mkt-group-add-company" data-group-id="' + g.id + '">' +
                    '        <i class="fa-solid fa-plus me-1"></i>Add Company' +
                    '      </button>' +
                    '      <button type="button" class="btn btn-sm btn-light border-0 text-gr-muted rounded-circle p-1" data-act="mkt-group-delete" data-group-id="' + g.id + '" title="Delete Group">' +
                    '        <i class="fa-solid fa-trash-can"></i>' +
                    '      </button>' +
                    '    </div>' +
                    '  </div>' +
                    stocksListHtml +
                    '</div>';
            });
            groupsListHtml += '</div>';
        }

        return '' +
            '<div class="d-flex flex-column gap-2" data-ref="page.market.watchlist.container">' +
            '  <div class="d-flex align-items-center justify-content-between px-1 mb-2" data-ref="page.market.watchlist.header">' +
            '    <div>' +
            '      <h6 class="fw-bold text-gr1 mb-0">Watchlist Groups</h6>' +
            '      <div class="small text-gr-muted">Organize stocks into custom groups</div>' +
            '    </div>' +
            '    <button type="button" class="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold" data-act="mkt-new-group-btn">' +
            '      <i class="fa-solid fa-plus me-1"></i>New Group' +
            '    </button>' +
            '  </div>' +
            createGroupFormHtml +
            groupsListHtml +
            '</div>';
    }

    // =================================================================
    // 10. TAB 3: INDUSTRIES TAB (COMPLETE LIST OF ALL INDUSTRIES)
    // =================================================================
    // =================================================================
    // 10. TAB 3: INDUSTRIES TAB (COMPLETE LIST OF ALL INDUSTRIES)
    // =================================================================
    function renderIndustriesCardsOnly(visibleIndustries) {
        if (!visibleIndustries || visibleIndustries.length === 0) {
            return '' +
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white my-2" data-ref="page.market.industries.empty-search">' +
                '  <p class="text-gr-muted small mb-2">No industry found matching "' + (industrySearchQuery || '') + '"</p>' +
                '  <div><button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3" data-act="mkt-clear-ind-search" data-ref="page.market.industries.empty-search.clear-btn">Show All Industries</button></div>' +
                '</div>';
        }

        var listHtml = '';
        visibleIndustries.forEach(function (ind) {
            var indKey = ind.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

            listHtml += '' +
                '<div class="card p-3 shadow-sm rounded-4 bg-white border-0" style="cursor:pointer" data-act="mkt-open-industry" data-industry="' + ind.name + '" data-ref="page.market.industries.item-' + indKey + '">' +
                '  <div class="d-flex align-items-center justify-content-between">' +
                '    <div class="d-flex align-items-center gap-3">' +
                '      <span class="fs-3" data-ref="page.market.industries.item-' + indKey + '.icon">' + ind.icon + '</span>' +
                '      <div>' +
                '        <div class="fw-bold text-gr1 fs-6" data-ref="page.market.industries.item-' + indKey + '.name">' + ind.name + '</div>' +
                '        <div class="small text-gr-muted" data-ref="page.market.industries.item-' + indKey + '.count-label">' + ind.count + ' Companies on NSE</div>' +
                '      </div>' +
                '    </div>' +
                '    <div class="d-flex align-items-center gap-2">' +
                '      <span class="badge bg-gr-soft text-gr1 border-gr fw-semibold" data-ref="page.market.industries.item-' + indKey + '.count-badge">' + ind.count + '</span>' +
                '      <i class="fa-solid fa-chevron-right text-gr-muted fs-6" data-ref="page.market.industries.item-' + indKey + '.arrow"></i>' +
                '    </div>' +
                '  </div>' +
                '</div>';
        });

        return listHtml;
    }

    function renderCompanyCardsOnly(companiesList) {
        if (!companiesList || companiesList.length === 0) {
            return '' +
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white my-2" data-ref="page.market.industries.detail.empty">' +
                '  <p class="text-gr-muted small mb-2">No companies found matching "' + (companySearchQuery || '') + '"</p>' +
                '  <div><button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3" data-act="mkt-clear-comp-search" data-ref="page.market.industries.detail.empty.clear-btn">Show All ' + (selectedIndustry || '') + ' Companies</button></div>' +
                '</div>';
        }

        var html = '';
        companiesList.forEach(function (c) {
            var inWatchlist = isStockInAnyGroup(c.symbol);
            var quote = getCachedQuote(c.symbol, 'NSE');
            var isFetching = !!fetchingSymbols[c.symbol];

            var wlButtonHtml = '';
            if (inWatchlist) {
                wlButtonHtml = '<button type="button" class="btn btn-sm btn-light border-0 text-success rounded-pill px-2 py-1 small fw-semibold" data-act="mkt-add-to-wl" data-symbol="' + c.symbol + '" title="In Watchlist" data-ref="page.market.industries.detail.company-' + c.symbol + '.wl-btn">' +
                    '<i class="fa-solid fa-bookmark me-1"></i>Watchlist' +
                    '</button>';
            } else {
                wlButtonHtml = '<button type="button" class="btn btn-sm btn-outline-success rounded-pill px-2 py-1 small fw-semibold" data-act="mkt-add-to-wl" data-symbol="' + c.symbol + '" title="Add to Watchlist group" data-ref="page.market.industries.detail.company-' + c.symbol + '.wl-btn">' +
                    '<i class="fa-solid fa-plus me-1"></i>Watchlist' +
                    '</button>';
            }

            var priceContent = '';
            if (isFetching) {
                priceContent = '<span class="text-gr-muted small"><i class="fa-solid fa-spinner fa-spin me-1 text-gr-accent"></i>Live feed…</span>';
            } else if (quote && isFinite(quote.price)) {
                var changeHtml = '';
                if (quote.change !== null) {
                    var isPos = quote.change >= 0;
                    var sign = isPos ? '+' : '';
                    var badgeClass = isPos ? 'bg-gr-success-soft text-gr-success' : 'bg-gr-danger-soft text-gr-danger';
                    changeHtml = ' <span class="badge rounded-pill ' + badgeClass + ' ms-1" style="font-size:11px">' +
                        sign + formatNumber(quote.change) + ' (' + sign + formatNumber(quote.changePercent) + '%)' +
                        '</span>';
                }
                priceContent = '<span class="fw-bold fs-6 text-gr1">₹' + formatNumber(quote.price) + '</span>' + changeHtml;
            } else {
                priceContent = '<button type="button" class="btn btn-sm btn-light border-gr rounded-pill py-0 px-2 text-gr-accent small" data-act="mkt-fetch-single" data-symbol="' + c.symbol + '" data-ref="page.market.industries.detail.company-' + c.symbol + '.fetch-btn">' +
                    '<i class="fa-solid fa-bolt me-1"></i>Fetch Live' +
                    '</button>';
            }

            html += '' +
                '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white" data-ref="page.market.industries.detail.company-' + c.symbol + '">' +
                '  <div class="d-flex align-items-start justify-content-between gap-2 mb-2">' +
                '    <div class="flex-grow-1 min-w-0">' +
                '      <div class="fw-bold text-gr1 fs-6 text-truncate" data-ref="page.market.industries.detail.company-' + c.symbol + '.name">' + c.name + '</div>' +
                '      <div class="d-flex align-items-center gap-1 mt-1">' +
                '        <span class="badge bg-white text-gr1 border-gr fw-semibold" style="font-size:10px" data-ref="page.market.industries.detail.company-' + c.symbol + '.symbol-badge">' + c.symbol + ' · NSE</span>' +
                '        <span class="badge bg-blue500-soft text-blue500 fw-normal" style="font-size:10px" data-ref="page.market.industries.detail.company-' + c.symbol + '.industry-badge">' + c.industry + '</span>' +
                '      </div>' +
                '    </div>' +
                '    <div class="flex-shrink-0">' + wlButtonHtml + '</div>' +
                '  </div>' +
                '  <div class="d-flex align-items-center justify-content-between pt-2 border-top border-gr mt-1">' +
                '    <div class="d-flex align-items-center" data-mkt-price-for="' + c.symbol + '">' +
                priceContent +
                '    </div>' +
                '    <button type="button" class="btn btn-sm btn-light border-0 text-gr-muted rounded-circle p-1" data-act="mkt-fetch-single" data-symbol="' + c.symbol + '" title="Refresh Live Quote" data-ref="page.market.industries.detail.company-' + c.symbol + '.refresh-btn">' +
                '      <i class="fa-solid fa-rotate-right"></i>' +
                '    </button>' +
                '  </div>' +
                '</div>';
        });

        return html;
    }

    function renderIndustryDetailView(industryName) {
        var indInfo = ALL_INDUSTRIES.find(function (i) { return i.name === industryName; }) || {
            name: industryName,
            count: 0,
            icon: '📦'
        };

        var allCompaniesInInd = NSE_COMPANIES.filter(function (c) {
            return c.industry === industryName;
        });

        var q = (companySearchQuery || '').trim().toLowerCase();
        var visibleCompanies = allCompaniesInInd.filter(function (c) {
            if (!q) return true;
            return c.name.toLowerCase().indexOf(q) !== -1 || c.symbol.toLowerCase().indexOf(q) !== -1;
        });

        // Top Navigation Bar
        var navBarHtml = '' +
            '<div class="d-flex align-items-center justify-content-between mb-2" data-ref="page.market.industries.detail.nav">' +
            '  <button type="button" class="btn btn-sm btn-light border-gr rounded-pill px-3 py-1 fw-semibold text-gr-accent" data-act="mkt-back-to-industries" data-ref="page.market.industries.detail.back-btn">' +
            '    <i class="fa-solid fa-arrow-left me-1"></i>All Industries' +
            '  </button>' +
            '  <button type="button" class="btn btn-sm btn-light border-gr rounded-pill px-2 py-1 text-gr-accent small fw-semibold" data-act="mkt-refresh-industry" data-industry="' + industryName + '" data-ref="page.market.industries.detail.refresh-btn">' +
            '    <i class="fa-solid fa-rotate me-1"></i>Refresh Live' +
            '  </button>' +
            '</div>';

        // Industry Header Card
        var headerCardHtml = '' +
            '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white mb-2" data-ref="page.market.industries.detail.header-card">' +
            '  <div class="d-flex align-items-center justify-content-between mb-2" data-ref="page.market.industries.detail.title-wrap">' +
            '    <div class="d-flex align-items-center gap-2">' +
            '      <span class="fs-3" data-ref="page.market.industries.detail.icon">' + indInfo.icon + '</span>' +
            '      <div>' +
            '        <h6 class="fw-bold text-gr1 mb-0" data-ref="page.market.industries.detail.title">' + industryName + '</h6>' +
            '        <div class="small text-gr-muted" data-ref="page.market.industries.detail.subtitle">Total ' + allCompaniesInInd.length + ' Companies on NSE</div>' +
            '      </div>' +
            '    </div>' +
            '    <span class="badge bg-success text-white px-2 py-1 fw-bold fs-6" data-ref="page.market.industries.detail.count-badge">' + allCompaniesInInd.length + '</span>' +
            '  </div>' +
            '  <div class="input-group" data-ref="page.market.industries.detail.search-group">' +
            '    <span class="input-group-text bg-gr-input border-gr text-gr-muted"><i class="fa-solid fa-magnifying-glass"></i></span>' +
            '    <input type="text" id="mktCompanySearchInput" class="form-control bg-gr-input border-gr text-gr1" placeholder="Search ' + industryName + ' companies..." value="' + (companySearchQuery || '') + '" data-ref="page.market.industries.detail.search-input">' +
            (companySearchQuery ? '<button type="button" class="btn btn-light border-gr text-gr-muted" data-act="mkt-clear-comp-search"><i class="fa-solid fa-xmark"></i></button>' : '') +
            '  </div>' +
            '</div>';

        var companiesCardsHtml = renderCompanyCardsOnly(visibleCompanies);
        var companiesListHtml = '<div class="d-flex flex-column gap-2" id="mktCompaniesList" data-ref="page.market.industries.detail.list">' + companiesCardsHtml + '</div>';

        return '' +
            '<div class="d-flex flex-column gap-2" data-ref="page.market.industries.detail.container">' +
            navBarHtml +
            headerCardHtml +
            companiesListHtml +
            '</div>';
    }

    function renderIndustriesTab() {
        if (selectedIndustry) {
            return renderIndustryDetailView(selectedIndustry);
        }

        var query = (industrySearchQuery || '').trim().toLowerCase();

        // Filter list of industries by search query if user types
        var visibleIndustries = ALL_INDUSTRIES.filter(function (ind) {
            if (!query) return true;
            return ind.name.toLowerCase().indexOf(query) !== -1;
        });

        // Header and Search bar for the complete list of industries
        var headerHtml = '' +
            '<div class="card p-3 border-0 shadow-sm rounded-4 bg-white mb-2" data-ref="page.market.industries.header-card">' +
            '  <div class="d-flex align-items-center justify-content-between mb-2" data-ref="page.market.industries.header-card.title-wrap">' +
            '    <div>' +
            '      <h6 class="fw-bold text-gr1 mb-0" data-ref="page.market.industries.header-card.title">' +
            '        <i class="fa-solid fa-industry text-gr-accent me-1"></i>Industries (NSE)' +
            '      </h6>' +
            '      <div class="small text-gr-muted" data-ref="page.market.industries.header-card.subtitle">16 Industries · 121 Companies on NSE</div>' +
            '    </div>' +
            '    <span id="mktIndustriesBadge" class="badge bg-gr-soft text-gr1 border-gr" data-ref="page.market.industries.header-card.badge">' + visibleIndustries.length + ' Industries</span>' +
            '  </div>' +
            '  <div class="input-group" data-ref="page.market.industries.header-card.search-group">' +
            '    <span class="input-group-text bg-gr-input border-gr text-gr-muted"><i class="fa-solid fa-magnifying-glass"></i></span>' +
            '    <input type="text" id="mktIndustrySearchInput" class="form-control bg-gr-input border-gr text-gr1" placeholder="Filter industries (e.g. IT, Banking, Auto)..." value="' + (industrySearchQuery || '') + '" data-ref="page.market.industries.header-card.search-input">' +
            (industrySearchQuery ? '<button type="button" class="btn btn-light border-gr text-gr-muted" data-act="mkt-clear-ind-search"><i class="fa-solid fa-xmark"></i></button>' : '') +
            '  </div>' +
            '</div>';

        // Complete List of Industries
        var cardsHtml = renderIndustriesCardsOnly(visibleIndustries);
        var listHtml = '<div class="d-flex flex-column gap-2" id="mktIndustriesList" data-ref="page.market.industries.complete-list">' + cardsHtml + '</div>';

        return '' +
            '<div class="d-flex flex-column gap-2" data-ref="page.market.industries.container">' +
            headerHtml +
            listHtml +
            '</div>';
    }

    // =================================================================
    // 11. BOTTOM SHEET: ADD COMPANIES TO GROUP
    // =================================================================
    function openAddCompanySheet(groupId) {
        var group = groups.find(function (g) { return g.id === groupId; });
        if (!group) return;

        sheetCurrentGroupId = groupId;
        var iconEl = $('sheet2Icon');
        var titleEl = $('sheet2Title');
        var subEl = $('sheet2Sub');
        var bodyEl = $('sheet2Body');

        if (iconEl) iconEl.className = 'fa-solid fa-folder-plus text-success';
        if (titleEl) titleEl.textContent = 'Add to ' + group.name;
        if (subEl) subEl.textContent = 'Select company from NSE';

        renderSheetCompanyList('', group);

        if (window.sheet2BS) window.sheet2BS.show();
    }

    function renderSheetCompanyList(query, group) {
        var bodyEl = $('sheet2Body');
        if (!bodyEl) return;

        var q = (query || '').toLowerCase().trim();
        var list = NSE_COMPANIES.filter(function (c) {
            if (!q) return true;
            return c.name.toLowerCase().indexOf(q) !== -1 ||
                c.symbol.toLowerCase().indexOf(q) !== -1 ||
                c.industry.toLowerCase().indexOf(q) !== -1;
        });

        var existingSymbols = group.symbols || [];

        var html = '' +
            '<div class="d-flex flex-column gap-2" data-ref="page.market.sheet.container">' +
            '  <div class="input-group mb-2" data-ref="page.market.sheet.search-group">' +
            '    <span class="input-group-text bg-gr-input border-gr text-gr-muted"><i class="fa-solid fa-magnifying-glass"></i></span>' +
            '    <input type="text" id="mktSheetSearchInput" class="form-control bg-gr-input border-gr text-gr1" placeholder="Filter company name or industry..." value="' + (query || '') + '">' +
            '  </div>' +
            '  <div class="d-flex flex-column gap-2 overflow-auto" style="max-height:55vh" data-ref="page.market.sheet.list">';

        if (list.length === 0) {
            html += '<div class="text-center text-gr-muted py-3 small">No companies match "' + query + '"</div>';
        } else {
            list.forEach(function (c) {
                var alreadyAdded = existingSymbols.indexOf(c.symbol) !== -1;
                var quote = getCachedQuote(c.symbol, 'NSE');
                var priceText = (quote && isFinite(quote.price)) ? ('₹' + formatNumber(quote.price)) : '';

                var btnHtml = '';
                if (alreadyAdded) {
                    btnHtml = '<button type="button" class="btn btn-sm btn-light border-0 text-success rounded-pill px-3 py-1 small fw-semibold" disabled>' +
                        '<i class="fa-solid fa-check me-1"></i>Added' +
                        '</button>';
                } else {
                    btnHtml = '<button type="button" class="btn btn-sm btn-success rounded-pill px-3 py-1 small fw-semibold" data-act="mkt-sheet-add" data-group-id="' + group.id + '" data-symbol="' + c.symbol + '">' +
                        '<i class="fa-solid fa-plus me-1"></i>Add' +
                        '</button>';
                }

                html += '' +
                    '<div class="card p-2 border-0 shadow-sm rounded-3 bg-white d-flex flex-row align-items-center justify-content-between gap-2" data-ref="page.market.sheet.item-' + c.symbol + '">' +
                    '  <div class="flex-grow-1 min-w-0">' +
                    '    <div class="fw-bold text-gr1 small text-truncate">' + c.name + '</div>' +
                    '    <div class="d-flex align-items-center gap-1 mt-1">' +
                    '      <span class="badge bg-gr-soft text-gr1 border-gr" style="font-size:10px">' + c.symbol + '</span>' +
                    '      <span class="badge bg-blue500-soft text-blue500 fw-normal" style="font-size:10px">' + c.industry + '</span>' +
                    (priceText ? '<span class="fw-semibold text-gr1 ms-1" style="font-size:11px">' + priceText + '</span>' : '') +
                    '    </div>' +
                    '  </div>' +
                    '  <div class="flex-shrink-0">' +
                    btnHtml +
                    '  </div>' +
                    '</div>';
            });
        }

        html += '</div></div>';
        bodyEl.innerHTML = html;

        var input = $('mktSheetSearchInput');
        if (input) {
            input.focus();
            input.addEventListener('input', function (e) {
                renderSheetCompanyList(e.target.value, group);
            });
        }
    }

    // =================================================================
    // 12. BOTTOM SHEET: CHOOSE GROUP FOR STOCK
    // =================================================================
    function openChooseGroupSheet(symbol) {
        var company = NSE_COMPANIES.find(function (c) { return c.symbol === symbol; }) || { symbol: symbol, name: symbol };
        var iconEl = $('sheet2Icon');
        var titleEl = $('sheet2Title');
        var subEl = $('sheet2Sub');
        var bodyEl = $('sheet2Body');

        if (iconEl) iconEl.className = 'fa-solid fa-bookmark text-success';
        if (titleEl) titleEl.textContent = 'Add ' + symbol + ' to Group';
        if (subEl) subEl.textContent = company.name;

        var html = '<div class="d-flex flex-column gap-2" data-ref="page.market.choose-sheet.container">';

        if (groups.length === 0) {
            html += '' +
                '<div class="text-center p-3">' +
                '  <p class="text-gr-muted small mb-3">You don\'t have any watchlist groups yet.</p>' +
                '  <button type="button" class="btn btn-success rounded-pill px-4 fw-bold" data-act="mkt-sheet-create-and-add" data-symbol="' + symbol + '">' +
                '    <i class="fa-solid fa-plus me-1"></i>Create Favorites &amp; Add' +
                '  </button>' +
                '</div>';
        } else {
            groups.forEach(function (g) {
                var already = (g.symbols || []).indexOf(symbol) !== -1;
                var btnHtml = '';
                if (already) {
                    btnHtml = '<button type="button" class="btn btn-sm btn-light border-0 text-success rounded-pill px-3 py-1 small fw-semibold" disabled>' +
                        '<i class="fa-solid fa-check me-1"></i>In Group' +
                        '</button>';
                } else {
                    btnHtml = '<button type="button" class="btn btn-sm btn-success rounded-pill px-3 py-1 small fw-semibold" data-act="mkt-sheet-choose-group" data-group-id="' + g.id + '" data-symbol="' + symbol + '">' +
                        '<i class="fa-solid fa-plus me-1"></i>Add' +
                        '</button>';
                }

                html += '' +
                    '<div class="card p-3 border-0 shadow-sm rounded-3 bg-white d-flex flex-row align-items-center justify-content-between gap-2" data-ref="page.market.choose-sheet.group-' + g.id + '">' +
                    '  <div class="d-flex align-items-center gap-2">' +
                    '    <span class="fs-5">' + (g.icon || '📁') + '</span>' +
                    '    <div>' +
                    '      <div class="fw-bold text-gr1 fs-6">' + g.name + '</div>' +
                    '      <div class="small text-gr-muted">' + (g.symbols || []).length + ' stocks</div>' +
                    '    </div>' +
                    '  </div>' +
                    '  <div>' + btnHtml + '</div>' +
                    '</div>';
            });
        }

        html += '</div>';
        if (bodyEl) bodyEl.innerHTML = html;

        if (window.sheet2BS) window.sheet2BS.show();
    }

    // =================================================================
    // 13. MAIN RENDER CONTROLLER
    // =================================================================
    function render() {
        var body = $('marketBody');
        if (!body) return;

        var tabHtml = '';
        if (currentTab === 'feed') {
            tabHtml = renderFeedTab();
        } else if (currentTab === 'watchlist') {
            tabHtml = renderWatchlistTab();
        } else if (currentTab === 'industries') {
            tabHtml = renderIndustriesTab();
        }

        // Render tab content directly without any top nav pills card
        body.innerHTML = '' +
            '<div class="d-flex flex-column" data-ref="page.market.root">' +
            '<div id="mktTabContent" data-ref="page.market.tab-content">' +
            tabHtml +
            '</div>' +
            '</div>';

        syncBottomNav();
        bindLiveInputs();

        if (currentTab === 'feed') {
            fetchNiftyIndexLive();
            autoFetchVisibleCompanies(BENCHMARK_SYMBOLS);
        } else if (currentTab === 'watchlist') {
            var allWlSymbols = [];
            groups.forEach(function (g) {
                (g.symbols || []).forEach(function (s) {
                    if (allWlSymbols.indexOf(s) === -1) allWlSymbols.push(s);
                });
            });
            autoFetchVisibleCompanies(allWlSymbols.map(function (s) { return { symbol: s }; }));
        } else if (currentTab === 'industries' && selectedIndustry) {
            var indCompanies = NSE_COMPANIES.filter(function (c) {
                return c.industry === selectedIndustry;
            });
            if (indCompanies.length > 0) {
                autoFetchVisibleCompanies(indCompanies);
            }
        }
    }

    function bindLiveInputs() {
        // Feed search input Enter listener
        var feedInput = $('mktFeedSearchInput');
        if (feedInput) {
            feedInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    var sym = feedInput.value.trim().toUpperCase();
                    if (sym) {
                        fetchSinglePrice(sym, 'NS');
                    }
                }
            });
        }

        // Industries tab filter input listener (updates cards list directly without losing focus)
        var indSearchInput = $('mktIndustrySearchInput');
        if (indSearchInput) {
            indSearchInput.addEventListener('input', function (e) {
                industrySearchQuery = e.target.value;
                var q = (industrySearchQuery || '').trim().toLowerCase();
                var filtered = ALL_INDUSTRIES.filter(function (ind) {
                    if (!q) return true;
                    return ind.name.toLowerCase().indexOf(q) !== -1;
                });
                var listEl = $('mktIndustriesList');
                if (listEl) {
                    listEl.innerHTML = renderIndustriesCardsOnly(filtered);
                }
                var badgeEl = $('mktIndustriesBadge');
                if (badgeEl) {
                    badgeEl.textContent = filtered.length + ' Industries';
                }
            });
        }

        // Company search within selected industry
        var compSearchInput = $('mktCompanySearchInput');
        if (compSearchInput && selectedIndustry) {
            compSearchInput.addEventListener('input', function (e) {
                companySearchQuery = e.target.value;
                var q = (companySearchQuery || '').trim().toLowerCase();
                var allComp = NSE_COMPANIES.filter(function (c) {
                    return c.industry === selectedIndustry;
                });
                var filtered = allComp.filter(function (c) {
                    if (!q) return true;
                    return c.name.toLowerCase().indexOf(q) !== -1 || c.symbol.toLowerCase().indexOf(q) !== -1;
                });
                var listEl = $('mktCompaniesList');
                if (listEl) {
                    listEl.innerHTML = renderCompanyCardsOnly(filtered);
                }
            });
        }
    }

    // =================================================================
    // 14. ACTION DISPATCHER
    // =================================================================
    function handleAction(act, e, target) {
        if (!target) target = e.target.closest('[data-act]');

        if (act === 'mkt-tab-feed') {
            currentTab = 'feed';
            render();

        } else if (act === 'mkt-tab-watchlist') {
            currentTab = 'watchlist';
            render();

        } else if (act === 'mkt-tab-industries') {
            currentTab = 'industries';
            selectedIndustry = null;
            companySearchQuery = '';
            render();

        } else if (act === 'mkt-open-industry') {
            var ind = target.getAttribute('data-industry');
            if (ind) {
                selectedIndustry = ind;
                companySearchQuery = '';
                render();
            }

        } else if (act === 'mkt-back-to-industries') {
            selectedIndustry = null;
            companySearchQuery = '';
            render();

        } else if (act === 'mkt-clear-ind-search') {
            industrySearchQuery = '';
            render();

        } else if (act === 'mkt-clear-comp-search') {
            companySearchQuery = '';
            render();

        } else if (act === 'mkt-feed-search-submit') {
            var inp = $('mktFeedSearchInput');
            var val = inp ? inp.value.trim().toUpperCase() : '';
            if (val) {
                fetchSinglePrice(val, 'NS');
            }

        } else if (act === 'mkt-quick-symbol') {
            var quickSym = target.getAttribute('data-symbol');
            if (quickSym) {
                var searchInp = $('mktFeedSearchInput');
                if (searchInp) searchInp.value = quickSym;
                fetchSinglePrice(quickSym, 'NS');
            }

        } else if (act === 'mkt-fetch-single') {
            var sym = target.getAttribute('data-symbol');
            if (sym) fetchSinglePrice(sym, 'NS');

        } else if (act === 'mkt-refresh-feed') {
            fetchNiftyIndexLive();
            autoFetchVisibleCompanies(BENCHMARK_SYMBOLS);

        } else if (act === 'mkt-refresh-industry') {
            var indToRefresh = target.getAttribute('data-industry') || selectedIndustry;
            if (indToRefresh) {
                var list = NSE_COMPANIES.filter(function (c) {
                    return c.industry === indToRefresh;
                });
                if (list.length > 0) autoFetchVisibleCompanies(list);
            }

        } else if (act === 'mkt-add-to-wl') {
            var stockSym = target.getAttribute('data-symbol');
            if (stockSym) openChooseGroupSheet(stockSym);

        } else if (act === 'mkt-new-group-btn') {
            isCreatingGroup = true;
            render();
            var nameInput = $('mktNewGroupName');
            if (nameInput) nameInput.focus();

        } else if (act === 'mkt-cancel-group') {
            isCreatingGroup = false;
            render();

        } else if (act === 'mkt-save-group') {
            var nameInp = $('mktNewGroupName');
            var groupName = nameInp ? nameInp.value.trim() : '';
            if (!groupName) {
                alert('Please enter a group name.');
                return;
            }
            var newId = 'grp_' + Date.now().toString(36);
            groups.push({
                id: newId,
                name: groupName,
                icon: '📁',
                symbols: []
            });
            saveGroups(groups);
            isCreatingGroup = false;
            render();

        } else if (act === 'mkt-group-delete') {
            var gId = target.getAttribute('data-group-id');
            var gIndex = groups.findIndex(function (g) { return g.id === gId; });
            if (gIndex !== -1) {
                if (confirm('Delete watchlist group "' + groups[gIndex].name + '"?')) {
                    groups.splice(gIndex, 1);
                    saveGroups(groups);
                    render();
                }
            }

        } else if (act === 'mkt-group-add-company') {
            var grpId = target.getAttribute('data-group-id');
            if (grpId) openAddCompanySheet(grpId);

        } else if (act === 'mkt-group-remove-stock') {
            var rmGroupId = target.getAttribute('data-group-id');
            var rmSymbol = target.getAttribute('data-symbol');
            var targetGrp = groups.find(function (g) { return g.id === rmGroupId; });
            if (targetGrp && rmSymbol) {
                targetGrp.symbols = (targetGrp.symbols || []).filter(function (s) { return s !== rmSymbol; });
                saveGroups(groups);
                render();
            }

        } else if (act === 'mkt-sheet-add') {
            var addGrpId = target.getAttribute('data-group-id');
            var addSymbol = target.getAttribute('data-symbol');
            var addGroup = groups.find(function (g) { return g.id === addGrpId; });
            if (addGroup && addSymbol) {
                if (!addGroup.symbols) addGroup.symbols = [];
                if (addGroup.symbols.indexOf(addSymbol) === -1) {
                    addGroup.symbols.push(addSymbol);
                    saveGroups(groups);
                }
                var sheetInput = $('mktSheetSearchInput');
                renderSheetCompanyList(sheetInput ? sheetInput.value : '', addGroup);
                fetchSinglePrice(addSymbol, 'NS');
            }

        } else if (act === 'mkt-sheet-choose-group') {
            var chosenGrpId = target.getAttribute('data-group-id');
            var chosenSym = target.getAttribute('data-symbol');
            var chosenGrp = groups.find(function (g) { return g.id === chosenGrpId; });
            if (chosenGrp && chosenSym) {
                if (!chosenGrp.symbols) chosenGrp.symbols = [];
                if (chosenGrp.symbols.indexOf(chosenSym) === -1) {
                    chosenGrp.symbols.push(chosenSym);
                    saveGroups(groups);
                }
                if (window.sheet2BS) window.sheet2BS.hide();
                fetchSinglePrice(chosenSym, 'NS');
                render();
            }

        } else if (act === 'mkt-sheet-create-and-add') {
            var crSym = target.getAttribute('data-symbol');
            var newFavId = 'grp_' + Date.now().toString(36);
            groups.push({
                id: newFavId,
                name: 'Favorites',
                icon: '⭐',
                symbols: crSym ? [crSym] : []
            });
            saveGroups(groups);
            if (window.sheet2BS) window.sheet2BS.hide();
            if (crSym) fetchSinglePrice(crSym, 'NS');
            render();
        }
    }

    // =================================================================
    // 15. PUBLIC API
    // =================================================================
    return {
        init: function () {
            groups = loadGroups();
        },
        render: render,
        handleAction: handleAction,
        fetchPrice: fetchSinglePrice
    };

})();
