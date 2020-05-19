const axios = require("axios");
const https = require("https");
const fs = require("fs");
var express = require("express");

// Merchant credentials
const merchantId = "merchant.test.steve.comv";
const merchantDomainName = "appledemo.ngrok.io";
const merchantDisplayName = "Test Website"

var router = express.Router();
const path = require('path');

const ckoPublicKey = 'pk_test_7d8d24fc-ffdb-4efc-b945-a19847ce319a';
const ckoSecretKey = 'sk_test_bf908821-87a2-43bf-9e9f-77a1d4fffed2';

// Node SDK
const {
    Checkout
} = require('checkout-sdk-node');
const cko = new Checkout(ckoSecretKey, {
    pk: ckoPublicKey
});

// !!! for iDEAL + Payment Verification  ==>

// When you go to /ideal-payment-verification-page show the HTML
router.get('/ideal-payment-verification-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/ideal-payment-verification-page/index.html')
    );
});

router.post('/payIdeal', async (req, res) => {
    // get the bic from the request body
    const {
        bic
    } = req.body;

    try {
        const payment = await cko.payments.request({
            source: {
                type: 'ideal',
                bic: bic, // issuerId
                description: 'IDEALTEST'
            },
            currency: 'EUR',
            amount: 2499,
            success_url: 'http://localhost:4242/ideal-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// router.post('/payWithExistingIdeal', async (req, res) => {
//     const { bic, customer_id } = req.body;

//     try {
//         const payment = await cko.payments.request({
//             source: {
//                 type: "ideal",
//                 bic: bic,
//                 description: "IDEALTEST2"
//                 },
//             amount: 1000,
//             currency: "EUR",
//             customer: {
//                 id: customer_id
//             }
//         });
//         res.send(payment);
//     } catch (error) {
//         res.send(500, error);
//     }
// });

// When you go to /ideal-confirmation-page you will see the pay-with-save-ideal page HTML
router.get('/ideal-confirmation-page', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/ideal-confirmation-page/index.html'));
});

// <== !!! for iDEAL + Payment Verification

// !!! for Sofort  ==>

// When you go to /sofort-payment-page show the HTML
router.get('/sofort-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/sofort-payment-page/index.html')
    );
});

router.post('/paySofort', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: 'sofort'
            },
            currency: 'EUR',
            amount: 2499,
            success_url: 'http://localhost:4242/sofort-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Sofort

// !!! for Klarna  ==>

// When you go to /klarna-payment-page show the HTML
router.get('/klarna-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/klarna-payment-page/index.html')
    );
});

router.post('/createKlarnaSession', async (req, res) => {
    let session;
    try {
        session = await axios.post("https://api.sandbox.checkout.com/klarna-external/credit-sessions", {
            "purchase_country": "GB",
            "currency": "GBP",
            "locale": "en-GB",
            "amount": 2499,
            "tax_amount": 1,
            "products": [{
                "name": "Brown leather belt",
                "quantity": 1,
                "unit_price": 2499,
                "tax_rate": 0,
                "total_amount": 2499,
                "total_tax_amount": 0
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ckoSecretKey
            }
        })
        res.status(200).send(session.data);
    } catch (err) {
        res.status(500).send(err.response);
    }
});

router.post('/payKlarna', async (req, res) => {

    const {
        token
    } = req.body;

    console.log('Auth token', token);

    try {
        const payment = await cko.payments.request({
            amount: 2499,
            currency: "GBP",
            //capture: false,
            source: {
                type: "klarna",
                authorization_token: token,
                locale: "en-GB",
                purchase_country: "GB",
                tax_amount: 0,
                billing_address: {
                    given_name: "John",
                    family_name: "Doe",
                    email: "johndoe@email.com",
                    title: "Mr",
                    street_address: "Sceptre House",
                    "street_address2": "New Burlington Street",
                    postal_code: "W1S 2JA",
                    city: "London",
                    phone: "01895808221",
                    country: "GB"
                },
                customer: {
                    date_of_birth: "1970-01-01",
                    gender: "male"
                },
                products: [{
                    name: "Brown leather belt",
                    quantity: 1,
                    unit_price: 2499,
                    tax_rate: 0,
                    total_amount: 2499,
                    total_tax_amount: 0
                }]

            },
            success_url: 'http://localhost:4242/klarna-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail' // route to failure
        });

        // Only send back the redirection URL
        res.send(payment);
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Klarna

// !!! for Bancontact  ==>

// When you go to /bancontact-payment-page show the HTML
router.get('/bancontact-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/bancontact-payment-page/index.html')
    );
});

router.post('/payBancontact', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: 'bancontact',
                payment_country: 'BE',
                account_holder_name: 'Test Person'
            },
            currency: 'EUR',
            amount: 2499,
            success_url: 'http://localhost:4242/bancontact-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Bancontact

// !!! for QPay  ==>

// When you go to /qpay-payment-page show the HTML
router.get('/qpay-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/qpay-payment-page/index.html')
    );
});

