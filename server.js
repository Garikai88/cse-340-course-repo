import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import flash from './src/middleware/flash.js';

// We will keep our database tool imports
import {testConnection} from './src/models/db.js';
import {getAllProjectsWithOrganizations} from './src/models/projects.js';

// We then import our brand new router file
import appRoutes from './src/routes.js';

// New: Here we import the central global error handler function from our controller
import { handleGlobalErrors } from './src/controllers/errors.js'; 



// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will isten on
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * Configure Express middleware
 */

// Middleware to parse incoming POST request bodies
// It allows Express to decode standard HTML from submissions
app.use(express.urlencoded({ extended: true }));

// Use flash message middleware
app.use(flash);

// Allows Express to understand JSON-formattted paylods
app.use(express.json());

// Load the session secret string from the environment variables
const SESSION_SECRET = process.env.SESSION_SECRET;

// We configure session management pipeline before loading any routes
app.use(session({ 
    secret: SESSION_SECRET,
    resave: false,                // Prevents saving sessions that haven't changed 
    saveUninitialized: false,     // Prevents saving blank/empty sessions
    cookie: {
        secure: false,            // Set to false for HTTP localhost development
        maxAge: 1000 * 60 * 60    // Keeps the user session active for an hour
    }
}));

// Flash Middleware Mouted here
app.use(flash);

// The static asset configuration
app.use(express.static('public'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname,'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

// Mddleware to log all incoming requests
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); // This will pass control to the next middleware or route
});

// Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

/**
 * Routes
 */

// We will mount all the controller routes cleanly using our new router
app.use(appRoutes);


// Cath-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// We delegate global error handling directly to our controller function
// This is to respect clean MVC boundaries and utilizes our custom folder path strings
app.use(handleGlobalErrors);

/**
 * Server Startup &DB Boot Verification Matrix
 */
app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);

        // We verify the block to print active workspace rows
        console.log('\n-- step6.2: Verifying Service Projects Data ---');
        const sampleProjects = await getAllProjectsWithOrganizations();
        console.table(sampleProjects);
        console.log('--------\n');


    } catch (error) {
        console.error('Error connecting to the database:', error);

    }
});
