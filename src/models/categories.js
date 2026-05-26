// src/models/categories.js
import db from './db.js'; // Imports the custom pool wrapper

/**
 * Retrieves all category names from the database sorted alphabetically.
 * @returns {Promise<Array>} This an array of gategory objects.
 */

export async function getAllCategories() {
    const queryText = `
    SELECT category_id, name
    FROM category
    ORDER BY name ASC;
    `;

    try {
        const result = await db.query(queryText);
        return result.rows;

    } catch (error) {
        console.error('Error executing getAllCategories query:', error);
        throw error;
    }
}

/**
 * Retrieves all categories associated with a specific project
 * @param {number} projectId
 * @returns {Promise<Array>} Array of category objects
 */

export async function getCategoriesByProject(projectId) {
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
}

/**
 * Retrieves all service projects associated with a given category
 * @param {number} categoryId
 * @returns {Promise<Array>} Array of service project objects
 */

export async function getProjectsByCategory(categoryId) {
    const queryText = `
    SELECT sp.* FROM service_project sp
    INNER JOIN project_category pc IN sp.project_id = pc.project_id
    WHERE pc.category_id = $1
    ORDER BY sp.title ASC;
    `;

    try {
        const result = await db.query(queryText, [categoryId]);
        return result.rowsa;
    } catch (error) {
        console.error('Error executing getProjectsByCategory query:', error);
        throw error;
    }
}