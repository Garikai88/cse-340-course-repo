import bcrypt from 'bcrypt';
import { createUser, authenticateUser, getAllUsersWithRoles } from '../models/users.js';

/**
 * ------------------------------------------------------------------------
 * REGISTRATION CONTROLLERS
 * ------------------------------------------------------------------------
 */
const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userId = await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
        
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

/**
 * ------------------------------------------------------------------------
 * LOGIN & AUTHENTICATION CONTROLLERS
 * ------------------------------------------------------------------------
 */

// Route Protection Guard Middleware
const requireLogin = (req, res, next) => {
    // FIXED TYPO: Corrected "req.sesion.user" to "req.session.user"
    if (!req.session || !req.session.user) {
        // Flash an error message to let the user know they need to sign in
        req.flash('error', 'You need to be logged in to access that page.');
        // This will halt further execution and bounce them back to the login view
        return res.redirect('/login');
    }

    // If they are logged in, we will call next() to let them pass through
    next(); 
};

/**
 * AUTHORIZATION MIDDLEWARE
 */
// This function accepts the required role string annd returns and Express middleware function
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        // We will double check authentication state defensively
        if (!req.session || !req.session.user) {
            req.flash('error', 'You need to be logged in to access that page.');
            return res.redirect('/login');
        }

        // We check if the logged-in user has the specific required role
        // This assumes our database/session stores the role property (e.g., 'admin' or 'client')
        if (req.session.user.role_name !== requiredRole) {
            req.flash('error', 'Access Denied: You do not have permission to view that resource.');
            return res.redirect('/'); // This safely bounces regular users back t their dashboard
        } 

        // This lets them pass through if they have the correct role
        next();
    };
};

// 1. Render the login form view
const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' }); 
};

// 2. Process login form submission data
const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Authenticate the user against the database using our model function
        const user = await authenticateUser(email, password);

        // If the authentication fails (invalid email or mismatched password)
        if (!user) {
            req.flash('error', 'Invalid email or password.'); 
            return res.redirect('/login'); 
        }

        // We then explicitly set login status flag to our header tracking templates
        req.session.isLoggedIn = true;

        // SUCCESS PATH: Store the clean user object inside the express-session data store
        // We will explicitly map the properties from the model query to keep things safe
        req.session.user = {
            user_id: user.user_id,
            name: user.name,  // This matches u.user_id from our model JOIN 
            email: user.email,  // This matches u.email from our model JOIN
            role_name: user.role_name // This matches r.role_name from your model JOIN
        };

        // Set a welcoming success notification message
        req.flash('success', `Welcome back, ${user.name}!`);

        // Redirect the authenticated user back to the home view application context
        res.redirect('/dashboard');

    } catch (error) {
        // Fallback catch block for unexpected system errors
        console.error('Error during login process:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

// Controller to render protected dashboard details
const showDashboard = (req, res) => {
    // Defensively check for req.session using optional chaining (?.) so it never throws an uncaught error
    const user = req.session?.user;

    // Fallback block just in case the middleware configuration is ever altered down the road
    if (!user) {
        return res.redirect('/login');
    }

    // We then render the layout template and pass the structural variables
    res.render('dashboard', {
        title: 'Dashboard',
        user: user // This passes the complete user session object down to the view
    }); 
};

/**
 * ---------------------------------------
 * ADMINISTARTIVE USER WORKFLOWS
 * ---------------------------------------
 */

/**
 * Controller method to collect account registries and build the view
 */
const showUsersManagementPage = async (req, res, next) => {
    try {
        // We pull down our database join array using our model function
        const dataset = await getAllUsersWithRoles();

        res.render('users', {
            title: 'Registered Users Management',
            users: dataset,
            user: req.session.user //This hands down the session user to satisfy the view's defensive check 
        });
    } catch (error) {
        console.error('Error bringing up user management view:', error);
        req.flash('error', 'Could not load user accounts list system records.');
        res.redirect('/dashboard');
    }
};

// EXPORT MAP
export { 
    showUserRegistrationForm, 
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    requireLogin, 
    showDashboard,
    requireRole,
    showUsersManagementPage
};