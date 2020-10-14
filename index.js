var mongoose    =   require('mongoose')
//connect to mongoose
const dbPath = 'mongodb://localhost:27017';
const options = {useNewUrlParser: true, useUnifiedTopology: true}
const mongo = mongoose.connect(dbPath, options);
mongo.then(() => {
    console.log('connected');
}, error => {
    console.log(error, 'error');
})

var express =   require('express');
var path = require('path');
var morgan = require('morgan');
var app =   express();
var bodyParser  =   require("body-parser");
//todo :  es qu'il faut un système de sessions?

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*")//après je précises les url auquels j'autorise l'accès 'url'/'*'
    res.header("Access-Control-Allow-Headers","Origin ,X-Requested-With,Content-Type,Accept,Authoriszation")
    if (req.method==='OPTIONS') {
        res.header('Access-Control-Allow-Methods',"PUT,POST,PATCH, DELETE,GET")
        return res.status(200).json({});//je comprend pas cette ligne ; on verra ça un autre jour
    }
    next();
});

//app.use(express.json());//parses incoming requests with JSON payloads.   oui pour le moment ça ne sers à rien

app.use(bodyParser.json());//i'm using this instead of express json . Why? Because I used it in mongoose
/*app.use(express.urlencoded({ extended: false }));//parses incoming requests with URL-encoded payloads
app.use(cookieParser());
*/
//Basicaly the same reason as before .configure bodyparser to hande the post requests
app.use(bodyParser.urlencoded( {extended: false}));
app.use(express.static(path.join(__dirname, './public/')));//serves static assets such as HTML files, images, and so on.
app.use(morgan('dev'));

//var article =   require('./articleModel');
//var user =  require('./userModel');

var articleModel = require('./articleModel');
var userModel = require('./userModel');
var commentModel = require('./commentModel');

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.get("/",(req,res)=>{
    //res.render("./views/home.ejs")
    res.render(path.join(__dirname, 'views/home.ejs'));
     //cette forme est pratique car je n'aurait plus besoin de changer le chemin
});
app.get("/about",(req,res)=>{
    res.render(path.join(__dirname, 'views/about.ejs'));
});
app.get("/project",(req,res)=>{
    res.render(path.join(__dirname, 'views/project.ejs'));
});

app.get("/admin",(req,res)=>{
    
    res.render(path.join(__dirname, 'views/admin.ejs'));
});

//TODO: page d'authentification 
app.post("/admin/auth",(req,res)=>{
    if (req.body.pass = "mtBaPa2h*") {
        res.redirect('/admin')
    }
// si tt se passe bien je suis rediriger sur /admin 
});

//!crée un nouvelle article 
app.post("/admin/new",(req,res)=>{
    var newArticle = new articleModel(req.body);
    newArticle.save((err)=>{
        if (err) return res.status(500).send(err)
        res.status(200).send({mewwage:"l'article a été créer",newArticle});
        //res.send(newArticle);
    })
});

//!suprime l'article
app.delete("/admin/delete/:article_id",(req,res)=>{
    console.log(req.params.articles_id)
    articleModel.remove({_id:req.params.article_id})
      .exec()
      .then(result => {
        res.status(200).json(result);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
});   

//! mettre un article à jour
app.patch("/updateAdmin/:article_id",(req,res)=>{
    const id = req.params.article_id;
    const updateOperations = {};
    //! la requète envoyé a une structure spécial
    for (const ops of req.body) {
        updateOperations[ops.propName] = ops.value;
      }
    articleModel.update({_id : id},{ $set: updateOperations })
    .exec()
    .then(result =>{
        console.log(result);
        res.status(500).json(result);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            Error:err
        })
    })
});
//TODO : bon ya une petite erreur mais bon Dieu est grand
/** 
**format de la requète
[
	{"propName":"comment.body","value":"neew"},
	{"propName":"comment.date","value":"2020-01-01T01:23:32.000+00:00"},
	{"propName":"comment.likeComment","value":"true"}
]
**/
//! donne touts les articles du blog
app.get("/blog",(req,res)=>{
    articleModel.find()
    .exec()
    .then(docs =>{//doc est le résulta de la recherche
        console.log(docs);
        res.status(200).json(docs)
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


//! Donne un article précis
app.get("/blog/:article_id",(req,res)=>{
    
   articleModel.findById(req.params.articleModel_id,(err,articleModel)=>{
        if (err) return res.status(500).send(err)
        res.status(200).send({mewwage:"voila l'article que tu veux"});        
    })
});

//? s'abonner à la newsletter
app.post("/blog/fan",(req,res)=>{
    var user = new userModel();
    user.email = req.body.email;
    //Save and check error
    user.save(function (err) {
        if (err) return res.status(500).send(err)
        res.status(200).send({mewwage:"merci , je te préviens si il ya du nouveux"});
        
    });

});



//TODO: liker un article
app.patch("/blog/:article_id/like",(req,res)=>{
    var articleModel = new articleModel();
    articleModel.text.likeTexte = req.body.text.likeTexte;
    articleModel.comment.likeComment = req.body.comment.likeComment;
    articleModel.update((err)=>{
        if (err) return res.status(500).send(err)
        res.send(articleModel);
    })
});

//TODO: liker un commentaire

//! Poster un commentaire
app.post("/comment",(req,res)=>{
    var newComment = new commentModel(req.body);
    newComment
    .save()
    .then(comment =>{
        console.log(comment);
        res.status(200).json({message : "commentaire poster"})
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
//-----------------------------------------------------------------------------------------------------------------------------
//gestion des erreurs
/*
 ce middlware est traité si aucune des routes dévinies par le dev n'est
 matché par la requète de l'utilisateur
*/
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
  });
  
  // error handler middleware
  app.use((error, req, res, next) => {
      res.status(error.status || 500).send({
        error: {
          status: error.status || 500, // soit le type d'erreur est défini , soit on met type : 500
          message: error.message || 'Internal Server Error', // soite la page n'est pas trouvé , soit il sagit d'une erreur du server
        },
      });
    });
  


/*
 ce middlware est traité si aucune des routes dévinies par le dev n'est
 matché par la requète de l'utilisateur
*/
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
  });
  
  // error handler middleware
  app.use((error, req, res, next) => {
      res.status(error.status || 500).send({
        error: {
          status: error.status || 500, // soit le type d'erreur est défini , soit on met type : 500
          message: error.message || 'Internal Server Error', // soite la page n'est pas trouvé , soit il sagit d'une erreur du server
        },
      });
    });
app.listen(4000,()=>{console.log("app is listenning on http://localhost:4000")})