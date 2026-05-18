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