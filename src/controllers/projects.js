// 1. Import any needed model functions at the top
import{getAllProjectsWithOrganizations} from '../models/projects.js';

// 2. Define any controller functions with descriptive name
const showProjectsPage = async (req, res) => {
    try {
        const projects = await getAllProjects();
        const title = 'Service Projects';

        res.render('projects', {title, projects});

    } catch (error) {
        console.error('Error loading projects page:', error);
        next(error); // This sends the error straight to global error handler
    }
};

// 3 Export any controller functions at the bottom 
export {showProjectsPage};

