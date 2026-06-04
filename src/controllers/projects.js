
// 1. Import needed model functions at the top
import { body, validationResult } from 'express-validator'; 
import { 
    getAllProjectsWithOrganizations, 
    createProject, 
    getProjectDetails, // FIXED: Imported to read single project metrics
    updateProject      // FIXED: Imported from Step 5 to handle database updates
} from '../models/projects.js'; 
import { getAllOrganizations } from '../models/organizations.js'; 
import * as categoryModel from '../models/categories.js';

/**
 * Define the projectValidation rules array
 */
export const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Project title is required.') 
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters.'), 

    body('description')
        .trim()
        .notEmpty().withMessage('Project description is required.') 
        .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters.'), 

     body('location')
        .trim()
        .notEmpty().withMessage('Location details are required.') 
        .isLength({ max: 200 }).withMessage('Location must be under 200 characters.'), 

    body('date')
        .notEmpty().withMessage('Project date is required.') 
        .isISO8601().withMessage('Please select a valid calendar date format.'), 

    body('organizationId')
        .notEmpty().withMessage('An associated partner organization must be selected.') 
        .isInt().withMessage('Invalid organization selection format.') 
];

/**
 * Controller to render the main list of all projects
 */
export const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getAllProjectsWithOrganizations();
        const title = 'Service Projects';

        res.render('projects', { title, projects });
    } catch (error) {
        console.error('Error loading projects page:', error);
        next(error); 
    }
};

/**
 * Controller to render individual project details page
 */
export const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = parseInt(req.params.id, 10);

        // FIXED: Replaced commented placeholder with your working model function
        const project = await getProjectDetails(projectId);

        if (!project) {
            return res.status(404).render('errors/404', { title: 'Project Not Found' });
        }

        const categories = await categoryModel.getCategoriesByProject(projectId);
        const title = project.title;

        res.render('projects/detail', {
            title,
            project,
            categories
        });
    } catch (error) {
        console.error('Error loading project details page:', error);
        next(error);
    }
};

/** * Controller to render the add new project form view
 */
export const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations(); 
        const title = 'Add New Service Project';

        res.render('new-project', { title, organizations }); 
    } catch (error) {
        console.error("Error displaying new project form:", error);
        next(error);
    }
};

/** * Controller to process incoming new project form data submissions
 */
export const processNewProjectForm = async (req, res, next) => {
    try {
        const errors = validationResult(req); 
        
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-project');
        }

        const { organizationId, title, description, location, date } = req.body;

        await createProject(title, description, location, date, organizationId); 

        req.flash('success', 'Service project added successfully!'); 
        res.redirect('/projects'); 
    } catch (error) {
        console.error("Error processing new project form submission:", error);
        next(error);
    }
};

/**
 * STEP 4 ADDITION: Controller to render the Edit Service Project Form view
 * Fetches current details and all organizations for the template dropdown
 */
export const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        
        // Fetch existing record data to populate our inputs
        const projectDetails = await getProjectDetails(projectId);
        
        if (!projectDetails) {
            return res.status(404).render('errors/404', { title: 'Project Not Found' });
        }

        // Fetch organizations list so user can re-assign parent organization ownership if needed
        const organizations = await getAllOrganizations();
        const title = 'Edit Service Project';

        res.render('update-project', { title, projectDetails, organizations });
    } catch (error) {
        console.error("Error displaying edit project form:", error);
        next(error);
    }
};

/**
 * STEP 4 ADDITION: Controller to process the update form submission
 */
export const processEditProjectForm = async (req, res, next) => {
    try {
        const projectId = parseInt(req.params.id, 10);

        // Run validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-project/${projectId}`);
        }

        // Extract update payloads matching the names on update-project.ejs input elements
        const { title, description, location, date, organizationId } = req.body;

        // Fire model function from Step 5
        await updateProject(projectId, title, description, location, date, organizationId);

        req.flash('success', 'Service project updated successfully!');
        
        // Redirect user straight back to updated single project page layout
        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        console.error("Error processing project update request:", error);
        next(error);
    }
};