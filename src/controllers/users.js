import bcrypt from 'bcryptjs'; // FIXED: Changed from 'bcrypt' to 'bcryptjs' to match standard database hashes
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
        // FIXED: Using bcryptjs safe salt and hashing methods
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userId = await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login'); // Fixed: Redirect straight to login for better UX
        
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
    if (!req.session || !req.session.user) {
        req.flash('error', 'You need to be logged in to access that page.');
        return res.redirect('/login');
    }
    next(); 
};

/**
 * AUTHORIZATION MIDDLEWARE
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'You need to be logged in to access that page.');
            return res.redirect('/login');
        }

        // Checks if the logged-in user role matches the route requirement (e.g., 'admin')
        if (req.session.user.role_name !== requiredRole) {
            req.flash('error', 'Access Denied: You do not have permission to view that resource.');
            return res.redirect('/'); 
        } 

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

        // If authentication fails (invalid email or mismatched password hash)
        if (!user) {
            req.flash('error', 'Invalid email or password.'); 
            return res.redirect('/login'); 
        }

        // Set login status flag for view templates
        req.session.isLoggedIn = true;

        // SUCCESS PATH: Map properties cleanly. Typo 'user_idid' remains fixed here.
        req.session.user = {
            user_id: user.user_id,
            name: user.name,  
            email: user.email,  
            role_name: user.role_name 
        };

        // Set a welcoming success notification message
        req.flash('success', `Welcome back, ${user.name}!`);

        // We then force rge session state to save completely before executing the page redirect
        req.session.save((err) => {
            if (err) {
                console.error("Critical session synchronization error:", err);
                req.flash('error', 'Login session could not be stablished. Please try again.');
                return res.redirect('/login');
            }
        }); 

        // Redirect the authenticated user based on role or to global dashboard
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error during login process:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

// Controller to render protected dashboard details
const showDashboard = (req, res) => {
    const user = req.session?.user;

    if (!user) {
        return res.redirect('/login');
    }

    res.render('dashboard', {
        title: 'Dashboard',
        user: user 
    }); 
};

/**
 * ---------------------------------------
 * ADMINISTRATIVE USER WORKFLOWS
 * ---------------------------------------
 */
const showUsersManagementPage = async (req, res, next) => {
    try {
        const dataset = await getAllUsersWithRoles();

        res.render('users', {
            title: 'Registered Users Management',
            users: dataset,
            user: req.session.user 
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