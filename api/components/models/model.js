const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const productsBase = {
    product_id: {
        type: String,
        required: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
    },
};

const productsSchema = new mongoose.Schema(productsBase);
const products = productsSchema;
products.indexes({
    product_id: 1,
    product_name: 1,
});

const productsModel = mongoose.model('products', products);

const orderBase = {
    order_id: {
        type: String,
        required: true,
    },
    product_ids: {
        type: Array,
        required: true,
    },
    order_date: {
        type: Date,
        default: new Date(),
        required: true,
    }
};

const orderSchema = new mongoose.Schema(orderBase);
const order = orderSchema;
order.indexes({
    order_id: 1,
    order_date: 1,
});

const orderModel = mongoose.model('orders', order);

const billingBase = {
    order_id: {
        type: String,
        required: true,
    },
    billing_address: {
        type: String,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
};

const billingSchema = new mongoose.Schema(billingBase);
const billing = billingSchema;
billing.indexes({
    product_id: 1,
    user_id: 1,
});

const billingModel = mongoose.model('billings', billing);

const shippingBase = {
    order_id: {
        type: String,
        required: true,
    },
    shipping_address: {
        type: String,
        required: true,
    },
};

const shippingSchema = new mongoose.Schema(shippingBase);
const shipping = shippingSchema;
shipping.indexes({
    product_id: 1,
    user_id: 1,
});
const shippingModel = mongoose.model('shippings', shipping);

const deliveryBase = {
    order_id: String,
    product_ids: Array,
    total: Number,
    billing_address: String,
    shipping_address: String,
    order_date: Date,
    delivery_date: Date,
};
const deliverSchema = () => {
    const deliveryBaseSchema = new mongoose.Schema(deliveryBase);
    deliveryBaseSchema.plugin(uniqueValidator);
    return deliveryBaseSchema;
};
const delivery = deliverSchema();
delivery.index(
    {
        order_id: 1,
    },
    {
        unique: true,
    }
);
const deliveryModel = mongoose.model('deliveries', delivery);

module.exports = {
    Products: productsModel,
    Orders: orderModel,
    Billings: billingModel,
    Shippings: shippingModel,
    Delivery: deliveryModel,
};
