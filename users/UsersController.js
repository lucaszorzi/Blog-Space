const express = require('express');
const router = express.Router();
const usersModel = require('./modelUser');
const categoryModel = require('../categories/modelCategory');
const bcrypt = require('bcryptjs');
const adminAuth = require("../middlewares/adminAuth");


router.get("/admin/users", adminAuth, (req, res) => {
    usersModel.findAll()
        .then(users => {
            categoryModel.findAll()
                .then(categories => {
                    res.render("admin/users", { users: users, categories: categories});
                }).catch(err => {
                    console.log(err);
                    res.redirect('/');
                });
        }).catch(err => {
            console.log(err);
            res.redirect('/');
        })
});

router.get("/admin/users/new", adminAuth, (req, res) => {
    categoryModel.findAll().then(categories => {
        res.render("admin/users/new", { categories: categories });
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    })
});

router.post("/admin/users/save", adminAuth, (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    usersModel.findOne({
        where: { email: email }
    }).then(user => {
        if(user == undefined){
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);

            usersModel.create({
                name: name,
                email: email,
                password: hash
            }).then(() => {
                res.redirect('/');
            }).catch(err => {
                console.log(err);
                res.redirect('/');
            })
        }
        else
            res.redirect('/admin/users/new');
    }).catch(err => {
        console.log(err);
        res.redirect('/admin/users/new');
    })

    
})

router.get("/admin/login", (req, res) => {
    categoryModel.findAll().then(categories => {
        res.render("admin/users/login", { categories: categories });
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    })
})

router.post("/admin/auth", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    usersModel.findOne({
        where: { email: email }
    }).then(user => {
        if(user != undefined){

            var pass_match = bcrypt.compareSync(password, user.password)

            if(pass_match){
                req.session.user = {
                    id: user.id,
                    email: user.email,
                }
                res.redirect('/admin/articles');
            }
            else
                res.redirect('/admin/login')
                

        }
        else
            res.redirect('/admin/login')
    }).catch(err => {
        console.log(err);
        res.redirect('/admin/login')
    })
})

router.get("/admin/logout", (req, res) => {
    req.session.user = undefined
    res.redirect('/')
})

module.exports = router;