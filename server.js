import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import flash from './src/middleware/flash.js';

// Database tool imports
import { testConnection } from './src/models/db.js';
import { getAllProjectsWithOrganizations } from './src/models/projects.js';

// Central routing import
import appRoutes from './src/routes.js';

// Central global error handler function
import { handleGlobalErrors } from './src/controllers/errors.js'; 

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * ==========================================
 * 1. CORE BODY PARSERS (Step 7)
 * ==========================================
 */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * ==========================================
 * 2. SESSION CONFIGISTRATION (Must be before flash!)
 * ==========================================
 */
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret_for_local_dev';
app.use(session({ 
    secret: SESSION_SECRET,
    resave: false,                
    saveUninitialized: false,     
    cookie: {
        secure: false,              //This is crucial for HTTP localhost development environments
        SameSite: 'lax',           // This forces modern browsers to store session IDs during redirects
        maxAge: 1000 * 60 * 60    // Keeps the user session active for an hour
    }
}));

/**
 * ==========================================
 * 3. FLASH MESSAGE MIDDLEWARE (Must be after session!)
 * ==========================================
 */
app.use(flash);

/**
 * ==========================================
 * 4. STATIC ASSETS & VIEW ENGINE
 * ==========================================
 */
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

/**
 * ==========================================
 * 5. UTILITY & DIAGNOSTIC MIDDLEWARE
 * ==========================================
 */
app.use((req, res, next) => {
    // Standardize comparison to check the raw process environment safely
    if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); 
});

// This is for the Session State Tracking Middleware for UI Display Toggle
app.use((req, res, next) => {
    // 1. Safely initialize a default status value on res.locals
    res.locals.isLoggedIn = false;
    res.locals.user = null;

    // 2. Double check if express-session has successfully attached the data structure
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user; // Exposes user profile data (name, email) to templates too!
    }

    // 3. Keep global environment variable exposure intact
    res.locals.NODE_ENV = NODE_ENV;

    // 4. Always call next() to clear the pipe
    next();
});

/**
 * ==========================================
 * 6. ROUTE REGISTRATION
 * ==========================================
 */
app.use(appRoutes);

/**
 * ==========================================
 * 7. ERROR HANDLING MIDDLEWARE (Must be dead last!)
 * ==========================================
 */
// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Delegate global error handling directly to our controller function
app.use(handleGlobalErrors);

/**
 * Server Startup & DB Boot Verification Matrix
 */
app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);

        console.log('\n-- step6.2: Verifying Service Projects Data ---');
        const sampleProjects = await getAllProjectsWithOrganizations();
        console.table(sampleProjects);
        console.log('--------\n');

    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});
