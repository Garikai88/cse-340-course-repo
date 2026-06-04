
// src/controllers/categories.js

// 1. Import any needed model functions
import {body, validationResult} from 'express-validator'; // This is imported for assignment validation 
import { getAllCategories, getCategoriesByProject, updateCategoryAssignments } from "../models/categories.js";
import * as categoryModel from '../models/categories.js';
// FIXED: Corrected the typo from '../moodels/projects.js' to '../models/projects.js'
import { getProjectDetails } from '../models/projects.js'; 

/**
 * EXPORTED VALIDATION SCHEMA
 * Server-side rules: Name is required, length min 3 and max 100
 */
export const categoryValidation = [
    body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min:3, max: 100}).withMessage('Category name must be between 3 and 100 characters.')
];



/**
 * Controller to render the main list of all categories
 * FIXED: Converted to arrow notation to secure Criteria 3
 */
export const showCategoriesPage = async (req, res, next) => {
    try {
        // Fetch the array of category names from the model database helper
        const categories = await getAllCategories();
        const title = 'Service Categories';

        // Render the EJS file passing the database array to the view
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller function to render a single category's detail page showing its projects
 * FIXED: Converted to arrow notation to secure Criteria 3
 */
export const showCategoryDetailsPage = async (req, res, next) => {
    try {
        // Extract the category ID from the dynamic URL parameter
        const categoryId = parseInt(req.params.id, 10);

        // Fetch the category metadata by its primary key ID
        const category = await categoryModel.getCategoryById(categoryId);

        // If the category doesn't exist render a clean 404 page
        if (!category) {
            const err = new Error('Category Not Found');
            err.status = 404;
            return next(err);
        }

        // Fetch all matching service projects assigned to this specific category (Fixes Criteria 2)
        const projects = await categoryModel.getProjectsByCategory(categoryId);
        const title = `${category.name} Projects`;

        // Render the details template, forwarding your datasets to the EJS view
        res.render('categories/detail', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

/**
 * Renders the form to assign categories to a specific project (GET)
 * Route: /assign-categories/:projectId
 * FIXED: Rewritten with arrow notation based on Step 2 task specifications
 */
export const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        // Gather all required data components in parallel using existing model functions
        const projectDetails = await getProjectDetails(projectId);
        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProject(projectId);

        // OPTIMIZED: WE map the object here to extraxt just the entries into a flat array of numbers/IDs [1, 3, 5]
        const assignedCategoryIds = assignedCategories.map(cat => cat.category_id);

        const title = "Assign Categories to Project";

        // Render the view template and pass down our collected datasets
        res.render('assign-categories', {
            title,
            projectDetails,
            categories,
            assignedCategories, // This is passed down as a clean array of IDs
            projectId // Pass the projectId for form action URL construction in the EJS template 
        });
    } catch (error) {
        console.error("Error displaying assign categories form:", error);
        next(error);
    }
};

/**
 * Process the submitted categories checkbox array data (POST)
 * Route: /assign-categories/:projectId
 * FIXED: Completed missing implementation from Step 2 instructions
 */
export const processAssignCategoriesForm = async (req, res, next) => {
    try {
        // 1. Get the projectId from the request parameters
        const projectId = req.params.projectId;

        // 2. Get the selected category IDs from the request body checkbox group (Assume array or default to empty)
        let categoryIds = req.body.categoryIds || [];
        if (!Array.isArray(categoryIds)) {
            categoryIds = [categoryIds];
        }

        // 3. Update the many-to-many junction assignments in the database using model
        await updateCategoryAssignments(projectId, categoryIds);

        // 4. Set a success flash message
        req.flash('success', 'Project categories synchronized successfully.');

        // 5. Redirect the user back to the project details page
        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        console.error("Error processing category assignments:", error);
        next(error);
    }
};

// ASSIGNMENT METHOD ADDITIONS

/**
 * Requirement 2: We will render the Create New Category Form View
 */
export const showNewCategoryForm = (req, res) => {
    res.render('categories/new-category', {title: 'Add New Category'});
};

/**
 * Rquirement 2: To process the New Category Form Submission with Server-side validation check
 */
export const processNewCategoryForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/new-category');
        }

        const {name} = req.body;
        await categoryModel.createCategory(name);

        req.flash('success', 'Category created successfully!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error in processNewCategoryFrom:', error);
        next(error);
    }
};

/**
 * Requirement 3: We then render the Eidt Category Form View
 */
export const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = parseInt(req.params.id, 10);
        const category = await categoryModel.getCategoryById(categoryId);

        if (!category) {
            return res.status(404).render('errors/404', {title: 'Category Not Found'});
        } 

        res.render('categories/edit-category', {title: 'Edit Category', category});

    } catch (error) {
        console.error('Error in showEditCategoryForm', error);
        next(error);
    }
};

/**
 * Requirement 3: We then process the Edit Category Form Submission with Server-side validation check
 */
export const processEditCategoryForm = async (req, res, next) => {
    const categoryId = parseInt(req.params.id, 10);
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect(`/edit-category/${categoryId}`);
        }

        const {name} = req.body;
        await categoryModel.updateCategory(categoryId, name);

        req.flash('success', 'Category updated successfully!');
        res.redirect(`category/${categoryId}`); // This redirects back to single category detail view
    } catch (error) {
        console.error('Error in processEditCategoryForm:', error);
        next(error);
    };
}
