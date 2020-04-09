const express = require('express')
require('dotenv').config();
const router = express.Router()
const auth = require('../middleware/auth')
const Room = require('../model/room')
const User = require('../model/account');

//MongoDB Atlas connection setting
const mongoose = require('mongoose')
const connStr = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PWD)
mongoose.connect(connStr, { useNewUrlParser: true,
                            useUnifiedTopology: true,
                            useFindAndModify: false })
const db = mongoose.connection
db.on('error', () => console.log('Connection ERROR!!!'))
db.once('open', () => console.log('Database CONNECTED!!!'))

// User endpoint

router.post('/hotelbook/users', async (req, res, next) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).json({message : 'User added !', user, token});
    }
    catch(error){
        res.status(401).json({error :  error.message});
    }
});

router.post('/hotelbook/users/login', async (req, res, next) => {
    try{
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        if(!user)res.status(401).json({error : 'Login failed !'});
        const token = await user.generateAuthToken();
        res.status(200).json({token});
    }
    catch(error){
        res.status(400).json({error : error.message});
    }
});

router.get('/hotelbook/users/me', auth, (req, res, next) => {
    const user = req.user;
    res.status(201).json(user);
});

router.post('/hotelbook/users/logout', auth, async (req, res, next) => {
    const user = req.user;
    const currToken = req.token;
    try{
        user.tokens = user.tokens.filter(item => {
            return item.token != currToken;
        });
        await user.save();
        res.status(201).json({message : 'logout success !'});
    }
    catch(error){
        res.status(400).json({error : error.message});
    }
});

router.post('/hotelbook/users/logoutall', auth, async (req, res, next) => {
    const user = req.user;
    try{
        user.tokens.splice(0, user.tokens.length);
        await user.save();
        res.status(200).json({message : 'logout success !'});
    }
    catch(error){
        res.status(500).json({error : error.message});
    }
});


// rooms endpoint

router.get('/hotelbook/room', async (req,res,next) => {
    try{
        const rooms = await Room.find()
        res.status(200).json(rooms)
    } catch(error){
        res.status(500).json({error: error.message})
    }
})

router.put('/hotelbook/room/:id', async(req,res) => {
    const update_t= {
        // type : req.body.type,
        // room: req.body.room,
        // amount: Number(req.body.amount),
        // prize : Number(req.body.prize),
        name : req.body.name,
        surname : req.body.surname,
        id : req.body.id,
        status : true

    }
    try {
        const t = await Room.findByIdAndUpdate(req.params.id, update_t, {new: true})
        if (!t){
            res.status(404).json({error: ' UPDATE::room not found!!!'})
        }else{
        res.status(200).json(t)
    }
    } catch (error) {
        res.status(500).json({error:'UPDATE::'+error.message})
    }
})

router.delete('/hotelbook/room/:id', async (req,res) => {
    try {
        const t = await Room.findByIdAndDelete(req.params.id)
            res.status(200).json({message: 'room Deleted!!'})
    } catch (error) {
        res.status(500).json({error: 'DELETE::transaction not found'})
    }
})

router.get('/hotelbook/room/:id', async(req,res,next) => {
    try {
        const t = await Room.findById(req.params.id)
        if (!t) {
             res.status(404).json({error:'room not found'})
        }
        res.status(202).json(t)
    } catch (error) {
        res.status(500).json({error: 'GET::error'})
    }
})
// findbytype not finish
// router.get('/hotelbook/room/:type', async(req,res,next) => {
//     try {
//         const {type} = req.params
//         const t = await Room.findByType(type)
//         if (!t) {
//              res.status(404).json({error:'room not found'})
//         }
//         res.status(202).json(t)
//     } catch (error) {
//         res.status(500).json({error: 'GET::error'})
//     }
// })

router.post('/hotelbook/room', async (req,res) => {
    // const type = req.body.type
    // const room = req.body.room
    // const amount = req.body.amount
    // const prize = req.body.prize
    // const t = new Room(req.body)

    const type = req.body.type
    const room = req.body.room
    const amount = req.body.amount
    const prize = req.body.prize
    // const name = req.body.name
    // const surname = req.body.surname
    // const id = req.body.id
    const status = false
    const t = new Room(req.body)

    try {
        await t.save()
        res.status(200).json(t)
    } catch(error){
        res.status(500).json({error: error.message})
    }
})

module.exports = router