// Utility function
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

var paymentId = window.location.hash.substring(1)

const showPaymentDetails = () => {
    // first we use the Get Payment API call to get the transaction details
    // then we show a nice thank you page
    http(
        {
            method: 'POST',
            route: '/getPaymentById',
            body: {
                id: paymentId
            }
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            console.log('Payment response', myApiResponse);

            // The nice thank you message
            var paragraph = document.createElement('p');
            paragraph.innerHTML =
                'Thank you for your order! Your payment ID is ' +
                myApiResponse.id +
                '. This payment was made via ' +
                myApiResponse.source.type
            document.body.appendChild(paragraph);
        }
    );
};

showPaymentDetails();