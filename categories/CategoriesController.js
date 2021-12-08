const express = require("express");
const { default: slugify } = require("slugify");
const router = express.Router();
const categoryModel = require("./modelCategory");
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/categories/new", adminAuth, (req, res) => {
    categoryModel.findAll() //pegar todas as categorias para aparecer na navbar
        .then(categories => {
            res.render("admin/categories/new", {categories: categories});
        }).catch(err => {
            console.log(err);
            res.redirect("/admin/categories");
        })
});

router.post("/admin/categories/save", adminAuth, (req, res) => {
    var title = req.body.title;

    if (title != undefined) {
        categoryModel.create( {
            title: title,
            slug: slugify(title)
        }).then(() => {
            res.redirect("/admin/categories");
        }).catch((err) => {
            console.log(err);
            res.render("admin/categories/new");
        })
    } else
        res.render("admin/categories/new");
});

router.get("/admin/categories", adminAuth, (req, res) => {
    categoryModel.findAll().then(categories => {
        res.render("admin/categories/index", {categories: categories});
    });
});


router.post("/admin/categories/delete", adminAuth, (req, res) => {
    var id = req.body.id;

    if(id != undefined) {
        if(!isNaN(id)) {
            categoryModel.destroy({
                where: { id: id }
            }).then(() => {
                res.redirect("/admin/categories");
            }).catch((err) => {
                console.log(err);
                res.redirect("/admin/categories");
            })
        } else // Não é um número
            res.redirect("/admin/categories");
    } else // NULL
        res.redirect("/admin/categories");

})


router.get("/admin/categories/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;

    if (isNaN(id)) res.redirect("/admin/categories");

    categoryModel.findByPk(id).then(category => {
        if(category != undefined){
            categoryModel.findAll() //pegar todas as categorias para aparecer na navbar
                .then(categories => {
                    res.render("admin/categories/edit", { category: category, categories: categories });
                }).catch(err => {
                    console.log(err);
                    res.redirect("/admin/categories");            
                });
        }
        else
            res.redirect("/admin/categories");
    }).catch((err) => {
        console.log(err);
        res.redirect("/admin/categories");
    })
})


router.post("/admin/categories/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;

    categoryModel.update({ title: title, slug: slugify(title) }, {
        where: { id: id }
    }).then(() => {
        res.redirect("/admin/categories");
    }).catch((err) => {
        console.log(err);
        res.redirect("/admin/categories");
    })
})



module.exports = router;