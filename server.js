const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const path = require('path');
const fs = require('fs');

// 1. SECURITY API KEY & ENVIRONMENT CONFIGURATION LOAD (.env.local / .env)
const envLocalPath = path.join(__dirname, '.env.local');
const envDefaultPath = path.join(__dirname, '.env');

if (fs.existsSync(envLocalPath)) {
    require('dotenv').config({ path: envLocalPath });
} else if (fs.existsSync(envDefaultPath)) {
    require('dotenv').config({ path: envDefaultPath });
} else {
    require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',');

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 2. HELMET SECURITY HTTP HEADERS (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "https://cdn.tailwindcss.com",
                    "https://fonts.googleapis.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com"
                ],
                fontSrc: [
                    "'self'",
                    "https://fonts.gstatic.com",
                    "https://fonts.googleapis.com"
                ],
                imgSrc: ["'self'", "data:", "blob:", "*"],
                connectSrc: ["'self'", "*"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: NODE_ENV === 'production' ? [] : null
            }
        },
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: 'deny' }, // X-Frame-Options: DENY
        noSniff: true,                 // X-Content-Type-Options: nosniff
        xssFilter: true
    })
);

// 3. CORS SECURITY CONFIGURATION
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
                callback(null, true);
            } else {
                callback(new Error('Blocked by CORS policy: Origin not allowed'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
    })
);

// 4. RATE LIMITING MIDDLEWARE
// Global API Rate Limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'Too Many Requests',
        message: 'Вы превысили лимит запросов (100 запросов за 15 минут). Пожалуйста, повторите попытку позже.'
    }
});

// Sensitive Routes Rate Limiter (Auth & Form Submissions): Max 5 attempts per minute per IP
const sensitiveLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'Too Many Requests',
        message: 'Превышен лимит попыток для чувствительной операции (максимум 5 попыток в минуту). Повторите через 60 секунд.'
    }
});

// Apply global rate limit to all /api/ routes
app.use('/api/', apiLimiter);

// 5. INPUT SANITIZATION HELPER (Anti-XSS & Injection)
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

// 6. ZOD VALIDATION SCHEMAS
const kpSchema = z.object({
    name: z.string().min(2, 'Имя или наименование компании обязательно').transform(sanitizeString),
    phone: z.string().min(7, 'Укажите контактный телефон').transform(sanitizeString),
    email: z.string().email('Некорректный формат email').transform(sanitizeString),
    message: z.string().min(5, 'Укажите описание проекта или ТЗ').transform(sanitizeString)
});

const vacancySchema = z.object({
    name: z.string().min(2, 'Укажите ваше ФИО').transform(sanitizeString),
    phone: z.string().min(7, 'Укажите телефон').transform(sanitizeString),
    email: z.string().email('Некорректный email').transform(sanitizeString),
    vacancy: z.string().min(2, 'Выберите вакансию').transform(sanitizeString)
});

// 7. SECURE API ROUTES

// Form: Submit Commercial Proposal / Specs (KP)
app.post('/api/kp', sensitiveLimiter, (req, res) => {
    try {
        const validated = kpSchema.parse(req.body);

        return res.status(200).json({
            success: true,
            message: 'Заявка КП успешно принята и передана инженерам ALMAS',
            data: validated
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ status: 400, error: 'Bad Request', details: err.errors });
        }
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
});

// Form: Apply for Vacancy
app.post('/api/vacancies/apply', sensitiveLimiter, (req, res) => {
    try {
        const validated = vacancySchema.parse(req.body);

        return res.status(200).json({
            success: true,
            message: 'Резюме успешно отправлено в отдел кадров ООО «АЛМАС»',
            data: validated
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ status: 400, error: 'Bad Request', details: err.errors });
        }
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

// Serve static frontend files
app.use(express.static(__dirname));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 8. START EXPRESS SERVER
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ООО ALMAS Security Server running on port ${PORT}`);
    console.log(`🛡️ Helmet Headers: Active (HSTS, CSP, X-Frame-Options)`);
    console.log(`⚡ Rate Limiting: 100 req/15min (Global), 5 req/1min (Sensitive)`);
    console.log(`🔒 Zod Validation & Anti-XSS Sanitization: Active`);
    console.log(`🌐 Allowed CORS Origins: ${ALLOWED_ORIGINS.join(', ')}`);
    console.log(`=======================================================`);
});
