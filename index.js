const path = require('path');
const PORT = process.env.PORT || 3000; 
const MONGODB_URI = process.env.MONGODB_URL || "mongodb+srv://user:watchingtv123@cluster0.djmy0.mongodb.net/cluster0?retryWrites=true&w=majority";


const express = require('express');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('../admin');
const shopRoutes = require('./Jeremiah Repo/routes/shop');
const authRoutes = require('./Jeremiah Repo/routes/auth');
const { runInNewContext } = require('vm');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    req.user = user;
    next();
  })
  .catch(err => console.log(err));
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', { 
    pageTitle: 'Error!', 
  path: '/500',
  isAuthenticated: req.session.isLoggedIn });
})

mongoose
  .connect(
    uri
  )
  .then(result => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });