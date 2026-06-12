import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Existing Registration Function from Step 2
 */
const createUser = async (name, email, passwordHash) => {
    const default_role = 'user';

    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4))
        RETURNING user_id;
    `;

    const queryParams = [name, email, passwordHash, default_role];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/** ACTIVITY: USER AUTHENTICATION - FOR STEP 1
 */

// 1. We find a user to record by their unique email address
const findUserByEmail = async (email) => {
    try {
        // The updated SQL query utilizing and explicit database table inner relation JOIN
        const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
        `;

        // We then pass the query configuration object to our pg pool execution handler
        const result = await db.query(query, [email]);

        // We then return the individual row object if found, otherwise we return null
        return result.rows.length > 0 ? result.rows[0] : null;


    } catch (error) {
        console.error("Error executing findUserByEmail model helper:", error);
        throw error;
    }
};

// We then use bcrypt to compare the plain text input password with the stored hash
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

// Orchestrate the authentication check
const authenticateUser = async (email, password) => {
    // We then look up the user by email
    const user = await findUserByEmail(email);
    if (!user) {
        return null; // This is when Email doesn't exist
    }

    // We then verify if the input password matches the stored database hash
    const isPasswordCorrect = await verifyPassword(password, user.password_hash);
    if (!isPasswordCorrect) {
        return null; // This is for password mismatch
    }

    // For security practice: Remove the password hash before passing the user object
    delete user.password_hash;

    return user;
};

/** 
 * ASSIGNMENT ADDITION: Fetch all registered users with their roles
 * Gathers user accounts for the administrative directory
 */
const getAllUsersWithRoles = async () => {
    try {
        const query = `
            SELECT u.user_id, u.name, u.email, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.user_id ASC;
        `;
        
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error("Error executing getAllUsersWithRoles model helper:", error);
        throw error;
    }
};



// EXPORT MAP: Keep createUser, and add authenticateUser (hide internal helpers)
export { 
    createUser,
    findUserByEmail,
    authenticateUser,
    getAllUsersWithRoles
};