const mysql = require('mysql') 
const express = require('express') 
const bodyParser = require('body-parser') 
const app = express();


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));

// create a connection to the database server
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database : 'mydatabase'
});

// connect to the database server
connection.connect(function(err) {
    if (err) console.log(err) ;

  // create the database
    connection.query('CREATE DATABASE IF NOT EXISTS mydatabase', function(err, result) {
    if (err) console.log(err);

    // create the users table
    connection.query('USE mydatabase', function(err) {
        if (err) console.log(err);
        const createUserTableQuery = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255),
        money DECIMAL(10,2)
        )`;

        connection.query(createUserTableQuery, function(err, result) {
        if (err) console.log(err);
        console.log("Users table created");
        });
    });
    });
    connection.end();
});




app.get('/', (req, res)=>{
    res.render("index" )
});

app.get('/login', function(req, res)
{
    res.render("login")
});

app.get('/register', function(req, res)
{
    res.render("register")
});


app.post('/register', function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.confirmPassword;
    console.log(name , email ,password, password2)

    if(checkIfUserExists(email))
    {
        res.render('register' , { error : "User already registered"});
    }
    else if (password != password2) {
        res.render('register' , { error : "Passwords does not match" });
    }
    else if (password.length < 8) {
        res.render('register' , { error :  "Password must be at least 8 characters" });
    }
    else{ //adding new user. 
        const newUser = {
        name:name,
        email:email,
        password:password,
        money:1000
        };
        connection.connect(function(error){
            if (error) console.log(error);
            const query = 'INSERT INTO users SET ?';
            connection.query(query, newUser, function (error, results, fields) {
            if (error) console.log(error);
            console.log('User added to database');
            connection.end()
        });
        });
        res.send('good job!')
    }
    
});

app.post('/login', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    
    connection.connect();
    connection.query('SELECT email, password FROM users WHERE email = ?', [email], function (error, results, fields) {
        if (error) console.log(error);
        // if email exists, store the email and password in variables
        if (results.length > 0) {
        const dbPassword = results[0].password;
        if(dbPassword === password){
            res.redirect('app.html');
        }
        else {
            const p = document.createElement("p");
            p.textContent = "Email or password are wrong";
            result.appendChild(p);
        }
        // close the database connection
        connection.end();
        }
    });
});

function checkIfUserExists(email) {
    connection.connect(function(error){
        if(error) console.log(error);
        const query = 'SELECT * FROM users WHERE email = ?';
        connection.query(query, [email], (error, results) => {
            if (error) {
                console.log(error)
            }
            else
            {
                if(results.length>0)
                {
                    return true;
                }
                else{
                    return false;
                }
            }
            connection.end()
        });
    });
    
}

app.listen(3000, function() {
    console.log('Server is listening on port 3000');
});