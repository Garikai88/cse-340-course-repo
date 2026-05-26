// 1. Import any needed model functions at the top
import{getAllProjectsWithOrganizations} from '../models/projects.js';
import * as categoryModel from '../models/categories.js';

// 2. Define any controller functions with descriptive name
const showProjectsPage = async (req, res,next) => {
    try {
        const projects = await getAllProjectsWithOrganizations();
        const title = 'Service Projects';

        res.render('projects', {title, projects});

    } catch (error) {
        console.error('Error loading projects page:', error);
        next(error); // This sends the error straight to global error handler
    }
};

// New: Updated the individual project details controller function
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = parseInt(req.params.is, 10);

        // 1. We fetch the single project record
        // const project = await getProjectById(projectId);

        if (!project) {
            return res.status(404).render('errors/404',{title: 'Project Not Found'});
        }

        // We fetch all categories assigned to this specific project ID
        const categories = await categoryModel.getCategoriesByProject(projectId);
        const title = project.title;

        // We render and pass BOTH variables down to the EJS engine payload
        res.render('projects/detail', {
            title,
            project,
            categories
        });
    } catch (error) {
        console.error('Error loading project details page:', error);
        next(error);
    }
}

// 3 Export any controller functions at the bottom 
export {showProjectsPage, showProjectDetailsPage};

