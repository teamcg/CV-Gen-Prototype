var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var passport = require('passport');
var passportLocal = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));


// mongoose.connect('mongodb://localhost/prototype2');
mongoose.connect('mongodb://admin:admin@ds011890.mlab.com:11890/prototype2');





//Schema
var StudentSchema = new mongoose.Schema({
	fullname: String,
	email: String,
	username: String,
	password: String,
	authkey: String
});


var AuthKeySchema = new mongoose.Schema({
	authkey: String,
	studentid: Number
});


//This line very important to place it properly after the schema and before the model
StudentSchema.plugin(passportLocalMongoose);


//Model
var Student = mongoose.model('Student', StudentSchema);
var AuthKey = mongoose.model('Authkey', AuthKeySchema);




//Passport Authentication
app.use(require("express-session")({
	secret: "7He$3cr37",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new passportLocal(Student.authenticate()));
passport.use(Student.createStrategy());
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});




//Routes
app.get('/', function(req, res){
	res.render('homepage');
});


app.get('/allstudent', function(req, res){
	Student.find({}, function(err, allStudent){
		if(err){
			console.log(err);
		} else {
			res.send(allStudent);
		}
	});
});


app.post('/register', function(req, res){
	var theStudentInfo = req.body.student;

	var newStudent = new Student(theStudentInfo);

	Student.register(newStudent, req.body.thepassword, function(err, registerStudent){
		console.log(registerStudent);
		if(err){
			console.log(err);
		} else {
			res.send(registerStudent);
		}
	});
});

app.get('/student', function(req, res){
	res.render('student');
});


app.post('/authkeygen', function(req, res){
	var authkey = req.body.genauthkey;

	AuthKey.create(authkey, function(err, authkeygen){
		if(err){
			console.log(err);
		} else {
			res.send(authkeygen);
		}
	});
});

app.post('/reg', function(req, res){
	var regstudentid = req.body.regstudentid;
	var regauthkey = req.body.regauthkey;
		AuthKey.find({'studentid': regstudentid, 'authkey': regauthkey}, function(err, foundStudent){
			if(err){
				console.log(err);
			} else if(foundStudent.length === 0) {
				res.send('Wrong Student ID/Authentication key. Please check with the Administrator');
			} else {
				res.render('register', {foundStudent: foundStudent});
			}
		});
	});


app.post("/login", passport.authenticate("local", {
	successRedirect: "/student",
	failureRedirect: "back"
}));


app.listen(process.env.PORT, function(req, res){
	console.log('server started at PORT 3000');
});