var payButton = document.getElementById('pay-button');
var form = document.getElementById('payment-form');

Frames.init('pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a');

Frames.addEventHandler(Frames.Events.CARD_VALIDATION_CHANGED, function (event) {
    console.log('CARD_VALIDATION_CHANGED: %o', event);

    payButton.disabled = !Frames.isCardValid();
});

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, function (event) {
    http(
        {
            method: 'POST',
            route: '/pay3DS',
            body: {
                token: event.token,
            },
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            console.log('The response from the our API', myApiResponse);
            // redirect to the 3DS URL
            window.location.href = myApiResponse.redirectionUrl;
        }
    );
});

form.addEventListener('submit', function (event) {
    event.preventDefault();
    Frames.submitCard();
});

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
