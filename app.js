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

// Define a middleware to make isAuthenticated available in all templates
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    next();
});

const blogPosts = [
    { id: 1, title: 'Learning JavaScript', comments: [] },
    { id: 2, title: 'Using MERN Stack', comments: [] },
];

// Modify the route handlers to use req.session.isAuthenticated
app.get('/', (req, res) => {
    res.render('pages/home', { blogPosts, isAuthenticated: req.session.isAuthenticated });
});

app.get('/login', (req, res) => {
    res.render('pages/login', { isAuthenticated: req.session.isAuthenticated });
});

app.get('/about', (req, res) => {
    res.render('pages/about');
});

// Update the route handler for the contact page
app.get('/contact', (req, res) => {
    res.render('pages/contact', { isAuthenticated: req.session.isAuthenticated });
});

app.get('/pages/:id', (req, res) => {
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);

    if (post) {
        res.render(`pages/post${post.id}`, { post, isAuthenticated: req.session.isAuthenticated });
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
    const { username, password } = req.body;
    if (username == 'John' && password === '123456') {
        req.session.isAuthenticated = true;
        res.redirect('/');
    } else {
        res.render('pages/failure');
    }
});

app.get('/logout', (req, res) => {
    req.session.isAuthenticated = false;
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
