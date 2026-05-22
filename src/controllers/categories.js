// 1. Import any needed model functions
import { getAllCategories } from "../models/categories.js";

// 2. Define any controller functions
const showCategoriesPage = async (req, res) => {
    try {
        // Fetch the array of category names from the model database helper
        const categories = await getAllCategories();
        const title = 'Service Categories';

        // Render the EJS file passing the database array to the view
        res.render('categories', {title, categories});
    } catch (error) {
        console.error('Error loading categories page:', error);
        res.status(500).send('Internal Server Error');
    }
};

// 3. Export any controller functions
export {showCategoriesPage};
