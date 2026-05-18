SELECT * FROM organization;

-- Creating the service Projects table
CREATE TABLE service_project (
project_id SERIAL PRIMARY KEY,
organization_id INT NOT NULL,
title VARCHAR(150) NOT NULL,
description TEXT,
location VARCHAR(255) NOT NULL,
project_date DATE NOT NULL,
-- Foreign Key Constraint to link the existing Organization table
CONSTRAINT fk_organization
FOREIGN KEY(organization_id)
REFERENCES organization(organization_id)
ON DELETE CASCADE
);

-- Inserting 15 sample services (5 for each organization)
INSERT INTO service_project (organization_id, title, description, location, project_date) VALUES

-- 1. BrightFuture Builders Projects (Infrastrucure & Construction)
(1, 'Community Clinic Repair', 'Fixing the roofing and painting the interior of the local wellness clinic.', 'Mbare Community Health Center', '2026-06-05'),
(1, 'Library Bookshelf Building', 'Construction and installing wooden bookshelves for the childrens'' section.', 'Highfield Public Library', '2026-06-12'),
(1, 'Pedstrian Footbridge Repair', 'Reinforcing the handrails and structural walkways of the neighborhood footbridge.', 'Chitungwiza Sector 3 Stream', '2026-06-19'),
(1, 'Disabled Acces Ramp Installation', 'Pouring concrete and installing handrails for wheelchair access at the community hall.', 'Warren Park Civic Center', '2026-06-26'),
(1, 'Playground Equipment Restoration', 'Welding and painting broken swings and slides.', 'Avondale Recreation Park', '2026-07-03'),

-- 2. GreenHarvest Growers Projects (Urban Farming & Food Sustainability)
(2, 'Community Gardebn Tilling', 'Building organic compost bins and setting up drip irrigation lines for winter crops.', 'Mabelreign Allotment Gardens', '2026-05-24'),
(2, 'Composting Seminar & Setup', 'Building organic compost bins and teaching community members about waste management', 'Belvedere Eco-Hub', '2026-05-31'),
(2, 'Seedling Distribution Day', 'Handing out tomato, spinach, and onion seedlings alongside care instruction guides.', 'Epworth Community Market', '2026-06-07'),
(2, 'School Vegetable Path Launch', 'Helping primary school students plant their first shared schoolyard garden.', 'Kambuzuma Primary School', '2026-06-24'),
(2, 'Urban Orchard Tree Planting', 'Planting 20 orange and avocado fruit trees in the public space.', 'Budiriro Community Park', '2026-06-21'),

-- 3. UnityServe Volunteers Projects (Volunteer Coordination & Charity Support)
(3, 'Elderly Care Visit & Social', 'Spending the afternoon playing games and distributing care packages to residents.', 'Bonda Aged Care Home', '2026-06-02'),
(3, 'Winter Clothing Sorting Drive', 'Organizing donated blankets and warm clothes for distribution.', 'Downtown Donation Depot', '2026-06-09'),
(3, 'After-School Homework Club', 'Providing math and English tutoring support to primary school students.', 'Ku some Block Study Hall', '2026-06-16'),
(3, 'Soup Kitchen Food Prep', 'Chopping vegetables and preparing bulk meals for the evening soup kitchen rotation.', 'Inner-City Hope Mission', '2026-06-23'),
(3, 'Sanitary Wear Packaging & Delivery', 'Assembling hygiene kits and coordinating deliveries to local community centers.', 'UnityServe Logistics Office', '2026-06-30');

SELECT 
	p.project_id,
	o.name AS organization_name,
	p.title AS project_title,
	p.location,
	p.project_date
FROM service_project p
Join organization o ON p.organization_id = o.organization_id; 

-- 1. Creating the Category lookup table
CREATE TABLE IF NOT EXISTS category (
	category_id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE
);


-- 2. Creating the Many-to-Many Junction Table
CREATE TABLE IF NOT EXISTS project_category (
	project_id INT REFERENCES service_project(project_id) ON DELETE CASCADE,
	category_id INT REFERENCES category(category_id) ON DELETE CASCADE,
	PRIMARY KEY (project_id, category_id) --Composite Primary Key prevents duplicate links 
);

-- Insert 3 relevant categories
INSERT INTO category (name) VALUES
('Infrastructure & Construction'),
('Urban Farming & Sustainability'),
('Volunteer Coordination & Charity Support');

-- Associate each of your 15 projects with at least one category
INSERT INTO project_category (project_id, category_id)VALUES
-- BrightFuture Builders Projects (IDs 1-5) linked to Infrastrucure (Category 1)
(1,1),
(2,1),
(3,1),
(4,1),
(5,1),

-- GreenHarvest Growers Projects (IDs 6-10) linked to Urban Farming (Category 2)
(6,2),
(7,2),
(8,2),
(9,2),
(10,2),

-- UnityServe Volunteers Projects (IDs 11-15) linked to Charity Support (Category 3)
(11,3),
(12,3),
(13,3),
(14,3),
(15,3);

