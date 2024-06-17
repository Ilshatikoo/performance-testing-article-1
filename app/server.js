const express = require('express');
const bodyParser = require('body-parser');
const { User, Product, Order, sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.post('/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.get('/products', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
});

app.get('/orders', async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
