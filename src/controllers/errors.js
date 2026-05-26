// Test route for 500 errors
const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

// Global error handling middleware 
const handleGlobalErrors = (err, req, res, next) => {
    console.error('App Error:', err.message);

    const statusCode = err.status || 500;
    res.status(statusCode);

    if (statusCode === 404) {
        res.render('errors/404', {title: '404 - Page Not Found'});
    } else {
        res.render('errors/500', {
            title: '500 - Server Error',
            message: err.message
        });
    }
}


// 3. Export both controller functions
export {testErrorPage, handleGlobalErrors};

