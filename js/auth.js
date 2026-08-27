/**
 * ООО АЛМАС — Клиентский модуль беспарольной аутентификации
 * Magic Link + Passkeys (WebAuthn / FIDO2)
 */
(function () {
    'use strict';

    const API = (window.location.protocol === 'file:' || !window.location.port || window.location.port !== '3000' && window.location.hostname === 'localhost' ? 'http://localhost:3000' : '') + '/api/auth';
    let _currentUser = null;
    let _passkeys = [];
    let _sessions = [];

    // ─── API helpers ─────────────────────────────────────────────────────
    async function api(method, endpoint, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        };
        if (body && method !== 'GET') opts.body = JSON.stringify(body);
        try {
            const res = await fetch(API + endpoint, opts);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            return data;
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                throw new Error('Сервер не запущен. Откройте сайт через http://localhost:3000 или запустите: node server.js');
            }
            throw err;
        }
    }

    // ─── Auth State ──────────────────────────────────────────────────────
    async function checkAuth() {
        try {
            const data = await api('GET', '/me');
            _currentUser = data.user;
            _passkeys = data.passkeys || [];
            return true;
        } catch {
            _currentUser = null;
            _passkeys = [];
            return false;
        }
    }

    function isLoggedIn() {
        return _currentUser !== null;
    }

    function getUser() {
        return _currentUser;
    }

    // ─── Magic Link & OTP ───────────────────────────────────────────────
    async function sendMagicLink(email) {
        return api('POST', '/magic-link/send', { email });
    }

    async function verifyOtp(email, code) {
        return api('POST', '/otp/verify', { email, code });
    }

    // ─── Passkey: Register ───────────────────────────────────────────────
    async function registerPasskey(deviceName) {
        const options = await api('POST', '/webauthn/register/options');

        if (!window.SimpleWebAuthnBrowser) {
            throw new Error('WebAuthn SDK не загружен');
        }

        const credential = await SimpleWebAuthnBrowser.startRegistration(options);
        credential.deviceName = deviceName || guessDeviceName();

        return api('POST', '/webauthn/register/complete', credential);
    }

    // ─── Passkey: Login ──────────────────────────────────────────────────
    async function loginWithPasskey(email) {
        const options = await api('POST', '/webauthn/login/options', { email });

        if (!window.SimpleWebAuthnBrowser) {
            throw new Error('WebAuthn SDK не загружен');
        }

        const credential = await SimpleWebAuthnBrowser.startAuthentication(options);

        return api('POST', '/webauthn/login/complete', { email, credential });
    }

    // ─── Passkey: Delete ─────────────────────────────────────────────────
    async function deletePasskey(passkeyId) {
        return api('DELETE', '/passkeys/' + passkeyId);
    }

    // ─── Profile ─────────────────────────────────────────────────────────
    async function updateProfile(companyName, phone) {
        return api('PATCH', '/profile', { companyName, phone });
    }

    // ─── Sessions ────────────────────────────────────────────────────────
    async function loadSessions() {
        const data = await api('GET', '/sessions');
        _sessions = data.sessions || [];
        return _sessions;
    }

    async function deleteSession(sessionId) {
        return api('DELETE', '/sessions/' + sessionId);
    }

    async function deleteAllSessions() {
        return api('DELETE', '/sessions');
    }

    // ─── Logout ──────────────────────────────────────────────────────────
    async function logout() {
        try { await api('POST', '/logout'); } catch { /* ignore */ }
        _currentUser = null;
        _passkeys = [];
        _sessions = [];
    }

    // ─── Utils ───────────────────────────────────────────────────────────
    function supportsWebAuthn() {
        return !!(window.PublicKeyCredential);
    }

    function guessDeviceName() {
        const ua = navigator.userAgent;
        if (/iPhone/.test(ua)) return 'iPhone';
        if (/iPad/.test(ua)) return 'iPad';
        if (/Android/.test(ua)) return 'Android';
        if (/Mac/.test(ua)) return 'Mac';
        if (/Windows/.test(ua)) return 'Windows PC';
        return 'Passkey Device';
    }

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'только что';
        if (mins < 60) return `${mins} мин. назад`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} ч. назад`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} дн. назад`;
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    // ─── Public API ──────────────────────────────────────────────────────
    window.AlmasAuth = {
        checkAuth,
        isLoggedIn,
        getUser,
        sendMagicLink,
        verifyOtp,
        registerPasskey,
        loginWithPasskey,
        deletePasskey,
        updateProfile,
        loadSessions,
        deleteSession,
        deleteAllSessions,
        logout,
        supportsWebAuthn,
        timeAgo,
        getPasskeys: () => _passkeys,
        getSessions: () => _sessions,
    };
})();
