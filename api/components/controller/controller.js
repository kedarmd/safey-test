const uuid = require('uuid');
const _ = require('lodash');
const { Products, Orders, Shippings, Billings } = require('../models/model');

async function doesProductExist(product_id) {
    const product = await Products.findOne({ product_id: product_id }).select({
        _id: 0,
    });
    return product !== null
        ? { data: product, status: true }
        : { data: product, status: false };
}

async function doesProductExistMany(product_ids) {
    const queries = product_ids.map((product_id) => {
        return doesProductExist(product_id);
    });
    const product_data = await Promise.all(queries);
    const index = product_data.findIndex((ele) => ele.status === false);
    if (index !== -1) {
        throw { message: `Product ${product_ids[index]} not found` };
    }
    return product_data;
}

async function addShippingAddress(address, order_id) {
    const stored_address = await Shippings.insertMany({
        order_id: order_id,
        shipping_address: address,
    });
    return { data: stored_address, message: 'success' };
}

async function addBillingAddress(address, order_id, total) {
    const stored_address = await Billings.insertMany({
        order_id: order_id,
        billing_address: address,
        total: total,
    });
    return { data: stored_address, message: 'success' };
}

async function addOrder(order_id, product_ids) {
    const order = await Orders.insertMany({
        order_id: order_id,
        product_ids: product_ids,
    });
    return { data: order, message: 'success' };
}

async function storeOrder(reqparams) {
    const product_ids = reqparams.product_ids;
    let total = 0;
    if (product_ids.length) {
        const product_data = await doesProductExistMany(product_ids);
        product_data.forEach((p) => {
            total += p.data.price;
        });
    } else {
        throw { message: `Product not entered. Please add products.` };
    }

    const order_id = uuid.v4();
    const queries = [
        addOrder(order_id, product_ids),
        addBillingAddress(reqparams.billing_address, order_id, total),
        addShippingAddress(reqparams.shipping_address, order_id),
    ];
    const [order_data, billing_data, shipping_data] = await Promise.all(
        queries
    );
    const response = {
        order_id: order_data.data.length
            ? _.get(order_data.data[0], 'order_id', 'Not Available!')
            : 'Not Available!',
        product_ids: order_data.data.length
            ? _.get(order_data.data[0], 'product_ids', [])
            : [],
        order_date: order_data.data.length
            ? _.get(order_data.data[0], 'order_date', 'Not Available!')
            : 'Not Available!',
        billing_address: billing_data.data.length
            ? _.get(billing_data.data[0], 'billing_address', 'Not Available!')
            : 'Not Available!',
        total: billing_data.data.length
            ? _.get(billing_data.data[0], 'total', 'Not Available!')
            : 'Not Available!',
        shipping_address: shipping_data.data.length
            ? _.get(shipping_data.data[0], 'shipping_address', 'Not Available!')
            : 'Not Available!',
    };
    return response;
}

module.exports = {
    storeOrder,
};
