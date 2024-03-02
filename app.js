const express = require('express');
const app = express();
const port = 3000;
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Add express-session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Define a middleware to make isAuthenticated, rememberMe, and savedUsername available in all templates
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.rememberMe = req.session.rememberMe || false;
    res.locals.savedUsername = req.session.savedUsername || '';
    res.locals.savedPassword = req.session.savedPassword || '';
    next();
});

const blogPosts = [
    { id: 1, title: 'Learning JavaScript', comments: [] },
    { id: 2, title: 'Using MERN Stack', comments: [] },
];

// Modify the route handlers to use res.locals
app.get('/', (req, res) => {
    res.render('pages/home', { blogPosts });
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/about', (req, res) => {
    res.render('pages/about');
});

// Update the route handler for the contact page
app.get('/contact', (req, res) => {
    res.render('pages/contact');
});

app.get('/pages/:id', (req, res) => {
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);

    if (post) {
        res.render(`pages/post${post.id}`, { post });
    } else {
        res.status(404).render('pages/404');
    }
});

// Add name field to the comment submission
app.post('/comment/:id', (req, res) => {
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);

    if (!req.session.isAuthenticated) {
        return res.redirect('/pages/404');
    }

    if (post) {
        const name = req.body.name; // Extract name from the form data
        const comment = req.body.comment;
        // Ensure both name and comment are provided before pushing into the comments array
        if (name && comment) {
            post.comments.push(`${name}: ${comment}`);
        }
        return res.redirect(`/pages/${postId}`);
    } else {
        return res.redirect('/pages/404');
    }
});

app.post('/login', (req, res) => {
    const { username, password, rememberMe } = req.body;
    if (username == 'John' && password === '123456') {
        req.session.isAuthenticated = true;
        req.session.rememberMe = rememberMe === 'on';
        req.session.savedUsername = username;
        req.session.savedPassword = password;
        res.redirect('/');
    } else {
        res.render('pages/failure');
    }
});

app.get('/logout', (req, res) => {
    req.session.isAuthenticated = false;
    res.redirect('/');
});

// Handle the /forgot-password route
app.get('/forgot-password', (req, res) => {
    res.render('pages/forgot-password'); // Assuming your forgot password page is named forgot-password.ejs
});

app.post('/forgot-password', (req, res) => {
    // Implement the logic to send a password reset email
    const userEmail = req.body.user_email;
    // ... your password reset logic ...

    // Redirect the user or render a response page
    res.redirect('pages/password-reset-sent'); // You should create a page for this route as well
});

// Handle the /Register route
app.get('/Register', (req, res) => {
    res.render('pages/Register'); // Register page
});

app.post('/Register', (req, res) => {
    // Implement the logic to send a password reset email
    const userEmail = req.body.user_email;
    // ... your password reset logic ...

    // Redirect the user or render a response page
    res.redirect('pages/password-reset-sent'); // You should create a page for this route as well
});

// Handle the /404
app.get('/404', (req, res) => {
    res.render('pages/404'); // 404 page
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
