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

// ALIGNED: Plural pathing matches your controller redirects and cancel actions
router.get('/projects/:id', showProjectDetailsPage); 
router.get('/new-project', showNewProjectForm);

// FIXED FOR STEP 7: Routes use /edit-project/:id to match task specifications exactly
router.get('/edit-project/:id', showEditProjectForm);

// Project POST processing handlers (With projectValidation injected!)
router.post('/new-project', projectValidation, processNewForm);

// FIXED FOR STEP 7: Form processing route updated to match specification exactly
router.post('/edit-project/:id', projectValidation, processEditProjectForm);

// --- Service Categories & Assignment Routes ---
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

// ASSIGNMENT REQUIREMENT: Created Category endpoints
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);

// Category Endpoints
router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);

// FIXED FOR STEP 3: Category assignment sync paths
router.get('/project/:projectId/assign-categories', showAssignCategoriesForm); 
router.post('/project/:projectId/assign-categories', processAssignCategoriesForm); 

// --- Error Handling Routes ---
router.get('/test-error', testErrorPage);

export default router;









