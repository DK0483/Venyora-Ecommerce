const express = require('express');
const Message = require('../models/message');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }

        const newMessage = new Message({
            name,
            email,
            message
        });

        const savedMessage = await newMessage.save();
        res.status(201).json({ msg: 'Message received! Thank you.', message: savedMessage });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;