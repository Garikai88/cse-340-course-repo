// src/models/projects.js
import db from './db.js';


/**
 * Retrieves all service projects along wit their sponsoring organization names.
 * @returns {Promise<Array>} This array resolves to an array of project objects. 
 */

 export async function getAllProjectsWithOrganizations() {
    const queryText = `
        SELECT 
            p.project_id,
            o.name AS organization_name,
            p.title AS project_title,
            p.location,
            p.project_date,
            p.description
        FROM service_project p
        JOIN organization o ON p.organization_id = o.organization_id;
     `;

    try {
        const result = await db.query(queryText);
        return result.rows;

    } catch (error) {
        console.error('Error executing getAllProjectsWithOrganizations query:', error);
        throw error;
    }
}
