import express from 'express';

import { fileURLToPath } from 'url';
import path from 'path';
import {testConnection} from './src/models/db.js';
import {getAllOrganizations} from './src/models/organizations.js';
import {getAllProjectsWithOrganizations} from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';



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

/**
 * Routes
 */
app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

app.get('/organizations', async (req, res) => {
    const organizations = await getAllOrganizations();
    

    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
});

app.get('/categories', async (req, res) => {
    try {
        //1. Fetch the array of category names for the model database helper
        const categories = await getAllCategories();

        const title = 'Our categories of the work we do';

        // 2. We Render the EJS file passing the database array to the view 
        res.render('categories', { title, categories });
    } catch (error) {
        console.error('Error loading categories page:', error);
        res.status(500).send('Internal Server Error');
    }
        
});

// Start the server
app.get('/projects', async (req, res) => {
    try {
        // We fetch the relational project list from the database model
        const projects = await getAllProjectsWithOrganizations();

        const title = 'Service Projects';

        // We then pass both the page title and the projects array data into the view template
        res.render('projects', { title, projects });


    } catch (error) {
        console.error('Error loading projects page:', error);
        res.status(500).send('Internal Server Error');
    }    
   
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