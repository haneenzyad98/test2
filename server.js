'use strict';

// import all packages we need
require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
const { pipe } = require('superagent');
// const { query } = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
app.use(express.static('./public/'));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride('_method'));
//---------------------------------------------------------
app.get('/' , gethomepage)
app.get('/all' , getalldata)
app.post('/all' , savedata)
app.get('/save' , showsave)
app.get('/details/:id' , detailshandler)
app.put('/details/:id' , updatehandler)
app.delete('/details/:id' , deletehandler)
// --------------------------------------------------------
client.connect().then(()=>{
    app.listen(PORT ,()=>console.log(`I'm working at port ${PORT}`))
})
//---------------------------------------------------------
function gethomepage(req,res){
res.render('index')
}
function getalldata(req,res){
let url='https://digimon-api.vercel.app/api/digimon';
superagent.get(url).then( x=>{
    let data =x.body;
    res.render('all' , {toto:data})
})
}
function savedata(req,res){
    let name=req.body.one;
    let src=req.body.two;
    let level=req.body.three;
    let value =[name,src,level];
    let SQL='INSERT INTO dig (name,image,level)VALUES($1,$2,$3) RETURNING *'
    client.query(SQL,value).then(z=>{
        console.log(z.rows);
        res.render('index')
    })
}
function showsave(req,res){
let SQL =`SELECT * FROM dig`
client.query(SQL).then(x=>{
    res.render('mysave' , {coll:x.rows})
})
}
function detailshandler(req,res){
    let SQL=`SELECT * FROM dig WHERE id=$1`
    client.query(SQL,[req.params.id]).then(x=>{
        console.log(x.rows);
        res.render('details',{data:x.rows[0]})
    })
}
function updatehandler(req,res){
let name=req.body.name;
let image=req.body.image;
let level=req.body.level;
let id=req.body.id;
let value=[name,image,level,id]
let SQL=`UPDATE dig SET name=$1,image=$2,level=$3 WHERE id=$4`
client.query(SQL,value).then(x=>{
    res.redirect(`/details/${id}`)
})
}


function deletehandler(req, res){
    let id = req.body.id;
    console.log(req.body.id);
    let SQL = 'DELETE FROM dig WHERE id=$1;';
    client.query(SQL, [id]).then( x => {
        res.redirect('/')
    })
}