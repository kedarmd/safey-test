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
        const response = await controller.getOrderDetailsById(order_id);
        res.status(200).send({ data: response });
    } catch (error) {
        console.log(error);
        res.status(500).send({ err: error.message });
    }
});

router.route('/orderbyproductid/:product_id').get(async (req, res) => {
    try {
        const product_id = req.params.product_id;
        const response = await controller.getOrderDetailsByProductId(
            product_id
        );
        res.status(200).send({ data: response });
    } catch (error) {
        console.log(error);
        res.status(500).send({ err: error.message });
    }
});

router.route('/createdelivery/:order_id').post(async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const response = await controller.createDelivery(order_id);
        const code = _.get(response, 'code', 500);
        res.status(code).send({ data: response });
    } catch (error) {
        console.log(error);
        const code = _.get(error, 'code', 500);
        res.status(code).send({ err: error.message });
    }
});

module.exports = router;
