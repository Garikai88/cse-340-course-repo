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
            project_date
        FROM service_project
        WHERE organization_id = $1
        ORDER BY project_date DESC;
    `;
    const queryParams = [organizationId];
    const result = await db.query(query, queryParams);
    return result.rows;
};

// iNSERTS A NEW SERVICE PROJECT INTO THE DATABASE
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO service_project (title, description, location, project_date, organization_id)
        VALUES ($1, $2, $£, $4, $5)
        RETURNING project_id;
        `;

        const queryParams = [title, description, location, date, organizationId];
        const result = await db.query(query, queryParams);

        if (result.rows.length == 0) {
            throw new Error('Failed to create project');
        }

        return result.rows[0].project_id;
};

//  BINGO: Export all three functions together so no controllers break!
export { 
    getAllProjects, 
    getAllProjectsWithOrganizations, 
    getProjectsByOrganizationId, 
    createProject 
};



