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
router.get('/login', function(req, res){
	res.render('login');
});

// Register Page - GET
router.get('/register', function(req, res){
	res.render('register');
});

// Register - POST
router.post('/register',[	
	check('name', 'No ha ingresado un nombre').notEmpty(),
	check('email', 'No ha ingresado un correo').notEmpty(),
	check('email', 'Por favor, ingrese un correo valido').isEmail(),
	check('username', 'No ha ingresado un usuario').notEmpty(),
	check('password', 'No ha ingresado una contraseña').notEmpty(),
	check('password2', 'Las contraseñas no coinciden').notEmpty()
	], 
	function(req, res){
	// Get Form Values
	var name     		= req.body.name;
	var email    		= req.body.email;
	var username 		= req.body.username;
	var password 		= req.body.password;
	var password2 		= req.body.password2;

	// Get errors 
	var errors = validationResult(req).errors;

	// Validation
	if(password != password2){
		errors.push('Las contraseñas no coinciden')
	}

	// Check for errors
	if(errors.lenght){
		console.log('Form has errors...');
		console.log(errors)
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username:username,
			password: password,
			password2: password2
		});
	} else {
		var newUser = {
			name: name,
			email: email,
			username:username,
			password: password
		}

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				newUser.password = hash;

				mongodb.connect(uri, function(err, client){
					let db = client.db('heroku_7s4pmbnh');
					let users = db.collection('users');

					users.insertOne(newUser, function(err, doc){
						if(err){
							res.send(err);
						} else {
							console.log('User Added...');
	
							//Success Message
							req.flash('success', 'Te has registrado con exito');
	
							// Redirect after register
							res.location('/');
							res.redirect('/');
						}
					});

					client.close(function (err) {
						if(err) throw err;
					  });
				});
			});
		});

		
	}
});

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	mongodb.connect(uri, function(err, client){
		let db = client.db('heroku_7s4pmbnh');
		let users = db.collection('users');

		users.findOne({_id: new ObjectId(id)}, function(err, user){
			done(err, user);
		});

		client.close(function (err) {
			if(err) throw err;
		  });
	});
});

passport.use(new LocalStrategy(
	function(username, password, done){
		mongodb.connect(uri, function(err, client){
			let db = client.db('heroku_7s4pmbnh');
			let users = db.collection('users');

			users.findOne({username: username}, function(err, user){
				if(err) {
					return done(err);
				}
				if(!user){
					return done(null, false, {message: 'Usuario incorrecto'});
				}
	
				bcrypt.compare(password, user.password, function(err, isMatch){
					if(err) {
						return done(err);
					}
					if(isMatch){
						return done(null, user);
					} else {
						return done(null, false, {message: 'Contraseña incorrecta'});
					}
				});

				client.close(function (err) {
					if(err) throw err;
				  });
			});
		});
	}

));

// Login - POST
router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/users/login',
                                   failureFlash: 'Invalid Username Or Password' }), 
  function(req, res){
  	console.log('Auth Successfull');
  	res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'Has cerrado sesion');
	res.redirect('/users/login');
});

module.exports = router;