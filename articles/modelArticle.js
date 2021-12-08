const Sequelize = require('sequelize');
const connection = require('../database/connection');
const Category = require('../categories/modelCategory');

const Article = connection.define('articles', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// 1 categoria tem muitos artigos
Category.hasMany(Article);
// 1 artigo pertence a uma categoria
Article.belongsTo(Category);

Article.sync( { force: false });

module.exports = Article;