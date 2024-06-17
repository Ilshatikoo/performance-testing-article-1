const { User, Product, Order, sequelize } = require('./models');

const loadUsers = async (num) => {
    const users = [];
    for (let i = 0; i < num; i++) {
        users.push({ name: `User${i}`, email: `user${i}@example.com` });
    }
    await User.bulkCreate(users);
};

const loadProducts = async (num) => {
    const products = [];
    for (let i = 0; i < num; i++) {
        products.push({ name: `Product${i}`, price: Math.random() * 100 });
    }
    await Product.bulkCreate(products);
};

const loadOrders = async (num) => {
    const orders = [];
    for (let i = 0; i < num; i++) {
        orders.push({ userId: Math.floor(Math.random() * num) + 1, productId: Math.floor(Math.random() * num) + 1, quantity: Math.floor(Math.random() * 10) + 1 });
    }
    await Order.bulkCreate(orders);
};

const loadData = async () => {
    try {
        await sequelize.sync({ force: true });
        await loadUsers(10000);  // Загрузка 10,000 пользователей
        await loadProducts(1000);  // Загрузка 1,000 продуктов
        await loadOrders(50000);  // Загрузка 50,000 заказов
        console.log('Data loaded');
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

const resetDatabase = async () => {
    try {
        await sequelize.drop();
        await sequelize.sync();
        console.log('Database reset and tables recreated!');
    } catch (error) {
        console.error('Error resetting the database:', error);
    }
};

resetDatabase();
loadData();