var router = require('express').Router();
const path = require('path');

// I added the Node SK to make your life easier
const {
    Checkout
} = require('checkout-sdk-node');
const cko = new Checkout('sk_test_bf908821-87a2-43bf-9e9f-77a1d4fffed2', {
    pk: 'pk_test_7d8d24fc-ffdb-4efc-b945-a19847ce319a'
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

// When you go to /pay-with-save-ideal you will see the pay-with-save-ideal page HTML
router.get('/ideal-confirmation-page', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/ideal-confirmation-page/index.html'));
});

// <== !!! for iDEAL + Payment Verification


// !!! for Frames One Line + 3DS +  Card Verification  ==>

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
router.post('/getPaymentDetails', async (req, res) => {
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

// <== !!! for Frames One Line + 3DS +  Card Verification

// !!! for Google Pay  ==>

// When you go to /buy-with-gpay-page show the HTML
router.get('/buy-with-gpay-page', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../front-end/buy-with-gpay-page/index.html')
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