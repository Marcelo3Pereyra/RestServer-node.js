const { response } = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const express = require('express');


const Usuario = require('../models/usuario');

const app = express();



app.get('/usuario', function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    Usuario.find({ estado: true }, 'nombre email role estado google img') //exclusiones para traer de la base de datos
        .skip(desde) //para saltar cantidad de registros
        .limit(limite) //para limitar la cantidad de resgistros que traemos de la DB
        .exec((err, usuarios) => { //ejecuta el query  


            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: err
                })
            }

            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })
            })



        })

});

app.post('/usuario', function(req, res) {


    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });


    usuario.save((err, usuarioDB) => {

        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: err
            })
        }



        res.json({
            ok: true,
            usuario: usuarioDB
        })


    });


});

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: err
            })
        };

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    })

});

app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: err
            })
        };

        if (!usuarioBorrado) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }



        res.json({
            ok: true,
            usuario: usuarioBorrado
        })

    })

});



module.exports = app;