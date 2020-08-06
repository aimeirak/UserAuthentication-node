const express = require("express");
const app = express();
const {pool} = require("./dbconfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

app.use(express.urlencoded({extended:false}));

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false
})
);

app.use(flash());

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");

app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/users/register",(req,res)=>{
    res.render("register");
});
app.get("/users/login",(req,res)=>{
    res.render("login");
});
app.get("/users/dashboard",(req,res)=>{
    res.render("dashboard",{user:"Aime irak"});
});


app.post("/users/register", async (req,res)=>{
    let {name,email,password,password2}=req.body;

    console.log(name,email,password,password2);

    let errors=[];

    if(!name || !email || !password || !password2){
        errors.push({message:"Please enter all fields"});
    }

    if(password.length < 6){
        errors.push({message:"password should be atleast 6 charcters"});
    }

    if(password!=password2){
        errors.push({message:"password do not match"});
    }
    if(errors.length>0){
        console.log(errors);
        res.render("register",{ errors });
    }
    else {
        //form validation has passed
        let hashedPassword = await bcrypt.hash(password,10); 
        console.log(hashedPassword);
        pool.query(
            `SELECT * FROM users where email=$1`,[email],(err,results)=>{
                if(err){
                    throw err;
                }
                console.log(results.rows);
                if(results.rows.length>0){
                    errors.push({message:"Email Already registed"});
                    res.render("register",{ errors });
                }
                else{
                    pool.query(
                        `INSERT INTO users(name,email,password) values($1,$2,$3) 
                        RETURNING id,password`,[name,email,hashedPassword],(err,results)=>{
                            if(err){
                                throw err;
                            }
                            else{
                                console.log(results.rows);
                                req.flash('success_msg',"you are now registered. please login");
                                res.redirect("/users/login");
                            }
                        }
                    )
                }
            }
        );

    }
});

app.listen(PORT,()=>{
    console.log(`SERVER Running Port ${PORT}`);
});