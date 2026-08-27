(function () {
  'use strict';

  const ALMAS_SHIELD = {
    version: '2.0.0',
    violations: [],
    maxViolations: 10,
    isBlocked: false,
    sessionId: null,
    config: {
      enableAntiXSS: true,
      enableAntiClickjacking: true,
      enableAntiBot: true,
      enableRateLimiting: true,
      enableInputSanitization: true,
      enableHoneypot: true,
      enableCSP: true,
      enableSessionIntegrity: true,
      enableFormProtection: true,
      enableLinkProtection: true,
      enableDOMProtection: true,
      rateLimitWindow: 1000,
      rateLimitMaxRequests: 35,
      blockDuration: 300000,
      maxInputLength: 5000,
      suspiciousPatterns: [
        /<script\b[^>]*>/gi,
        /javascript\s*:/gi,
        /on\w+\s*=\s*["']/gi,
        /eval\s*\(/gi,
        /document\s*\.\s*cookie/gi,
        /document\s*\.\s*write/gi,
        /window\s*\.\s*location/gi,
        /innerHTML\s*=/gi,
        /outerHTML\s*=/gi,
        /insertAdjacentHTML/gi,
        /fromCharCode/gi,
        /<iframe\b/gi,
        /<object\b/gi,
        /<embed\b/gi,
        /data\s*:\s*text\/html/gi,
        /vbscript\s*:/gi,
      ],
      sqlPatterns: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b.*\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b)/gi,
        /('\s*(OR|AND)\s*'?\s*\d+\s*=\s*\d+)/gi,
        /(--\s*$|;\s*--)/gm,
        /(BENCHMARK|SLEEP|WAITFOR|DELAY)\s*\(/gi,
      ],
      pathTraversalPatterns: [
        /\.\.\//g,
        /\.\.%2[fF]/g,
        /etc\/passwd/gi,
        /\.env$/gi,
        /\.git\//gi,
      ],
    },

    init() {
      try { sessionStorage.removeItem('almas_shield_blocked'); } catch (e) {}
      this.sessionId = this.generateSessionId();

      if (this.config.enableAntiClickjacking) this.antiClickjacking();
      if (this.config.enableCSP) this.enforceCSP();
      if (this.config.enableAntiXSS) this.antiXSS();
      if (this.config.enableAntiBot) this.antiBot();
      if (this.config.enableRateLimiting) this.rateLimiter();
      if (this.config.enableInputSanitization) this.inputSanitization();
      if (this.config.enableHoneypot) this.honeypotSystem();
      if (this.config.enableSessionIntegrity) this.sessionIntegrity();
      if (this.config.enableFormProtection) this.formProtection();
      if (this.config.enableLinkProtection) this.linkProtection();
      if (this.config.enableDOMProtection) this.domProtection();
      this.urlProtection();
      this.errorBoundary();
    },

    generateSessionId() {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    },

    log(msg, level = 'info') {
      const prefix = '[ALMAS Shield]';
      if (level === 'warn') console.warn(`${prefix} ${msg}`);
      else if (level === 'error') console.error(`${prefix} ${msg}`);
    },

    recordViolation(type, details = '') {
      this.violations.push({ type, details, timestamp: Date.now() });
      this.log(`Violation [${type}]: ${details}`, 'warn');
      if (this.violations.length >= this.maxViolations) this.blockUser();
    },

    blockUser() {
      if (this.isBlocked) return;
      this.isBlocked = true;
      try { sessionStorage.setItem('almas_shield_blocked', Date.now().toString()); } catch (e) {}
    },

    sanitizeString(str) {
      if (typeof str !== 'string') return str;
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    },

    antiClickjacking() {
      if (window.self !== window.top) {
        this.recordViolation('CLICKJACKING', 'Site loaded in iframe');
        try { window.top.location = window.self.location; } catch (e) {
          document.body.innerHTML = '';
          document.body.style.display = 'none';
        }
      }
    },

    antiXSS() {
      const self = this;
      const origInnerHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.set;
      if (origInnerHTMLSetter) {
        Object.defineProperty(Element.prototype, 'innerHTML', {
          set(value) {
            if (this.hasAttribute && this.hasAttribute('data-almas-safe')) {
              return origInnerHTMLSetter.call(this, value);
            }
            if (typeof value === 'string' && self.detectXSS(value)) {
              self.recordViolation('XSS_INNERHTML', 'Suspicious innerHTML blocked');
              return origInnerHTMLSetter.call(this, self.sanitizeString(value));
            }
            return origInnerHTMLSetter.call(this, value);
          },
          get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.get,
          configurable: true,
        });
      }

      const origWrite = document.write.bind(document);
      document.write = function (content) {
        if (typeof content === 'string' && self.detectXSS(content)) {
          self.recordViolation('XSS_DOC_WRITE', 'document.write blocked');
          return;
        }
        origWrite(content);
      };

      const origEval = window.eval;
      window.eval = function (code) {
        const stack = new Error().stack || '';
        if (stack.includes('security.js') || stack.includes('index.html') || stack.includes('jspdf')) {
          return origEval(code);
        }
        self.recordViolation('XSS_EVAL', 'Untrusted eval() blocked');
        return undefined;
      };
    },

    detectXSS(str) {
      if (typeof str !== 'string') return false;
      for (const pattern of this.config.suspiciousPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(str)) return true;
      }
      return false;
    },

    antiBot() {
      const headlessSignals = [];
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (navigator.webdriver) headlessSignals.push('webdriver');
      if (!navigator.languages || navigator.languages.length === 0) headlessSignals.push('no_languages');
      if (navigator.plugins && navigator.plugins.length === 0 && !isMobile && !isSafari) {
        headlessSignals.push('no_plugins');
      }
      if (/HeadlessChrome|PhantomJS|Selenium|puppeteer/i.test(navigator.userAgent)) {
        headlessSignals.push('headless_ua');
      }
      if (headlessSignals.length >= 2) {
        this.recordViolation('BOT_DETECTED', headlessSignals.join(', '));
      }
    },

    rateLimiter() {
      const self = this;
      const clickTimestamps = [];
      const submitTimestamps = [];

      document.addEventListener('click', () => {
        const now = Date.now();
        clickTimestamps.push(now);
        while (clickTimestamps.length > 0 && clickTimestamps[0] < now - self.config.rateLimitWindow) {
          clickTimestamps.shift();
        }
        if (clickTimestamps.length > self.config.rateLimitMaxRequests) {
          self.recordViolation('RATE_LIMIT_CLICK', `${clickTimestamps.length} clicks/${self.config.rateLimitWindow}ms`);
        }
      }, true);

      document.addEventListener('submit', (e) => {
        const now = Date.now();
        submitTimestamps.push(now);
        const recentSubmits = submitTimestamps.filter(t => t > now - 10000);
        if (recentSubmits.length > 4) {
          e.preventDefault();
          self.recordViolation('RATE_LIMIT_SUBMIT', 'Form spam detected');
        }
      }, true);
    },

    inputSanitization() {
      const self = this;

      document.addEventListener('input', (e) => {
        const el = e.target;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
          const val = el.value;
          if (val.length > self.config.maxInputLength) {
            el.value = val.substring(0, self.config.maxInputLength);
          }
          if (self.detectXSS(val)) {
            self.recordViolation('INPUT_XSS', 'XSS pattern in input');
            el.value = self.sanitizeString(val);
          }
          for (const pattern of self.config.sqlPatterns) {
            pattern.lastIndex = 0;
            if (pattern.test(val)) {
              self.recordViolation('INPUT_SQL', 'SQL injection pattern');
              el.value = '';
              break;
            }
          }
        }
      }, true);

      document.addEventListener('paste', (e) => {
        const clipText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
        if (self.detectXSS(clipText)) {
          e.preventDefault();
          self.recordViolation('PASTE_XSS', 'XSS content in paste blocked');
        }
      }, true);
    },

    honeypotSystem() {
      const self = this;
      const inject = () => {
        document.querySelectorAll('form').forEach((form) => {
          if (form.querySelector('[data-almas-honeypot]')) return;

          const honeypot = document.createElement('input');
          honeypot.type = 'text';
          honeypot.name = 'website_url_confirm';
          honeypot.setAttribute('data-almas-honeypot', 'true');
          honeypot.setAttribute('tabindex', '-1');
          honeypot.setAttribute('autocomplete', 'off');
          honeypot.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;opacity:0;pointer-events:none;';
          honeypot.setAttribute('aria-hidden', 'true');

          const botCheck = document.createElement('input');
          botCheck.type = 'checkbox';
          botCheck.name = 'botcheck';
          botCheck.style.cssText = 'display:none;';
          botCheck.setAttribute('tabindex', '-1');
          botCheck.setAttribute('autocomplete', 'off');

          form.appendChild(honeypot);
          form.appendChild(botCheck);

          form.addEventListener('submit', (e) => {
            if (honeypot.value.length > 0 || botCheck.checked) {
              e.preventDefault();
              self.recordViolation('HONEYPOT', 'Bot trap triggered');
            }
          });
        });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
      } else {
        inject();
      }
    },

    enforceCSP() {
      if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) return;
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://fonts.googleapis.com https://cdnjs.cloudflare.com https://api.web3forms.com https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
        "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.web3forms.com https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://api.web3forms.com",
      ].join('; ');
      document.head.prepend(meta);
    },

    sessionIntegrity() {
      try {
        let storedFp = sessionStorage.getItem('almas_shield_fp');
        const currentFp = this.generateFingerprint();
        if (!storedFp) {
          sessionStorage.setItem('almas_shield_fp', currentFp);
        }
      } catch (e) {}
    },

    generateFingerprint() {
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        navigator.platform,
      ];
      const str = components.join('|');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    },

    formProtection() {
      const self = this;
      const sessionToken = self.generateSessionId();
      const apply = () => {
        document.querySelectorAll('form').forEach((form) => {
          if (form.querySelector('input[name="_almas_sec_token"]')) return;
          const tokenField = document.createElement('input');
          tokenField.type = 'hidden';
          tokenField.name = '_almas_sec_token';
          tokenField.value = sessionToken.substring(0, 16);
          form.appendChild(tokenField);
        });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
      } else {
        apply();
      }
    },

    linkProtection() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        try {
          const origin = window.location.origin !== 'null' ? window.location.origin : 'https://almas-sys.ru';
          const url = new URL(href, origin);
          if (url.protocol === 'javascript:' || url.protocol === 'data:') return;
          if (url.hostname && url.hostname !== window.location.hostname) {
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
          }
        } catch (err) {}
      });
    },

    domProtection() {
      const self = this;
      const dangerousTags = ['object', 'embed', 'applet'];
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && dangerousTags.includes(node.tagName.toLowerCase())) {
              node.remove();
              self.recordViolation('DOM_DANGEROUS_TAG', `<${node.tagName.toLowerCase()}> removed`);
            }
          });
        });
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    },

    urlProtection() {
      const url = window.location.href;
      for (const pattern of this.config.pathTraversalPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(url)) {
          this.recordViolation('URL_TRAVERSAL', 'Path traversal detected');
          break;
        }
      }
    },

    errorBoundary() {
      window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Script error')) return;
      });
    }
  };

  if (typeof window !== 'undefined') {
    window.ALMAS_SHIELD = ALMAS_SHIELD;
    ALMAS_SHIELD.init();
  }
})();
