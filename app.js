var express = require('express');
var app = express();
var mongoose= require('mongoose');
var hbs = require('express-handlebars');
var session = require('express-session');
var cors = require('cors');

app.use(session({secret: 'pablo2067'}));

mongoose.Promise = global.Promise; ///poder usar el async await y no tener problemas


//definir lo que importamos de hbs y lo que usamos
app.engine('handlebars' , hbs());
app.set('view engine', 'handlebars');

// definimos una funcion que conectamos con la base de dato //Async Await
async function conectar() {
//llamamos a una libreria de mongoose para que se conecte    
await mongoose.connect(
    'mongodb://10.128.35.136:27017/curso',
    {useNewUrlParser: true}
)
console.log('conectado!');
 }
 conectar();


//Esquema del Artista - info que vamos a meter en la base de datos

const ArtistaSchema = mongoose.Schema({
    nombre: String,
    apellido: String
})
//Con que datos vamos a trabajar? Que la conexion se va a llamar Artista
const ArtistaModel= mongoose.model('Artista', ArtistaSchema);




app.get('/', async function(req, res) {
    var listado = await ArtistaModel.find();
    res.send(listado);
});

app.get('/buscar/:id', async function(req, res) {
    var listado = await ArtistaModel.find({_id: req.params.id});
    res.send(listado);
});


app.get('/agregar', async function (req, res) {
    var nuevoArtista = await ArtistaModel.create(
        {nombre: 'Pablo', apellido: 'Lopez'}
        );
        res.send(nuevoArtista);
});

app.get('/modificar', async function(req, res) {
    await ArtistaModel.findByIdAndUpdate(
        {_id: '5e570936223f1532307c1c5c'},
        {nombre: 'nuevo nombre', apellido: 'nuevo apellido'}
    );
        res.send('ok');
});

app.get('/borrar', async function(req, res){
var rta = await ArtistaModel.findByIdAndRemove(
    {_id: '5e570936223f1532307c1c5c'}
);
        res.send(rta);
});

app.get('/listado', async function(req, res){
    var listado = await ArtistaModel.find().lean();
            res.render('listado', {listado: listado});
    });

//app.get('/formulario_alta', async function(req, res){
  ///      var listado = await ArtistaModel.find();
     //           res.render('listado', {listado: listado});
       // });


        app.use(express.urlencoded({extended: true}));
        app.use(express.json());

        //cortar aca

        app.get('/alta', async function(req,res){
            res.render('formulario');
        });
        
        app.post('/alta', async function(req, res) {
            if(req.body.nombre.lenght==''){
                res.render('formulario', {
                    error: 'El nombre es obligatorio',                    
                    datos:{
                    nombre: req.body.nombre,
                    apellido: req.body.apellido
                }
            });
                return;
            }    
            
            await ArtistaModel.create({
                    nombre: req.body.nombre,
                    apellido: req.body.apellido
                });
                res.redirect('/listado');
        });

        app.get('/borrar/:id',async function(req, res){
            // :id -> req.params.id
             await ArtistaModel.findByIdAndRemove(
                {_id: req.params.id}
            );
                    res.redirect('/listado');
            });

            app.get('/editar/:id',async function(req, res){
                // :id -> req.params.id
                var artista = await ArtistaModel.findById({_id: req.params.id}).lean()
                       // res.send(artista);
                       res.render('formulario', {datos: artista})
                });
    
        
app.post('/editar/:id',async function(req,res) {
    if(req.body.nombre.lenght==''){
        res.render('formulario', {
            error: 'El nombre es obligatorio',                    
            datos:{
            nombre: req.body.nombre,
            apellido: req.body.apellido
        }
    });
        return;
    }    
    await ArtistaModel.findByIdAndUpdate(
        {_id: req.params.id},
        {nombre: req.body.nombre , apellido: req.body.apellido}
    );
        res.redirect('/listado');
});

app.get('/contar', function (req,res) {
    if(!req.session.contador){
        req.session.contador = 0;
    }
    req.session.contador ++;
    res.json(req.session.contador);
    
});

app.get('/login',function(req,res){
    res.render('1login');


});


app.post('/login',function(req,res){
    // user:admin / pass: adminn123
if(req.body.username =='admin' & req.body.password == 'admin123'){
    res.send('ok');
}else{
    res.send('incorrecto');
}
    
});

const UsuarioSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
})
const UsuarioModel = mongoose.model('usuario', UsuarioSchema);
app.post('/login', async function(req, res) {
    // user: admin / pass: admin123
    var usuarios = await UsuarioModel.find({
        username: req.body.username,
        password: req.body.password
    });    
    res.send(usuarios);
    

    if (usuarios.length!=0) {
        req.session.user_id = usuarios[0]._id;
        res.send('/listado');
    } else {
        res.send('incorrecto');
    }
});


app.get('/api/artistas', async function(req,res) {
    var listado = await ArtistaModel.find().lean();
    res.send(listado);
});

app.get('/api/artistas/:id' , async function(req,res){
    try{
        var unArtista = await ArtistaModel.findById(req.params.id);
        res.json(unArtista);
    } catch(e) {
        res.status(404).send('error');
    }
});

app.post('/api/artistas', async function(req,res){
    var Artista = await ArtistaModel.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido
    });
    res.json(artista);

});

app.put('/api/artistas/:id', async function(req,res) {
   try{
    await ArtistaModel.findByIdAndUpdate(
        req.params.id,
        {
            nombre: req.body.nombre,
            apellido: req.body.apellido

        }
    );
    res.status(200).send('ok');
   }catch(e){
        res.status(404).send('error');

   }
});

app.delete('/api/artistas/:id' , async function(req,res){
    try{
    await ArtistaModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
    }catch(e){
        res.status(404).send('no encontrado');
    }
});


app.get('/signin', async function(req,res){
    res.render('signin_form');

});


app.post('/signin', async function(req,res){
    if(req.body.username=='' || req.body.password==''){
        res.render('signin_form', {
            error: 'El usuario/password es obligatorio',
            datos: req.body
        });
    return;
    }
await UsuarioModel.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
});
res.redirect('/login');
});


app.listen(8080, function() {
    console.log('App en localhost');
});