router.post('/payQpay', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            "amount": 2499,
            "currency": "QAR",
            "source": {
                "type": "qpay",
                "description": "QPay Test Payment"
            },

            success_url: 'http://localhost:4242/qpay-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for QPay

// !!! for Boleto  ==>

// When you go to /qpay-payment-page show the HTML
router.get('/boleto-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/boleto-payment-page/index.html')
    );
});

router.post('/payBoleto', async (req, res) => {

    try {
        const payment = await cko.payments.request({

            source: {
                type: "boleto",
                integration_type: "redirect",
                country: "BR",
                payer: {
                    name: "John Doe",
                    email: "john@doe-enterprises.com",
                    document: "53033315550"
                },
                description: "Boleto Test Payment"
            },
            amount: 100,
            currency: "BRL",

            success_url: 'http://localhost:4242/qpay-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Boleto

// !!! for Fawry  ==>

// When you go to /fawry-payment-page show the HTML
router.get('/fawry-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/fawry-payment-page/index.html')
    );
});

// When you go to /fawry-confirmation-page show the HTML
router.get('/fawry-confirmation-page', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/fawry-confirmation-page/index.html'));
});

router.post('/payFawry', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            amount: 2499,
            currency: "EGP",
            source: {
                type: "fawry",
                description: "Fawry Demo Payment",
                customer_mobile: "01058375055",
                customer_email: "bruce@wayne-enterprises.com",
                products: [{
                    product_id: "0123456789",
                    quantity: 1,
                    price: 2499,
                    description: "Fawry Demo Product"
                }]
            },
            success_url: 'http://localhost:4242/fawry-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail' // route to failure
        });
        // Only send back the redirection URL
        res.send(payment);
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Fawry

// !!! for Multibanco  ==>

// When you go to /multibanco-payment-page show the HTML
router.get('/multibanco-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/multibanco-payment-page/index.html')
    );
});

router.post('/payMultibanco', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            amount: 2499,
            currency: "EUR",
            source: {
                type: "multibanco",
                payment_country: "PT",
                account_holder_name: "Bruce Wayne",
                billing_descriptor: "Multibanco Test Payment"
            },
            success_url: 'http://localhost:4242/multibanco-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Multibanco

// !!! for OXXO  ==>

// When you go to /oxxo-payment-page show the HTML
router.get('/oxxo-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/oxxo-payment-page/index.html')
    );
});

router.post('/payOxxo', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: "oxxo",
                integration_type: "redirect",
                country: "MX",
                payer: {
                    name: "Bruce Wayne",
                    email: "bruce@wayne-enterprises.com",
                    document: "WAKB700101HMCYNR06"
                },
                description: "simulate OXXO Demo Payment"
            },
            amount: 2499,
            currency: "MXN",
            success_url: 'http://localhost:4242/oxxo-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for OXXO

// !!! for Pago Facil  ==>

// When you go to /pago-facil-payment-page show the HTML
router.get('/pago-facil-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/pago-facil-payment-page/index.html')
    );
});

