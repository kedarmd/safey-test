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

async function getBillingDetailsByOrderId(order_id) {
    const billings = await Billings.findOne({ order_id: order_id });
    if (billings === null) {
        const error = new Error(
            `Billing details for order_id: ${order_id} not found.`
        );
        error.code = 404;
        throw error;
    }
    return billings;
}

async function getShippingDetailsByOrderId(order_id) {
    const shippings = await Shippings.findOne({ order_id: order_id });
    if (shippings === null) {
        const error = new Error(
            `Shipping details for order_id: ${order_id} not found.`
        );
        error.code = 404;
        throw error;
    }
    return shippings;
}

async function getOrderById(order_id) {
    const order = await Orders.findOne({ order_id: order_id }).select({
        _id: 0,
    });
    if (order === null) {
        const error = new Error(`order for order_id: ${order_id} not found.`);
        error.code = 404;
        throw error;
    }

    return order;
}

async function getOrderDetailsById(order_id) {
    const addressQueries = [
        getOrderById(order_id),
        getBillingDetailsByOrderId(order_id),
        getShippingDetailsByOrderId(order_id),
    ];
    const [
        order_details,
        billing_details,
        shipping_details,
    ] = await Promise.all(addressQueries);

    const response = {
        order_id: _.get(order_details, 'order_id', ''),
        product_ids: _.get(order_details, 'product_ids', []),
        total: _.get(billing_details, 'total', 0),
        billing_address: _.get(billing_details, 'billing_address', ''),
        shipping_address: _.get(shipping_details, 'shipping_address', ''),
        order_date: _.get(order_details, 'order_date', ''),
    };
    return response;
}

async function getOrdersByProductId(product_id) {
    const orders = Orders.find({ product_ids: product_id }).select({
        _id: 0,
        __v: 0,
    });
    return orders;
}

async function getOrderDetailsByProductId(product_id) {
    const orders = await getOrdersByProductId(product_id);
    const order_ids = orders.length
        ? orders.map((order) => order.order_id)
        : [];

    const queries = order_ids.length
        ? order_ids.map((order_id) => {
              return getOrderDetailsById(order_id);
          })
        : [];

    const response = await Promise.all(queries);

    return response;
}

module.exports = {
    storeOrder,
    getOrderDetailsById,
    getOrderDetailsByProductId,
};
