import express from 'express';
import {showHomePage} from './controllers/index.js';
// We Update the new line to pull both functions from the organizations controller
import {showOrganizationsPage, showOrganizationDetailsPage} from './controllers/organizations.js';
import { showProjectsPage } from './controllers/projects.js';
import { showCategoriesPage, showCategoryDetailsPage} from './controllers/categories.js';
import {testErrorPage} from './controllers/errors.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', showCategoriesPage);

// New route hndling requests for specific categories
router.get('/category/:id', showCategoryDetailsPage);

// We add the dynamic route parameter for the details page at the end of the list
// oute for organization details page
router.get('/organization/:id', showOrganizationDetailsPage);

// error-handling routes
router.get('/test-error', testErrorPage);

export default router;