router.post('/payPagoFacil', async (req, res) => {

    try {
        const payment = await cko.payments.request({

            source: {
                type: "pagofacil",
                integration_type: "redirect",
                country: "AR",
                payer: {
                    name: "Bruce Wayne",
                    email: "bruce@wayne-enterprises.com",
                    document: "27332162"
                },
                description: "Pago Fácil Test Payment"
            },
            amount: 100,
            currency: "ARS",
            success_url: 'http://localhost:4242/pago-facil-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Pago Facil

// !!! for Rapipago  ==>

// When you go to /rapipago-payment-page show the HTML
router.get('/rapipago-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/rapipago-payment-page/index.html')
    );
});

router.post('/payRapipago', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: "rapipago",
                integration_type: "redirect",
                country: "AR",
                payer: {
                    name: "Bruce Wayne",
                    email: "bruce@wayne-enterprises.com",
                    document: "27332162"
                },
                description: "Rapipago Test Payment"
            },
            amount: 2499,
            currency: "ARS",
            success_url: 'http://localhost:4242/rapipago-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Rapipago

// !!! for Baloto  ==>

// When you go to /baloto-payment-page show the HTML
router.get('/baloto-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/baloto/baloto-payment-page/index.html')
    );
});

router.post('/payBaloto', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: "baloto",
                integration_type: "redirect",
                country: "CO",
                payer: {
                    name: "Bruce Wayne",
                    email: "bruce@wayne-enterprises.com",
                    document: "297332162"
                },
                description: "Via Baloto Test Payment"
            },
            amount: 100000,
            currency: "COP",
            success_url: 'http://localhost:4242/baloto-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });
        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Baloto

// !!! for EPS  ==>

// When you go to /eps-payment-page show the HTML
router.get('/eps-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/eps-payment-page/index.html')
    );
});

router.post('/payEps', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: "eps",
                purpose: "Mens black t-shirt L"
            },
            amount: 1914,
            currency: "EUR",
            success_url: 'http://localhost:4242/eps-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });
        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for EPS

// !!! for GiroPay  ==>

// When you go to /giropay-payment-page show the HTML
router.get('/giropay-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/giropay-payment-page/index.html')
    );
});

router.post('/payGiroPay', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: "giropay",
                purpose: "Mens black t-shirt L"
            },
            amount: 2499,
            currency: "EUR",
            success_url: 'http://localhost:4242/eps-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });
        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for GiroPay

// !!! for Poli  ==>

// When you go to /poli-payment-page show the HTML
router.get('/poli-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/poli-payment-page/index.html')
    );
});

router.post('/payPoli', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            source: {
                type: "poli"
            },
            amount: 2499,
            currency: "AUD",
            success_url: 'http://localhost:4242/poli-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });
        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Poli

// !!! for Przelewy24  ==>

// When you go to /p24-payment-page show the HTML
router.get('/p24-payment-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/p24-payment-page/index.html')
    );
});

router.post('/payP24', async (req, res) => {

    try {
        const payment = await cko.payments.request({
            amount: 2499,
            currency: "PLN",
            source: {
                type: "p24",
                payment_country: "PL",
                account_holder_name: "Bruce Wayne",
                account_holder_email: "bruce@wayne-enterprises.com",
                billing_descriptor: "Przelewy24 Test Payment"
            },
            success_url: 'http://localhost:4242/p24-confirmation-page', // route to success
            failure_url: 'http://localhost:4242/fail', // route to failure
        });
        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink
        });
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Przelewy24

// When you go to /frames-line-3ds-card-verification show the HTML
router.get('/frames-line-3ds-card-verification-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/frames-line-3ds-card-verification-page/index.html')
    );
});

// When you go to /frames-line-3ds-card-verification show the HTML
router.post('/pay3DS', async (req, res) => {
    // get the token from the request body
    const {
        token
    } = req.body;

    try {
        const payment = await cko.payments.request({
            source: {
                token: token,
            },
            '3ds': {
                enabled: true,
            },
            currency: 'USD',
            amount: 1000,
            success_url: 'http://localhost:4242/pay-with-save-card-page', // notice I mention the route to success
            failure_url: 'http://localhost:4242/fail', // notice I mention the route to failure
        });

        // Only send back the redirection URL
        res.send({
            redirectionUrl: payment.redirectLink,
        });
    } catch (error) {
        res.send(500, error);
    }
});

