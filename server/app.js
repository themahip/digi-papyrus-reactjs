const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyPraser = require("body-parser");
const validator = require("email-validator");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("./middleware/auth.js")
const cookieParser = require("cookie-parser");
const PORT = 3000;
const cors = require('cors')
const User = require("./userschema.js");
dotenv.config({ path: "./config.env" });

app.use(cors());
app.use(express.json());
app.use(bodyPraser.urlencoded({ extended: true }));
app.use(cookieParser())

const URL = process.env.URL;

mongoose.connect(URL, { useNewUrlParser: true });

// app.get("/", (req, res) => {
//     res.sendFile(__dirname + "/home.html");
// })
// app.get("/home", auth, (req, res) => {
//     res.sendFile(__dirname + "/home.html");
//     console.log(req.cookies.jwt);
// })

app.post("/api/register/", (req, res) => {
    console.log(req.body)
    console.log(res.body);
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    console.log(name);


    if (!name || !email || !password || !password2) {
        return res.status(221).json({ error: "Please fill in all fields" });
    }
    else if (password !== password2) {
        return res.status(221).json({ error: "Password didn't match" });
    }
    else if (password.lenght < 6) {
        return res.status(221).json({ error: "Password must be 6 characters long." });
    }
    else if (!validator.validate(email)) {
        return res.status(221).json({ error: "Email not validated." });
    }

    else {
        const hashPassword = (bcrypt.hashSync(password, 10));
        User.findOne({ email: email }, async (err, foundUser) => {
            if (err) {
                console.log(err);
            }
            else if (foundUser) {
                return res.status(221).json({ error: "email already exist" });
            }
            else {
                const newUser = new User({
                    name,
                    email,
                    hashPassword
                });
                const token = await newUser.generateAuthToken();
                res.cookie("jwt", token, {
                    expire: new Date(Date.now() + 50000),
                    // httpOnly:true,
                    // secure:true  --only can be used in production version. So uncomment when deploying..

                });
                console.log(token);
                // const nUser= await newUser.save();
                // res.status(201).send("welcome!!");

                const nuser = await newUser.save(() => {

                    res.json({error:""});
                });
            }
        })

    }

})


app.post("/api/login/", async (req, res) => {
    console.log("here");
    const email = req.body.username;
    const password = req.body.password;
    console.log(email)
    User.findOne({ email: email }, async (error, foundUser) => {
        if (error) {
            console.log(error);
        }
        else if (foundUser) {
            const isMatch = await bcrypt.compare(password, foundUser.hashPassword);

            const token = await foundUser.generateAuthToken();
            console.log(token);
            res.cookie("jwt", token, {
                expire: new Date(Date.now() + 5000000),
                // httpOnly:true,
                // secure:true  --only can be used in production version. So uncomment when deploying..

            });

            if (isMatch) {
                res.status(221).json({error:"password matched"});
            }
            else {
                return res.status(221).json({ error: "email and password didn't match" });
            }

        }

    });
})

// const jwt= require("jsonwebtoken");

// const createToken=async()=>{
//   const token=await jwt.sign({_id:"abcdefghijkl"},"mynameismahipadhikariabackenddeveloper");
// console.log(token);

// const userVer= jwt.verify(token,"mynameismahipadhikariabackenddeveloper");
// console.log(userVer._id);
// }
// createToken();




app.listen(5000, () => {
    console.log(`The server is running on port 5000`);
})





