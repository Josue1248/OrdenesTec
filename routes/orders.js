var express = require('express');
var router = express.Router();
var mongodb = require('mongodb').MongoClient;
var { ObjectId } = require('mongodb');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator');

let uri = 'mongodb://heroku_t75xnp7c:kgd4nfkmrtlac6oce58601pbml@ds127646.mlab.com:27646/heroku_t75xnp7c';

// Login Page - GET
router.get('/', ensureAuthenticated, function(req, res){
	res.render('orders');
});

// Register Page - GET
router.get('/register', function(req, res){
	res.render('register-orders');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;