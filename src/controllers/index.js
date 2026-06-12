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

/**
 * Role-Based Access Control (RBAC) Guard Interceptor
 * @param {String} requiredRole - The specif role tier string needed to proceed (e.g., 'admin')
 */
export const requireRole = (requiredRole) => {
    return (req,res,next) => {
        // We then ensure the user is authenticated first by checking the session structure
        if (!req.session || !req.session.user) {
            req.flash('error', 'Please log in to access this resource.');
            return res.redirect('/login');
        }

        // We then check to see if the user's role matches the required role tier
        if (req.session.user.role !== requiredRole) {
            req.flash('error', 'Access Denied: You do not have the required permissions.');

            // Redirect unauthorized users safely back to their dashboard or home page
            return res.redirect('/dashboard');
        }

        // The user then passes both identity and role permission requirements, we clear the pipe
        next();
    };
};