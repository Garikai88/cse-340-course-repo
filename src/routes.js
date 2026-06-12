// src/routes.js
import express from 'express';
import { showHomePage } from './controllers/index.js';
import { 
    showOrganizationsPage, 
    showOrganizationDetailsPage, 
    showNewOrganizationForm, 
    processNewOrganizationForm, 
    organizationValidation, 
    showEditOrganizationForm, 
    processEditOrganizationForm 
} from './controllers/organizations.js';
import { 
    showProjectsPage, 
    showProjectDetailsPage, 
    showNewProjectForm, 
    processNewForm,         
    showEditProjectForm,        
    processEditProjectForm,
    projectValidation
} from './controllers/projects.js';
import { 
    showCategoriesPage, 
    showCategoryDetailsPage,
    showAssignCategoriesForm,      
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation
} from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

// Imported user controllers
import {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    requireLogin,
    showDashboard,
    requireRole,
    showUsersManagementPage
} from './controllers/users.js';

const router = express.Router();

// --- Static and Core Views ---
router.get('/', showHomePage);

// --- User Registration & Authentication Routes ---
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);

// NEW User Management Directory Route
// This will link our route to the showUsersManagemntPage controller and secures it
router.get('/users', requireLogin, requireRole('admin'), showUsersManagementPage);

// The request travels left-to-right: it must pass requireLogin first
router.get('/dashboard', requireLogin, showDashboard);

// --- Partner Organization Routes (STEP 8 PROTECTED) ---
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// New Organizations
router.get('/new-organization', requireLogin, requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireLogin, requireRole('admin'), organizationValidation, processNewOrganizationForm);

// Edit Organizations (FIXED TYPO HERE)
router.get('/edit-organization/:id', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireLogin, requireRole('admin'), organizationValidation, processEditOrganizationForm);


// --- Service Project Routes (STEP 8 PROTECTED) ---
router.get('/projects', showProjectsPage);
router.get('/projects/:id', showProjectDetailsPage); 

// New Projects
router.get('/new-project', requireLogin, requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireLogin, requireRole('admin'), projectValidation, processNewForm);

// Edit Projects
router.get('/edit-project/:id', requireLogin, requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireLogin, requireRole('admin'), projectValidation, processEditProjectForm);


// --- Service Categories & Assignment Routes (STEP 8 PROTECTED) ---
router.get('/categories', showCategoriesPage);
router.get('/categories/:id', showCategoryDetailsPage);

// New Categories
router.get('/new-category', requireLogin, requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireLogin, requireRole('admin'), categoryValidation, processNewCategoryForm);

// Edit Categories
router.get('/edit-category/:id', requireLogin, requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireLogin, requireRole('admin'), categoryValidation, processEditCategoryForm);

// Category Assignment
router.get('/project/:projectId/assign-categories', requireLogin, requireRole('admin'), showAssignCategoriesForm); 
router.post('/project/:projectId/assign-categories', requireLogin, requireRole('admin'), processAssignCategoriesForm);

// The log out route
router.get('/logout', (req, res) => {
    // Destroy the express-session instance entirely from memory store
    req.session.destroy((err) => {
        if (err) {
            console.error("Error clearing session during logout process:", err);
            return res.redirect('/dashboard');
        }

        // We then clear out the client-side authentication cookie cache token
        res.clearCookie('connect.sid'); 

        // We then redirect back to the public homepage context as an anonymous guest
        res.redirect('/');
    });
});


// --- Error Handling Routes ---
router.get('/test-error', testErrorPage);

export default router;









