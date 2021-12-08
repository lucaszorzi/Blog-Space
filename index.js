const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/connection");
const session = require("express-session");

//Controllers
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersController");

//Models
const articleModel = require("./articles/modelArticle");
const categoryModel = require("./categories/modelCategory");
const userModel = require("./users/modelUser");

//View Engine
app.set('view engine', 'ejs');

//Static files
app.use(express.static("public"));

//sessions
app.use(session({
    secret: "algoAleatorioSoParaServirDeSalt", cookie: { maxAge: 60000 } //tempo ativo do cookie em ms
}))

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Database connection
connection
    .authenticate()
    .then(() => {
        console.log("Database connection is working!");
    })
    .catch((err) => {
        console.log(err);
    });


//Import routes from controllers
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);


app.get("/", (req, res) => {
    articleModel.findAll({
        order: [
            ['updatedAt', 'DESC']
        ],
        limit: 4
    })
    .then(articles => {
        categoryModel.findAll()
            .then(categories => {
                res.render("index", { articles: articles, categories:categories });
            }).catch((err) => {
                console.log(err);
                res.send("Erro ao buscar categorias...");
            })
    }).catch((err) => {
        console.log(err);
        res.send("Erro ao buscar artigos...");
    })
});

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;

    articleModel.findOne({
        where: { slug: slug }
    }).then(article => {
        if(article != undefined){
             categoryModel.findAll() //pegar todas as categorias para aparecer na navbar
                .then(categories => {
                    res.render("article", { article: article, categories: categories });
                }).catch(err => {
                    console.log(err);
                    res.redirect("/");
                });
        }
        else    
            res.redirect("/");
    }).catch((err) => {
        console.log(err);
        res.redirect("/");
    })
});

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;

    categoryModel.findOne({
        where: { slug: slug },
        include: [{ model: articleModel }]
    }).then(category => {
        if(category != undefined){
            categoryModel.findAll()
                .then(categories => {
                    res.render("index", { articles: category.articles, categories: categories })
                }).catch(err => {
                    console.log(err);
                    res.redirect("/");
                })
        } else
            res.redirect("/");
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    })
})

app.listen(3000, () => {
    console.log("Server is running!");
})