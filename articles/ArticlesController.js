const express = require("express");
const router = express.Router();
const categoryModel = require('../categories/modelCategory');
const articlesModel = require('./modelArticle');
const slugify = require('slugify');
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/articles", adminAuth, (req, res) => {
    articlesModel.findAll({
        include: [{ model: categoryModel }],
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(articles => {
        categoryModel.findAll()
            .then(categories => {
                res.render("admin/articles/index", { articles: articles, categories: categories });
            }).catch(err => {
                console.log(err);
                res.redirect("/");
            })
    }).catch((err) => {
        console.log(err);
        res.redirect("/");
    })
});

router.get("/admin/articles/new", adminAuth, (req, res) => {
    categoryModel.findAll().then(categories => {
        res.render("admin/articles/new", { categories: categories });
    })
})

router.post("/admin/articles/save", adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var categoryId = req.body.categoryId;

    articlesModel.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: categoryId
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch((err) => {
        console.log(err);
        res.redirect("/admin/articles");
    })
})

router.post("/admin/articles/delete", adminAuth, (req, res) => {
    var id = req.body.id;

    if(id != undefined) {
        if(!isNaN(id)) {
            articlesModel.destroy({
                where: { id: id }
            }).then(() => {
                res.redirect("/admin/articles");
            }).catch((err) => {
                console.log(err);
                res.redirect("/admin/articles");
            })
        } else // Não é um número
            res.redirect("/admin/articles");
    } else // NULL
        res.redirect("/admin/articles");

})

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;

    articlesModel.findByPk(id, {
        include: [{ model: categoryModel }]
        }).then(article => {
            if(article != undefined){
                categoryModel.findAll()
                    .then(categories => {
                        res.render("admin/articles/edit", {article: article, categories: categories});
                    }).catch(err => {
                        console.log(err);
                        res.redirect("admin/articles");        
                    })
            } else
                res.redirect("admin/articles");
        }).catch(err => {
            console.log(err);
            res.redirect("admin/articles");
        })
})

router.post("/admin/articles/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var categoryId = req.body.categoryId;

    articlesModel.update({
        id: id,
        title: title,
        body: body,
        categoryId: categoryId,
        slug: slugify(title)
    }, { where: { id: id } })
        .then(() => {
            res.redirect("/admin/articles");        
        }).catch(err => {
            console.log(err);
            res.redirect("/admin/articles");
        })
})


router.get("/articles/page/:num?", (req, res) => {
    var page = req.params.num;
    var articlesPerPage = 4;
    var offset = 0;
    
    if(isNaN(page) || page <= 1 )
        res.redirect("/");
    else
        offset = parseInt(page-1) * articlesPerPage;

    articlesModel.findAndCountAll({
        limit: articlesPerPage,
        offset: offset,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(articles => {

        var next;
        if(offset + articlesPerPage >= articles.count)
            next = false;
        else
            next = true;

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }
        categoryModel.findAll().then(categories => {
            res.render("admin/articles/page", { result: result, categories: categories})
        }).catch(err => {
            console.log(err);
            res.redirect("/");
        })
    }).catch(err => {
        res.redirect("/");
    })
})



module.exports = router;