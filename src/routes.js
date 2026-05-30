



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
    processNewProjectForm 
} from './controllers/projects.js';
import { 
    showCategoriesPage, 
    showCategoryDetailsPage,
    showAssignCategoriesForm,      // ADDED for Category Assignments
    processAssignCategoriesForm    // ADDED for Category Assignments
} from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

// --- Static and Core Views ---
router.get('/', showHomePage);

// --- Partner Organization Routes ---
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/new-organization', showNewOrganizationForm);
router.get('/edit-organization/:id', showEditOrganizationForm);

// Organization POST processing handlers
router.post('/new-organization', organizationValidation, processNewOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);

// --- Service Project Routes ---
router.get('/projects', showProjectsPage);
// FIXED: Changed from '/projects/:id' to '/project/:id' to fix the 404 error
router.get('/project/:id', showProjectDetailsPage); 
router.get('/new-project', showNewProjectForm);

// Project POST processing handler
router.post('/new-project', processNewProjectForm);

// --- Service Categories & Assignment Routes ---
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

// STEP 3: Category Assignment Routes
router.get('/assign-categories/:projectId', showAssignCategoriesForm); //
router.post('/assign-categories/:projectId', processAssignCategoriesForm); //

// --- Error Handling Routes --- 
router.get('/test-error', testErrorPage);

export default router;
