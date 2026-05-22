import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// We will keep our database tool imports
import {testConnection} from './src/models/db.js';
import {getAllProjectsWithOrganizations} from './src/models/projects.js';

// We then import our brand new router file
import appRoutes from './src/routes.js';



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

// Middleware to make NOBE_ENV available to all templates
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

//Global error handler
app.use((err, req, res, next) => {
    // Log error details for debugging
    console.error('Error occured:', err.message);
    console.error('Satck trace:', err.stack);

    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };

    // Render the appropriate error template
    res.status(status).render(`errors/${template}`, context);
});




app.listen (PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);

        // This block will print and verify the projects data:
        console.log('\n-- step6.2: Verifying Service Projects Data ---');
        const sampleProjects = await getAllProjectsWithOrganizations();
        console.table(sampleProjects);
        console.log('---------\n');


    } catch (error) {
        console.error('Error connection to the database:', error);
    }
    
});