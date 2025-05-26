const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'mySuperSecretKey',
  resave: false,
  saveUninitialized: true,
}));

// In-memory user storage (for demo purposes)
const users = [];

app.get('/', (req, res) => {
  res.render('index');
});

// REGISTER
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.send('Username already exists');
  }
  users.push({ username, password });
  res.redirect('/login');
});

// LOGIN
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.authenticated = true;
    req.session.username = user.username;
    res.redirect('/secret');
  } else {
    res.send('Invalid credentials');
  }
});

// SECRET PAGE
app.get('/secret', (req, res) => {
  if (req.session.authenticated) {
    res.render('secret', { username: req.session.username });
  } else {
    res.redirect('/login');
  }
});

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/submit-secret', (req, res) => {
  if (!req.session.authenticated) return res.redirect('/login');

  const { message } = req.body;
  console.log(`Secret message from ${req.session.username}:`, message);

  res.send('Your secret has been submitted successfully!');
});

app.get('/secret', (req, res) => {
  if (req.session.authenticated) {
    res.render('home', { username: req.session.username });
  } else {
    res.redirect('/login');
  }
});


const PORT = 4000;
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
