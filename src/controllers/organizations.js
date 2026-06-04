// src/controllers/organizations.js

// Import the model functions to query the database
import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// Define validation and sanitization rules for organization form
export const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

/**
 * Controller to render the main list of all organizations
 */
export const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Partner Organizations';

        // Renders to the main list view (organizations.ejs)
        res.render('organizations', { title, organizations });
    } catch (error) {
        console.error("Error in showOrganizationsPage:", error);
        next(error);
    }
};

/**
 * Controllers to render a single organization's details page
 */
export const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;

        // Query the database models for the specific dataset ID
        const organizationDetails = await getOrganizationDetails(organizationId);
        const projects = await getProjectsByOrganizationId(organizationId);
        const title = 'Organization Details';

        // Renders specific organization view template
        res.render('organization', { title, organizationDetails, projects });
    } catch (error) {
        console.error("Error in showOrganizationDetailsPage:", error);
        next(error);
    }
};

/**
 * The controller to render the add new organization form
 */
export const showNewOrganizationForm = async (req, res, next) => {
    try {
        const title = 'Add New Organization';
        res.render('new-organization', { title }); // Corresponds to template
    } catch (error) {
        next(error);
    }
};

/**
 * Controllers to process the incoming form data submission (Step 8)
 */
export const processNewOrganizationForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });

            // Stop execution and redirect back to the form page view template
            return res.redirect('/new-organization');
        }
        
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png';

        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);

        req.flash('success', 'Organization added successfully');
        
        // FIXED: Shifted from plural /organizations/ to singular /organization/ to match routes.js and step guide instructions
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error("Error in processNewOrganizationForm:", error);
        next(error);
    }
};

/**
 * Function for showEditOrganization Form
 */
export const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);
        const title = 'Edit Organization';

        res.render('edit-organization', { title, organizationDetails });
    } catch (error) {
        console.error("Error displaying edit form:", error);
        next(error);
    }
};

/**
 * Function to processEditOrganizationForm
 */
export const processEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;

        const results = validationResult(req); 
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            
            // FIXED: Path matched to point to your exact GET route renderer: /edit-organization/:id
            return res.redirect(`/edit-organization/${organizationId}`); 
        }

        const { name, description, contactEmail, logoFilename } = req.body;

        await updateOrganization(organizationId, name, description, contactEmail, logoFilename);

        req.flash('success', 'Organization updated successfully');
        
        // FIXED: Aligned target pathway string pattern with your actual single-profile layout engine routing rule
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error("Error processing edit form submission:", error);
        next(error);
    }
};