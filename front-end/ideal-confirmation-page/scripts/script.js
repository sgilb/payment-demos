// this is just a utility function so you don not have to type
// a lot whenever you need to call your API.
const http = ({
    method,
    route,
    body
}, callback) => {
    let requestData = {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    };

    if (method.toLocaleLowerCase() === 'get') {
        delete requestData.body;
    }

    fetch(`${window.location.origin}${route}`, requestData)
        .then((res) => res.json())
        .then((data) => callback(data))
        .catch((er) => console.log(er));
};

const urlParams = new URLSearchParams(window.location.search);
// Here we are simply getting the session ID from the URL
const SESSION_ID = urlParams.get('cko-session-id');
// let SOURCE_BIC = '';
// let CUSTOMER_ID = '';

const showSaveIdeal = () => {
    // first we use the Get Payment API call to get the transaction details
    // then we show a nice thank you page and pay button
    http({
            method: 'POST',
            route: '/getPaymentBySession',
            body: {
                sessionId: SESSION_ID,
            },
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            console.log('Payment response', myApiResponse);

            // SOURCE_BIC = myApiResponse.source.bic;
            // CUSTOMER_ID = myApiResponse.customer.id;

            //TODO: Return issuer name in message
            // The nice thank you message
            var paragraph = document.createElement('p');
            paragraph.innerHTML =
                'Thank you for your order! Your payment ID is ' +
                myApiResponse.id +
                '. This payment was made from ' +
                myApiResponse.source.type +
                ' source ' +
                myApiResponse.source.description
            document.body.appendChild(paragraph);

            // The Pay button
            /* var payButton = document.createElement('input');
            payButton.setAttribute('type', 'button');
            payButton.setAttribute('name', 'pay');
            payButton.setAttribute('value', 'Pay with saved iDEAL payment method');
            document.body.appendChild(payButton);
            payButton.onclick = payWithSavedIdeal; */
        }
    );
};

// Removed function - unsupported

/* const payWithSavedIdeal = () => {
    // we simply use the source id to do a payment
    http(
        {
            method: 'POST',
            route: '/payWithExistingIdeal',
            body: {
                bic: SOURCE_BIC,
                customer_id: CUSTOMER_ID
            },
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            //alert('The payment with the saved iDEAL payment method was ' + myApiResponse.response_summary);
            console.log('Payment response', myApiResponse);

            window.location.href = myApiResponse.redirectionUrl;
        }
    );
}; */

showSaveIdeal();