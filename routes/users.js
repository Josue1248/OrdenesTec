var express = require('express');
var router = express.Router();
var mongodb = require('mongodb').MongoClient;
var { ObjectId } = require('mongodb');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator');

let uri = 'mongodb://heroku_t75xnp7c:kgd4nfkmrtlac6oce58601pbml@ds127646.mlab.com:27646/heroku_t75xnp7c';

// Users Page - GET
router.get('/', ensureAuthenticated, function(req, res){
	mongodb.connect(uri, function(err, client){
		let db = client.db('heroku_t75xnp7c');
		let users = db.collection('users');

		users.find().toArray()
			.then(result => {
				const users = result.map(user => {
					return {
						fname: user.fname,
						lname: user.lname,
						email: user.username,
						role: user.role
					}
				})

				//console.log(usuarios)
				res.render('users', {users: users})
			})

		client.close(function (err) {
			if(err) throw err;
		  });
	});
});

// Login Page - GET
router.get('/login', function(req, res){
	res.render('login');
});

// Register Page - GET
router.get('/register', function(req, res){
	res.render('register');
});

// Delete Route - 
router.delete('/delete', function(req, res){

	mongodb.connect(uri, function(err, client){
		let db = client.db('heroku_t75xnp7c');
		let users = db.collection('users');

		users.deleteOne({
			username: req.body.id
		})

		client.close(function (err) {
			if(err) throw err;
		  });
	});
	res.json(`Se ha borrado el usuario`)
});

// Edit route - PUT
router.put('/edit',[	
	check('fname', 'No ha ingresado un nombre').notEmpty(),
	check('lname', 'No ha ingresado un nombre').notEmpty(),
	check('email', 'No ha ingresado un correo').notEmpty(),
	check('email', 'Por favor, ingrese un correo valido').isEmail(),
	check('password', 'No ha ingresado una contraseña').notEmpty(),
	check('password2', 'Las contraseñas no coinciden').notEmpty(),
	check('role', 'No ha ingresado un tipo de usuario').notEmpty()
	], 
	function(req, res){

	// Get Form Values
	var fname     		= req.body.fname;
	var lname 			= req.body.lname;
	var username    	= req.body.email;
	var password 		= req.body.password;
	var password2 		= req.body.password2;
	var role 			= req.body.role;

	// Get errors 
	var errors = validationResult(req).errors;

	// Validation
	if(password != password2){
		errors.push(  {
			value: username,
			msg: 'Las contraseñas no coinciden',
			param: 'password',
			location: 'body'
		  });
		console.log(errors.length);
	}

	// Check for errors
	if(errors.length){
		console.log('Form has errors...');
		console.log(errors)
		res.render('register', {
			errors: errors,
			fname: fname,
			lname: lname,
			username: username,
			password: password,
			password2: password2,
			role: role
		});
	} else {
		var newUser = {
			fname: fname,
			lname: lname,
			username: username,
			password: password,
			role: role
		}

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				newUser.password = hash;

				mongodb.connect(uri, function(err, client){
					let db = client.db('heroku_t75xnp7c');
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
							res.redirect('/users');
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

// Register - POST
router.post('/register',[	
	check('fname', 'No ha ingresado un nombre').notEmpty(),
	check('lname', 'No ha ingresado un nombre').notEmpty(),
	check('email', 'No ha ingresado un correo').notEmpty(),
	check('email', 'Por favor, ingrese un correo valido').isEmail(),
	check('password', 'No ha ingresado una contraseña').notEmpty(),
	check('password2', 'Las contraseñas no coinciden').notEmpty(),
	check('role', 'No ha ingresado un tipo de usuario').notEmpty()
	], 
	function(req, res){
	// Get Form Values
	var fname     		= req.body.fname;
	var lname 			= req.body.lname;
	var username    	= req.body.email;
	var password 		= req.body.password;
	var password2 		= req.body.password2;
	var role 			= req.body.role;

	// Get errors 
	var errors = validationResult(req).errors;

	// Validation
	if(password != password2){
		errors.push(  {
			value: username,
			msg: 'Las contraseñas no coinciden',
			param: 'password',
			location: 'body'
		  });
		console.log(errors.length);
	}

	// Check for errors
	if(errors.length){
		console.log('Form has errors...');
		console.log(errors)
		res.render('register', {
			errors: errors,
			fname: fname,
			lname: lname,
			username: username,
			password: password,
			password2: password2,
			role: role
		});
	} else {
		var newUser = {
			fname: fname,
			lname: lname,
			username: username,
			password: password,
			role: role
		}

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				newUser.password = hash;

				mongodb.connect(uri, function(err, client){
					let db = client.db('heroku_t75xnp7c');
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
							res.redirect('/users');
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
		let db = client.db('heroku_t75xnp7c');
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
			let db = client.db('heroku_t75xnp7c');
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
                                   failureFlash: 'Usuario incorrecto o contraseña incorrecta' }), 
  function(req, res){
  	console.log('Auth Successfull');
  	res.redirect('/');
  });

// Logout
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'Has cerrado sesion');
	res.redirect('/users/login');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;