// src/models/categories.js
import db from './db.js';

/**
 * Retrieves all category names from the database sorted alphabetically.
 */
export const getAllCategories = async () => {
    const queryText = `SELECT category_id, name FROM category ORDER BY name ASC;`;
    try {
        const result = await db.query(queryText);
        return result.rows;
    } catch (error) {
        console.error('Error executing getAllCategories query:', error);
        throw error;
    }
};

/**
 * Retrieves a specific category by its ID (Fixes the crashing detail controller bug!)
 */
export const getCategoryById = async (categoryId) => {
    const queryText = `SELECT category_id, name FROM category WHERE category_id = $1;`;
    try {
        const result = await db.query(queryText, [categoryId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error executing getCategoryById query:', error);
        throw error;
    }
};

/**
 * Retrieves all categories associated with a specific project
 */
export const getCategoriesByProject = async (projectId) => {
    const queryText = `
        SELECT c.category_id, c.name
        FROM category c
        INNER JOIN project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name ASC;
    `;
    try {
        const result = await db.query(queryText, [projectId]);
        return result.rows;
    } catch (error) {
        console.error('Error executing getCategoriesByProject query:', error);
        throw error;
    }
};

/**
 * Retrieves all service projects associated with a given category
 */
export const getProjectsByCategory = async (categoryId) => {
    const queryText = `
        SELECT sp.* FROM service_project sp
        INNER JOIN project_category pc ON sp.project_id = pc.project_id
        WHERE pc.category_id = $1
        ORDER BY sp.title ASC;
    `;
    try {
        const result = await db.query(queryText, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error('Error executing getProjectsByCategory query:', error);
        throw error;
    }
};

/**
 * Helper function to link a single category ID to a specific project ID
 */
const assignCategoryToProject = async (projectId, categoryId) => {
    try {
        const sql = `INSERT INTO project_category (project_id, category_id) VALUES ($1, $2);`;
        await db.query(sql, [projectId, categoryId]);
    } catch (error) {
        console.error("Database error in assignCategoryToProject:", error);
        throw error;
    }
};

/**
 * Synchronizes category assignments
 */
export const updateCategoryAssignments = async (projectId, categoryIds) => {
    try {
        const deleteSql = `DELETE FROM project_category WHERE project_id = $1;`;
        await db.query(deleteSql, [projectId]);

        if (!categoryIds || categoryIds.length === 0) return true;

        for (const categoryId of categoryIds) {
            await assignCategoryToProject(projectId, categoryId);
        }
        return true;
    } catch (error) {
        console.error("Database error in updateCategoryAssignments:", error);
        throw error;
    }
};

// ASSIGNMENT ADDITIONS: WE INSERT & UPDATE CATEGORIES
/**
 * Requirement 2: Inserts a brand new category in the 'category' table
 * Parameterized to ensure safety SQL Injection attacks
 */
export const createCategory = async (name) => {
    const queryText = `
    INSERT INTO category (name)
    VALUES ($1)
    RETURNING *;
    `;
    try {
        const result = await db.query(queryText, [name]);
        if (result.rows.length === 0) {
            throw new Error('Failed to insert new category.');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error executing createCategory query:', error);
        throw error;
    }
};

/**
 * Requirement 3: Updates an existing category name by its ID inside the 'category' table
 * 
 */
export const updateCategory = async (categoryId, name) => {
    const queryText = `
    UPDATE category
    SET name = $1
    WHERE category_id = $2
    RETURNING *;
    `;
    try {
        const result = await db.query(queryText, [name, categoryId]);
        if (result.rows.length === 0) {
            throw new Error('Category not found or update criteria failed');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error executing updateCategory query:', error);
        throw error;
    }
};