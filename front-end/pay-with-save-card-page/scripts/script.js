// this is just a utility function so you don not have to type
// a lot whenever you need to call your API.
const http = ({ method, route, body }, callback) => {
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
let SOURCE_ID = '';

const showSaveCard = () => {
    // first we use the Get Payment API call to get the transaction details
    // then we show a nice thank you page a pay button
    http(
        {
            method: 'POST',
            route: '/getPaymentDetails',
            body: {
                sessionId: SESSION_ID,
            },
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            // We update the source id, since it will be used in the payment
            SOURCE_ID = myApiResponse.source.id;

            // The nice thank you message
            var paragraph = document.createElement('p');
            paragraph.innerHTML =
                'Thank you!. You now have your ' +
                myApiResponse.source.scheme +
                ' card ending in ' +
                myApiResponse.source.last4 +
                ' saved so you can pay with this save card in the future. Click the button bellow to do so:';
            document.body.appendChild(paragraph);

            // The Pay button
            var payButton = document.createElement('input');
            payButton.setAttribute('type', 'button');
            payButton.setAttribute('name', 'pay');
            payButton.setAttribute('value', 'Pay with saved card');
            document.body.appendChild(payButton);
            payButton.onclick = payWithSavedCard;
        }
    );
};

const payWithSavedCard = () => {
    // we simply use the source id to do a payment
    http(
        {
            method: 'POST',
            route: '/payWithSourceId',
            body: {
                id: SOURCE_ID,
            },
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            alert('The payment with the saved card was ' + myApiResponse.response_summary);
            console.log('Payment response', myApiResponse);
        }
    );
};

showSaveCard();
