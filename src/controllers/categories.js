// 1. Import any needed model functions
import { getAllCategories } from "../models/categories.js";
import * as categoryModel from '../models/categories.js';

// 2. Define any controller functions
const showCategoriesPage = async (req, res, next) => {
    try {
        // Fetch the array of category names from the model database helper
        const categories = await getAllCategories();
        const title = 'Service Categories';

        // Render the EJS file passing the database array to the view
        res.render('categories', {title, categories});
    } catch (error) {
        next(error);
        
    }
};

// New: Controller function 
const showCategoryDetailsPage = async (req, res, next) => {
    try {
        // Extract the category ID from the dynamic URL parameter
        const categoryId = parseInt(req.params.id, 10);

        //Fetch the category metadata by its primary key ID
        const category = await categoryModel.getCategoryById(categoryId);

        // If the category doesn't exist render a clean 404 page
        if (!category) {
            const err = new Error('Category Not Found');
            err.status = 404;
            return next(err);
        }

        // Fetch all matching service projects assigned to this specific category
        const projects = await categoryModel.getProjectsByCategory(categoryId);
        const title = `${category.name} Projects`;

        // Render the details template, forwarding your datasets to the EJS view
        res.render('categories/detail', {title, category, projects});
    } catch (error) {
        next(error);
        
    }
};

// 3. Export any controller functions
export {showCategoriesPage, showCategoryDetailsPage};
