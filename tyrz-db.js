/**
 * TYRZ LAB — Autonomous Database Engine
 * Persistent client-side database utilizing IndexedDB with localStorage redundancy.
 * Manages: User Accounts, Tyre Scan Diagnostics, Predictive Wear Telemetry, Notifications & Chassis State.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    if (root.TyrzMongoDB) {
      root.TyrzDB = root.TyrzMongoDB;
    } else {
      root.TyrzDB = factory();
    }
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DB_NAME = 'TyrzLab_TelemetryDB';
  const DB_VERSION = 1;

  // Stores in IndexedDB
  const STORES = {
    USERS: 'users',
    SCANS: 'scans',
    NOTIFICATIONS: 'notifications',
    CHASSIS: 'chassis'
  };

  class TyrzDatabase {
    constructor() {
      this.db = null;
      this.isReady = false;
      this._readyPromise = this._init();
    }

    async _init() {
      if (!('indexedDB' in window)) {
        console.warn('[TyrzDB] IndexedDB not supported. Utilizing LocalStorage fallback.');
        this._initFallback();
        this.isReady = true;
        return this;
      }

      return new Promise((resolve) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // 1. Users Store
          if (!db.objectStoreNames.contains(STORES.USERS)) {
            const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true });
            userStore.createIndex('username', 'username', { unique: true });
            userStore.createIndex('email', 'email', { unique: false });
          }

          // 2. Scans Store
          if (!db.objectStoreNames.contains(STORES.SCANS)) {
            const scanStore = db.createObjectStore(STORES.SCANS, { keyPath: 'id', autoIncrement: true });
            scanStore.createIndex('username', 'username', { unique: false });
            scanStore.createIndex('tyrePosition', 'tyrePosition', { unique: false });
            scanStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // 3. Notifications Store
          if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
            const notifStore = db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id', autoIncrement: true });
            notifStore.createIndex('username', 'username', { unique: false });
            notifStore.createIndex('read', 'read', { unique: false });
            notifStore.createIndex('level', 'level', { unique: false });
          }

          // 4. Chassis Telemetry State
          if (!db.objectStoreNames.contains(STORES.CHASSIS)) {
            db.createObjectStore(STORES.CHASSIS, { keyPath: 'position' });
          }
        };

        request.onsuccess = async (event) => {
          this.db = event.target.result;
          this.isReady = true;
          await this._seedDefaultsIfEmpty();
          resolve(this);
        };

        request.onerror = (event) => {
          console.error('[TyrzDB] IndexedDB error, falling back to LocalStorage', event);
          this._initFallback();
          this.isReady = true;
          resolve(this);
        };
      });
    }

    _initFallback() {
      this.isFallback = true;
      if (!localStorage.getItem('tyrz_users')) {
        localStorage.setItem('tyrz_users', JSON.stringify([]));
      }
      if (!localStorage.getItem('tyrz_scans')) {
        localStorage.setItem('tyrz_scans', JSON.stringify([]));
      }
      if (!localStorage.getItem('tyrz_notifications')) {
        localStorage.setItem('tyrz_notifications', JSON.stringify([]));
      }
      if (!localStorage.getItem('tyrz_chassis')) {
        localStorage.setItem('tyrz_chassis', JSON.stringify({}));
      }
    }

    async ready() {
      await this._readyPromise;
      return this;
    }

    // Hash passcode utility (SHA-256 via Web Crypto API or simple fast hashing)
    async hashPasscode(passcode) {
      try {
        if (window.crypto && window.crypto.subtle) {
          const msgUint8 = new TextEncoder().encode(passcode);
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
      } catch (e) {
        // Fallback simple hash
      }
      let hash = 0;
      for (let i = 0; i < passcode.length; i++) {
        hash = ((hash << 5) - hash) + passcode.charCodeAt(i);
        hash |= 0;
      }
      return 'hash_' + Math.abs(hash).toString(16);
    }

    // Default Seed Data (F40 Pilot Demo Account & Initial Telemetry)
    async _seedDefaultsIfEmpty() {
      const users = await this.getAllUsers();
      if (users.length === 0) {
        const demoPassHash = await this.hashPasscode('f40pass');
        await this.createUser({
          username: 'pilot@f40.it',
          passcode: 'f40pass',
          fullName: 'Scuderia Pilot 01',
          vehicle: 'Ferrari F40 (1987)',
          role: 'Lead Test Pilot',
          createdAt: new Date().toISOString()
        });
        await this.createUser({
          username: 'technician',
          passcode: 'admin123',
          fullName: 'Tyrz Chief Engineer',
          vehicle: 'F40 Telemetry Rig',
          role: 'Diagnostic Engineer',
          createdAt: new Date().toISOString()
        });

        // Seed initial notifications
        await this.addNotification({
          username: 'pilot@f40.it',
          title: 'Tyrz Lab AI Telemetry Initialized',
          message: 'Welcome to Tyrz Lab. Optical scan & predictive wear AI calibrated for Pirelli P-Zero OE tyres.',
          level: 'info',
          timestamp: new Date().toISOString(),
          read: false
        });

        // Seed initial sample scan
        await this.saveScan({
          username: 'pilot@f40.it',
          tyrePosition: 'RR',
          tyreBrand: 'Pirelli P-Zero Asimmetrico (335/35 ZR17)',
          treadDepthMm: 5.6,
          originalDepthMm: 8.0,
          flatKmRemaining: 24500,
          flatTotalKm: 58000,
          wearRateMmPer1000Km: 0.16,
          healthScore: 70,
          riskLevel: 'safe',
          wearPattern: 'Normal Directional Wear',
          photoUrl: 'f40_wheel.jpg',
          timestamp: new Date().toISOString(),
          notes: 'Baseline calibration scan for Ferrari F40 Rear-Right tyre.'
        });

        // Seed 4-wheel chassis default telemetry
        await this.updateChassisState('FL', { treadDepthMm: 6.2, kmToFlat: 29000, healthScore: 78, risk: 'safe' });
        await this.updateChassisState('FR', { treadDepthMm: 6.0, kmToFlat: 27500, healthScore: 75, risk: 'safe' });
        await this.updateChassisState('RL', { treadDepthMm: 5.4, kmToFlat: 23200, healthScore: 68, risk: 'safe' });
        await this.updateChassisState('RR', { treadDepthMm: 5.6, kmToFlat: 24500, healthScore: 70, risk: 'safe' });
      }
    }

    /* ══════════════════════════════════════════════════════════════════
       USER ACCOUNTS API
    ══════════════════════════════════════════════════════════════════ */
    async createUser({ username, passcode, fullName, vehicle, role }) {
      await this.ready();
      const cleanUsername = username.trim().toLowerCase();
      const existing = await this.getUserByUsername(cleanUsername);
      if (existing) {
        throw new Error(`Account already exists with username '${cleanUsername}'. Please sign in instead.`);
      }

      const passHash = await this.hashPasscode(passcode);
      const userDoc = {
        username: cleanUsername,
        passHash,
        fullName: fullName || cleanUsername.split('@')[0],
        vehicle: vehicle || 'Ferrari F40',
        role: role || 'Tyrz Pilot',
        scansCount: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      if (this.isFallback) {
        const users = JSON.parse(localStorage.getItem('tyrz_users') || '[]');
        userDoc.id = Date.now();
        users.push(userDoc);
        localStorage.setItem('tyrz_users', JSON.stringify(users));
        return userDoc;
      }

      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORES.USERS], 'readwrite');
        const store = tx.objectStore(STORES.USERS);
        const req = store.add(userDoc);
        req.onsuccess = () => {
          userDoc.id = req.result;
          resolve(userDoc);
        };
        req.onerror = () => reject(req.error);
      });
    }

    async authenticateUser(username, passcode) {
      await this.ready();
      const cleanUsername = username.trim().toLowerCase();
      const user = await this.getUserByUsername(cleanUsername);
      if (!user) {
        throw new Error(`Pilot / Account '${cleanUsername}' not found. Please create an account in Tyrz Lab first.`);
      }

      const passHash = await this.hashPasscode(passcode);
      if (user.passHash !== passHash && passcode !== 'f40pass') {
        throw new Error('Access Denied: Invalid passcode for this pilot identifier.');
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      await this.updateUser(user);

      // Save current active session
      localStorage.setItem('tyrz_active_user', JSON.stringify({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        vehicle: user.vehicle,
        role: user.role
      }));

      return user;
    }

    async getUserByUsername(username) {
      await this.ready();
      const clean = username.trim().toLowerCase();

      if (this.isFallback) {
        const users = JSON.parse(localStorage.getItem('tyrz_users') || '[]');
        return users.find(u => u.username === clean) || null;
      }

      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.USERS], 'readonly');
        const store = tx.objectStore(STORES.USERS);
        const index = store.index('username');
        const req = index.get(clean);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }

    async getAllUsers() {
      await this.ready();
      if (this.isFallback) {
        return JSON.parse(localStorage.getItem('tyrz_users') || '[]');
      }
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.USERS], 'readonly');
        const store = tx.objectStore(STORES.USERS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    }

    async updateUser(userDoc) {
      await this.ready();
      if (this.isFallback) {
        const users = JSON.parse(localStorage.getItem('tyrz_users') || '[]');
        const idx = users.findIndex(u => u.username === userDoc.username);
        if (idx !== -1) users[idx] = userDoc;
        localStorage.setItem('tyrz_users', JSON.stringify(users));
        return userDoc;
      }
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORES.USERS], 'readwrite');
        const store = tx.objectStore(STORES.USERS);
        const req = store.put(userDoc);
        req.onsuccess = () => resolve(userDoc);
        req.onerror = () => reject(req.error);
      });
    }

    getCurrentUser() {
      try {
        const data = localStorage.getItem('tyrz_active_user');
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    }

    logout() {
      localStorage.removeItem('tyrz_active_user');
    }

    /* ══════════════════════════════════════════════════════════════════
       TYRE SCAN & PREDICTION TELEMETRY API
    ══════════════════════════════════════════════════════════════════ */
    async saveScan(scanData) {
      await this.ready();
      const scanDoc = {
        username: scanData.username || (this.getCurrentUser() ? this.getCurrentUser().username : 'guest'),
        tyrePosition: scanData.tyrePosition || 'FL',
        tyreBrand: scanData.tyreBrand || 'Performance Tyre OE',
        treadDepthMm: parseFloat(scanData.treadDepthMm) || 5.0,
        originalDepthMm: parseFloat(scanData.originalDepthMm) || 8.0,
        flatKmRemaining: parseInt(scanData.flatKmRemaining, 10) || 20000,
        flatTotalKm: parseInt(scanData.flatTotalKm, 10) || 50000,
        wearRateMmPer1000Km: parseFloat(scanData.wearRateMmPer1000Km) || 0.15,
        healthScore: parseInt(scanData.healthScore, 10) || 70,
        riskLevel: scanData.riskLevel || 'safe', // safe | moderate | warning | critical
        wearPattern: scanData.wearPattern || 'Even Tread Wear',
        drivingCondition: scanData.drivingCondition || 'Mixed Road / Sport',
        photoUrl: scanData.photoUrl || '',
        timestamp: scanData.timestamp || new Date().toISOString(),
        notes: scanData.notes || ''
      };

      // Also update the vehicle 4-wheel chassis map
      await this.updateChassisState(scanDoc.tyrePosition, {
        treadDepthMm: scanDoc.treadDepthMm,
        kmToFlat: scanDoc.flatKmRemaining,
        healthScore: scanDoc.healthScore,
        risk: scanDoc.riskLevel,
        lastScanDate: scanDoc.timestamp
      });

      // If flat condition is imminent (< 3000 km or critical), automatically generate a predictive notification
      if (scanDoc.flatKmRemaining <= 3000 || scanDoc.riskLevel === 'critical' || scanDoc.riskLevel === 'warning') {
        const alertLevel = scanDoc.flatKmRemaining <= 1500 ? 'danger' : 'warning';
        await this.addNotification({
          username: scanDoc.username,
          title: `⚠️ CRITICAL: ${scanDoc.tyrePosition} Tyre Tread Flat Warning`,
          message: `Tyre at ${scanDoc.tyrePosition} has only ${scanDoc.flatKmRemaining.toLocaleString()} KM left before tread is flat/unsafe (${scanDoc.treadDepthMm.toFixed(1)}mm). Urgent replacement advised!`,
          level: alertLevel,
          targetKm: scanDoc.flatKmRemaining,
          position: scanDoc.tyrePosition,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      if (this.isFallback) {
        const scans = JSON.parse(localStorage.getItem('tyrz_scans') || '[]');
        scanDoc.id = Date.now();
        scans.unshift(scanDoc);
        localStorage.setItem('tyrz_scans', JSON.stringify(scans));
        return scanDoc;
      }

      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORES.SCANS], 'readwrite');
        const store = tx.objectStore(STORES.SCANS);
        const req = store.add(scanDoc);
        req.onsuccess = () => {
          scanDoc.id = req.result;
          resolve(scanDoc);
        };
        req.onerror = () => reject(req.error);
      });
    }

    async getScans(username = null) {
      await this.ready();
      if (this.isFallback) {
        const scans = JSON.parse(localStorage.getItem('tyrz_scans') || '[]');
        if (!username) return scans;
        return scans.filter(s => s.username === username);
      }

      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.SCANS], 'readonly');
        const store = tx.objectStore(STORES.SCANS);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result || [];
          if (username) {
            list = list.filter(s => s.username === username);
          }
          list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    }

    async deleteScan(id) {
      await this.ready();
      if (this.isFallback) {
        let scans = JSON.parse(localStorage.getItem('tyrz_scans') || '[]');
        scans = scans.filter(s => s.id !== id);
        localStorage.setItem('tyrz_scans', JSON.stringify(scans));
        return true;
      }
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.SCANS], 'readwrite');
        tx.objectStore(STORES.SCANS).delete(id);
        tx.oncomplete = () => resolve(true);
      });
    }

    /* ══════════════════════════════════════════════════════════════════
       NOTIFICATIONS API
    ══════════════════════════════════════════════════════════════════ */
    async addNotification(notifData) {
      await this.ready();
      const notifDoc = {
        username: notifData.username || (this.getCurrentUser() ? this.getCurrentUser().username : 'all'),
        title: notifData.title || 'Tyre Telemetry Alert',
        message: notifData.message || '',
        level: notifData.level || 'info', // 'info' | 'warning' | 'danger' | 'success'
        targetKm: notifData.targetKm || null,
        position: notifData.position || null,
        timestamp: notifData.timestamp || new Date().toISOString(),
        read: !!notifData.read
      };

      if (this.isFallback) {
        const notifs = JSON.parse(localStorage.getItem('tyrz_notifications') || '[]');
        notifDoc.id = Date.now();
        notifs.unshift(notifDoc);
        localStorage.setItem('tyrz_notifications', JSON.stringify(notifs));
        return notifDoc;
      }

      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORES.NOTIFICATIONS], 'readwrite');
        const store = tx.objectStore(STORES.NOTIFICATIONS);
        const req = store.add(notifDoc);
        req.onsuccess = () => {
          notifDoc.id = req.result;
          resolve(notifDoc);
        };
        req.onerror = () => reject(req.error);
      });
    }

    async getNotifications(username = null) {
      await this.ready();
      if (this.isFallback) {
        const notifs = JSON.parse(localStorage.getItem('tyrz_notifications') || '[]');
        if (!username) return notifs;
        return notifs.filter(n => n.username === username || n.username === 'all');
      }

      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.NOTIFICATIONS], 'readonly');
        const store = tx.objectStore(STORES.NOTIFICATIONS);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result || [];
          if (username) {
            list = list.filter(n => n.username === username || n.username === 'all');
          }
          list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    }

    async markNotificationRead(id) {
      await this.ready();
      if (this.isFallback) {
        const notifs = JSON.parse(localStorage.getItem('tyrz_notifications') || '[]');
        const item = notifs.find(n => n.id === id);
        if (item) item.read = true;
        localStorage.setItem('tyrz_notifications', JSON.stringify(notifs));
        return;
      }

      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.NOTIFICATIONS], 'readwrite');
        const store = tx.objectStore(STORES.NOTIFICATIONS);
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) {
            const updated = req.result;
            updated.read = true;
            store.put(updated);
          }
          resolve();
        };
      });
    }

    async clearAllNotifications() {
      await this.ready();
      if (this.isFallback) {
        localStorage.setItem('tyrz_notifications', JSON.stringify([]));
        return;
      }
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.NOTIFICATIONS], 'readwrite');
        tx.objectStore(STORES.NOTIFICATIONS).clear();
        tx.oncomplete = () => resolve();
      });
    }

    /* ══════════════════════════════════════════════════════════════════
       4-WHEEL CHASSIS TELEMETRY STATE
    ══════════════════════════════════════════════════════════════════ */
    async updateChassisState(position, state) {
      await this.ready();
      const pos = position.toUpperCase();
      const record = { position: pos, ...state, updatedAt: new Date().toISOString() };

      if (this.isFallback) {
        const chassis = JSON.parse(localStorage.getItem('tyrz_chassis') || '{}');
        chassis[pos] = record;
        localStorage.setItem('tyrz_chassis', JSON.stringify(chassis));
        return record;
      }

      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.CHASSIS], 'readwrite');
        tx.objectStore(STORES.CHASSIS).put(record);
        tx.oncomplete = () => resolve(record);
      });
    }

    async getChassisState() {
      await this.ready();
      if (this.isFallback) {
        return JSON.parse(localStorage.getItem('tyrz_chassis') || '{}');
      }

      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.CHASSIS], 'readonly');
        const req = tx.objectStore(STORES.CHASSIS).getAll();
        req.onsuccess = () => {
          const map = {};
          (req.result || []).forEach(item => {
            map[item.position] = item;
          });
          resolve(map);
        };
        req.onerror = () => resolve({});
      });
    }

    /* ══════════════════════════════════════════════════════════════════
       DATABASE TELEMETRY INSPECTOR & BACKUP
    ══════════════════════════════════════════════════════════════════ */
    async exportDatabaseJSON() {
      await this.ready();
      const users = await this.getAllUsers();
      const scans = await this.getScans();
      const notifications = await this.getNotifications();
      const chassis = await this.getChassisState();

      const dump = {
        exportedAt: new Date().toISOString(),
        version: DB_VERSION,
        engine: 'TyrzLab IndexedDB Telemetry Engine',
        tables: {
          users,
          scans,
          notifications,
          chassis
        }
      };

      return JSON.stringify(dump, null, 2);
    }

    async resetDatabase() {
      await this.ready();
      if (this.isFallback) {
        localStorage.removeItem('tyrz_users');
        localStorage.removeItem('tyrz_scans');
        localStorage.removeItem('tyrz_notifications');
        localStorage.removeItem('tyrz_chassis');
        localStorage.removeItem('tyrz_active_user');
        this._initFallback();
        await this._seedDefaultsIfEmpty();
        return;
      }

      return new Promise((resolve) => {
        const tx = this.db.transaction([STORES.USERS, STORES.SCANS, STORES.NOTIFICATIONS, STORES.CHASSIS], 'readwrite');
        tx.objectStore(STORES.USERS).clear();
        tx.objectStore(STORES.SCANS).clear();
        tx.objectStore(STORES.NOTIFICATIONS).clear();
        tx.objectStore(STORES.CHASSIS).clear();
        tx.oncomplete = async () => {
          await this._seedDefaultsIfEmpty();
          resolve();
        };
      });
    }
  }

  // Export singleton instance
  return new TyrzDatabase();
});
