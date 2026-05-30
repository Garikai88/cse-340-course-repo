// src/controllers/projects.js

// 1. Import needed model functions at the top
import { body, validationResult } from 'express-validator'; //
import { getAllProjectsWithOrganizations, createProject } from '../models/projects.js'; // FIXED: Added createProject import
import { getAllOrganizations } from '../models/organizations.js'; //
import * as categoryModel from '../models/categories.js';

/**
 * Define the projectValidation rules array
 */
const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Project title is required.') //
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters.'), //

    body('description')
        .trim()
        .notEmpty().withMessage('Project description is required.') // FIXED: Added () to .notEmpty()
        .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters.'), //

     body('location')
        .trim()
        .notEmpty().withMessage('Location details are required.') // FIXED: Added () to .notEmpty()
        .isLength({ max: 200 }).withMessage('Location must be under 200 characters.'), // FIXED: Changed max from 1000 to 200

    body('date')
        .notEmpty().withMessage('Project date is required.') // FIXED: Added () to .notEmpty()
        .isISO8601().withMessage('Please select a valid calendar date format.'), //

    body('organizationId')
        .notEmpty().withMessage('An associated partner organization must be selected.') // FIXED: Added () to .notEmpty()
        .isInt().withMessage('Invalid organization selection format.') // FIXED: Changed .isISO8601() to .isInt()
];

// 2. Define controller functions with descriptive names
const showProjectsPage = async (req, res, next) => {
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
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = parseInt(req.params.id, 10);

        // Note: Keeping your commented project fetch line as-is
        // const project = await getProjectById(projectId);

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
 * Fetches organizations list to dynamically build the dropdown menu
 */
const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations(); //
        const title = 'Add New Service Project';

        res.render('new-project', { title, organizations }); //
    } catch (error) {
        console.error("Error displaying new project form:", error);
        next(error);
    }
};

/** * Controller to process incoming new project form data submissions
 */
const processNewProjectForm = async (req, res, next) => {
    try {
        // Intercept validation results before calling model layer
        const errors = validationResult(req); //
        
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            // Stop execution and bounce the user back to the form page
            return res.redirect('/new-project');
        }

        // Extract project fields out of req.body
        const { organizationId, title, description, location, date } = req.body; //

        // Trigger model function to run the INSERT statement
        await createProject(title, description, location, date, organizationId); //

        // Queue a success flash message
        req.flash('success', 'Service project added successfully!'); //

        // Redirect back to the main service project list route
        res.redirect('/projects'); //
    } catch (error) {
        console.error("Error processing new project form submission:", error);
        next(error);
    }
};

// 3. Export all controller functions at the bottom including the validation array
export { 
    showProjectsPage, 
    showProjectDetailsPage, 
    showNewProjectForm, 
    processNewProjectForm,
    projectValidation // <-- Exported so routes.js can attach it as middleware
};
