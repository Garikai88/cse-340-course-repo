// src/controllers/organizations.js

// Import the model functions to query the database
import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// Define validation and sanitization rules for organization form
const organizationValidation = [
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
const showOrganizationsPage = async (req, res, next) => {
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
const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        // 1. We capture the ID from the URL parameter
        const organizationId = req.params.id;

        // 2. We query the database models for the specific dataset ID
        const organizationDetails = await getOrganizationDetails(organizationId);
        const projects = await getProjectsByOrganizationId(organizationId);

        // 3. We then define the page title string
        const title = 'Organization Details';

        // 4. We send all 3 variables directly to our organization.ejs template
        res.render('organization', { title, organizationDetails, projects });
    } catch (error) {
        console.error("Error in showOrganizationDetailsPage:", error);
        next(error);
    }
};

// The controller to render the add new organization form
const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

// Controllers to process the incoming form data submission
const processNewOrganizationForm = async (req, res, next) => {
    try {
        // Adding the check for input validation errors
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });

            // We stop execution and redirect back to the form
            return res.redirect('/new-organization');
        }
        
        // 1. We extract named properties out of the parsed req.body object
        const { name, description, contactEmail } = req.body;

        // 2. We then hardcode a fallback string value for the logo filename parameter
        const logoFilename = 'placeholder-logo.png';

        // 3. Then we trigger the model function and await the new row's ID
        const organizationId = await createOrganization(name, description, contactEmail, logoFilename);

        // Set a success flash message
        req.flash('success', 'Organization added successfully');

        // We send the user straight to the profile page of their new record
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error("Error in processNewOrganizationForm:", error);
        next(error);
    }
};

// Function for showEditOrganization Form
const showEditOrganizationForm = async (req, res) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);
        const title = 'Edit Organization';

        // Renders the 'edit-organization.ejs' view and passes variables
        res.render('edit-organization', { title, organizationDetails });
    } catch (error) {
        console.error("Error displaying edit form:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Function to processEditOrganizationForm
const processEditOrganizationForm = async (req, res, next) => { // Added next for standard error handling architecture
    try {
        // We get the organization ID from the URL parameters
        const organizationId = req.params.id;

        // Check for input validation errors from express-validator
        const results = validationResult(req); //
        if (!results.isEmpty()) {
            // Validation Failed - loop through errors and queue flash messages
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            
            // FIXED: Swapped single quotes for backticks to make string template evaluation work seamlessly!
            return res.redirect(`/edit-organization/${organizationId}`); //
        }

        // If valid, we proceed with extraction and database update as before
        const { name, description, contact_email, logo_filename } = req.body;

        await updateOrganization(organizationId, name, description, contact_email, logo_filename);

        // We then redirect the user back to the updated organization details page
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error("Error processing edit form submission:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Export all controller functions so the router can use them
export { 
    showOrganizationsPage, 
    showOrganizationDetailsPage, 
    showNewOrganizationForm, 
    processNewOrganizationForm, 
    organizationValidation, 
    showEditOrganizationForm,
    processEditOrganizationForm
};

