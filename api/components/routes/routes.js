'use strict';
const express = require('express');
const _ = require('lodash');
const router = express.Router();
const controller = require('../controller/controller');

router.use((req, res, next) => {
    console.log(req.url, 'at', Date.now());
    next();
});

router.route('/order').post(async (req, res) => {
    try {
        const params = req.query;
        const reqparams = {};
        reqparams['product_ids'] = JSON.parse(_.get(params, 'product_ids', []));
        reqparams['billing_address'] = _.get(params, 'billing_address', '');
        reqparams['shipping_address'] = _.get(params, 'shipping_address', '');
        const response = await controller.storeOrder(reqparams);
        res.status(200).send({ data: response });
    } catch (error) {
        console.log(error);
        res.status(500).send({ err: error.message });
    }
});

router.route('/order/:order_id').get(async (req, res) => {
    try {
        const order_id = req.params.order_id;
        console.log(order_id);
        const response = await controller.getOrderDetailsById(order_id);
        res.status(200).send({ data: response });
    } catch (error) {
        console.log(error);
        res.status(500).send({ err: error.message });
    }
});

router.route('/order/:product_id').get((req, res) => {
    const product_id = req.params.product_id;
    res.send(`Get.........${product_id}`);
});

module.exports = router;
