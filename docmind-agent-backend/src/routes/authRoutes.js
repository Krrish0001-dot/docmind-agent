const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register",async(req,res,next) => {
    try{
        const { name, email, password } = req.body;
        if(!name || !email || !password){
            return res.status(400).json({ success:false, message: "Name email, and password are required"});
        }
        const existing = await User.findOne({ email });
        if(existing){
            return res.status(409).json({ success: false, message: "Email already in use"});
        }
        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        });
        res.status(201).json({
            success: true,
            data: { token,user:{ id: user._id, name: user.name, email:user.email}},
        });
    } catch(err){
        next(err);
    }
});

router.post("/login",async(req,res,next) => {
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ success: false, message: "Email and password are required"});
        }
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({ success: false,message: "Invalid credentials "});
        }
        const match = await user.comparePassword(password);
        if(!match) {
            return res.status(401).json({ success:false, message:"Invalid credentials"});
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        });
        res.status(200).json({
            success:true,
            data: { token,user: {id: user._id, name: user.name, email:user.email }},
        });
    } catch(err){
        next(err);
    }
});

module.exports = router;