//Define any controller functions
const showHomePage =  async (req, res) => {
    const title = 'Home';

    res.render('Home', {title});
};

// Export any controller functions
export {showHomePage};


