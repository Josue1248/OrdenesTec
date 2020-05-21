var express = require('express');
var router = express.Router();
var mongodb = require('mongodb').MongoClient;
var { ObjectId } = require('mongodb');
var LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator');

let uri = 'mongodb://heroku_t75xnp7c:kgd4nfkmrtlac6oce58601pbml@ds127646.mlab.com:27646/heroku_t75xnp7c';

// Login Page - GET
router.get('/', ensureAuthenticated, function(req, res){
	mongodb.connect(uri, function(err, client){
		let db = client.db('heroku_t75xnp7c');
		let computers = db.collection('computers');

		computers.find().toArray()
			.then(result => {
				const computers = result.map(computer => {
					return {
						id: computer._id,
						department: computer.department,
						brand: computer.brand,
						model: computer.model
					}
				})

				//console.log(usuarios)
				res.render('computers', {computers: computers})
			})

		client.close(function (err) {
			if(err) throw err;
		  });
	});
});

// Register Page - GET
router.get('/register', function(req, res){
	res.render('register-computers');
});

// Register - POST
router.post('/register',[	
	check('department', 'No ha ingresado un nombre').notEmpty(),
	check('brand', 'No ha ingresado un nombre').notEmpty(),
	check('model', 'No ha ingresado un correo').notEmpty()
	], 
	function(req, res){
	// Get Form Values
	var department  = req.body.department;
	var brand 		= req.body.brand;
	var model    	= req.body.model;

	// Get errors 
	var errors = validationResult(req).errors;

	// Check for errors
	if(errors.lenght){
		console.log('Form has errors...');
		console.log(errors)
		res.render('register', {
			errors: errors,
			department: department,
			brand: brand,
			model: model
		});
	} else {
		var newComputer = {
			department: department,
			brand: brand,
			model: model
		}

		mongodb.connect(uri, function(err, client){
			let db = client.db('heroku_t75xnp7c');
			let computers = db.collection('computers');

			computers.insertOne(newComputer, function(err, doc){
				if(err){
					res.send(err);
				} else {
					console.log('Computer Added...');

					//Success Message
					req.flash('success', 'Se ha registrado con exito');

					// Redirect after register
					res.location('/');
					res.redirect('/computers');
				}
			});

			client.close(function (err) {
				if(err) throw err;
			  });
		});
	}
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;