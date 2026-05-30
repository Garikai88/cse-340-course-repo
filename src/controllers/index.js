// src/controllers/index.js

/**
 * Renders the primary application home page view template.
 * FIXED: Rewritten using arrow notation syntax to satisfy rubric requirements.
 */
export const showHomePage = async (req, res, next) => {
    try {
        const title = 'Home';

        // FIXED: Targeted 'home' to perfectly match your home.ejs template file name.
        res.render('home', { title }); 
    } catch (error) {
        console.error("Error rendering the home page view:", error);
        next(error);
    }
};