// Get payment details
router.post('/getPaymentBySession', async (req, res) => {
    const {
        sessionId
    } = req.body;

    try {
        const details = await cko.payments.get(sessionId);
        res.send(details);
    } catch (error) {
        res.send(500, error);
    }
});

// Get payment details
router.post('/getPaymentById', async (req, res) => {
    const {
        id
    } = req.body;

    try {
        const details = await cko.payments.get(id);
        res.send(details);
    } catch (error) {
        res.send(500, error);
    }
});

router.post('/payWithSourceId', async (req, res) => {
    const {
        id
    } = req.body;

    try {
        const payment = await cko.payments.request({
            source: {
                type: 'id',
                id: id,
            },
            currency: 'USD',
            amount: 1000, // cents
        });
        res.send(payment);
    } catch (error) {
        res.send(500, error);
    }
});

// When you go to /pay-with-save-card you will see the pay-with-save-card page HTML
router.get('/pay-with-save-card-page', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/pay-with-save-card-page/index.html'));
});


// !!! for Google Pay  ==>

// When you go to /buy-with-gpay-page show the HTML
router.get('/buy-with-gpay-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/buy-with-gpay-page/index.html')
    );
});

// When you go to /gpay-confirmation-page show the HTML
router.get('/gpay-confirmation-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/gpay-confirmation-page/index.html')
    );
});

router.post('/payWithGoogle', async (req, res) => {
    const {
        signature,
        protocolVersion,
        signedMessage
    } = req.body;

    let tokenResponse;

    console.log('Google token: ', req.body)

    try {
        tokenResponse = await cko.tokens.request({
            // type:"googlepay" is inferred
            token_data: {
                signature,
                protocolVersion,
                signedMessage
            }
        });
    } catch (error) {
        res.send(500, error);
    }

    console.log('CKO token: ', tokenResponse.token);

    /* Do payment request w/ token */
    const token = tokenResponse.token;

    try {
        const payment = await cko.payments.request({
            source: {
                // type:"token" is inferred
                token: token
            },
            currency: 'GBP',
            amount: 1000, // pence
            reference: 'GPAY-TEST'
        });
        res.send(payment);
    } catch (error) {
        res.send(500, error);
    }
});

// <== !!! for Google Pay

// !!! for Apple Pay  ==>

// Validate the Apple Pay session
router.post("/validateSession", async (req, res) => {
    // Get URL from front-end
    const {
        appleUrl
    } = req.body;

    console.log(appleUrl);

    try {
        // Use Apple Pay certificates
        let httpsAgent = new https.Agent({
            rejectUnauthorized: false,
            cert: fs.readFileSync(
                path.join(__dirname, "/certificates/certificate_sandbox.pem")
            ),
            key: fs.readFileSync(
                path.join(__dirname, "/certificates/certificate_sandbox.key")
            ),
        });

        let response = await axios.post(
            appleUrl, {
                merchantIdentifier: merchantId,
                domainName: merchantDomainName,
                displayName: merchantDisplayName
            }, {
                httpsAgent
            }
        );
        res.send(response.data);
    } catch (er) {
        res.send(er);
    }
});

// Tokenize Apple Pay payload and perform payment
router.post("/payWithApple", async (req, res) => {
    const {
        version,
        data,
        signature,
        header
    } = req.body.token.paymentData;

    let checkoutToken = await cko.tokens.request({
        type: "applepay",
        token_data: {
            version: version,
            data: data,
            signature: signature,
            header: {
                ephemeralPublicKey: header.ephemeralPublicKey,
                publicKeyHash: header.publicKeyHash,
                transactionId: header.transactionId
            }
        }
    });

    const payment = await cko.payments.request({
        source: {
            token: checkoutToken.token
        },
        amount: 1000, // pence
        currency: "GBP"
    });

    console.log(payment);
    res.send(payment);
});

// <== !!! for Apple Pay


// !!! <== for The Success or Fail Page

// When you go to /success you will see the success page HTML
router.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/outcome-pages/success.html'));
});

// When you go to /fail you will see the fail page HTML
router.get('/fail', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/outcome-pages/fail.html'));
});

module.exports = router;