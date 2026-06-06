// 1. Import needed model functions at the top
import { body, validationResult } from 'express-validator'; 
import { 
    getAllProjectsWithOrganizations, 
    createProject, 
    getProjectDetails, 
    updateProject      
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
        const messages = req.flash ? req.flash() : {};

        res.render('projects/new-project', {
            title,
            organizations,
            messages
        });

    } catch (error) {
        console.error("Error displaying new project form:", error);
        next(error);
    }
};

/** * Controller to process incoming new project form data submissions
 * RENAMED to processNewForm to match what your route structure expects on Render!
 */
export const processNewForm = async (req, res, next) => {
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
 */
export const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        
        const projectResult = await getProjectDetails(projectId);
        const projectDetails = projectResult.rows ? projectResult.rows[0] : projectResult;
        
        if (!projectDetails) {
            return res.status(404).render('errors/404', { title: 'Project Not Found' });
        }

        const orgResult = await getAllOrganizations();

        // FIXED: Changed 'organizationsResult' to 'orgResult' to eliminate your reference runtime crash
        const organizationsList = orgResult.rows ? orgResult.rows : orgResult;

        const title = 'Edit Service Project';
        const messages = req.flash ? req.flash() : {};

        res.render('projects/edit-project', {
            title,
            projectDetails,
            organizations: organizationsList,
            messages
        });

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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-project/${projectId}`);
        }

        const { title, description, location, date, organizationId } = req.body;

        await updateProject(projectId, title, description, location, date, organizationId);

        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        console.error("Error processing project update request:", error);
        next(error);
    }
};

// We added this at the bottom 
export const processNewProjectForm = processNewForm;