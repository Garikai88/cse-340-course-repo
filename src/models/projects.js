// src/models/projects.js
import db from './db.js';

// 1. Core function to retrieve all raw projects
async function getAllProjects() {
    const queryText = 'SELECT * FROM service_project ORDER BY project_date DESC;';
    const result = await db.query(queryText);
    return result.rows;
}

// 2. Verification function used by server.js
async function getAllProjectsWithOrganizations() {
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
    const result = await db.query(queryText);
    return result.rows;
}

// 3. Dynamic details function used by organization profiles
const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT 
            project_id,
            organization_id,
            title,
            description,
            location,
            date
        FROM service_project
        WHERE organization_id = $1
        ORDER BY date;
    `;
    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);
    return result.rows;
};

//  BINGO: Export all three functions together so no controllers break!
export { 
    getAllProjects, 
    getAllProjectsWithOrganizations, 
    getProjectsByOrganizationId 
};



