// 1. Import any needed model functions at the top
import { getAllOrganizations, getOrganizationDetails } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

// 2. Define any controller functions with a descriptive name
const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';

        res.render('organizations', {title, organizations});
    } catch (error) {
        console.error('Error loading organizations page:', error);
        next(error);
    }
};

const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'organization Details';

    res.render('organization', {title, organizationDetails, projects});

    } catch (error) {
        // This prints the raw database error directly to the console window
        console.error("Error in showOrganizationDetailsPage:", error);
        next(error);
    }
    
};

//3. Export any contoller functions at the bottom
export {showOrganizationsPage, showOrganizationDetailsPage};
