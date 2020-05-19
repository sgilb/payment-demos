// Utility function
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
            // The nice thank you message
            var paragraph = document.createElement('p');
            paragraph.innerHTML =
                'Thank you for your order (ref ' +
                myApiResponse.reference +
                ') made with your ' +
                myApiResponse.source.scheme +
                ' card ending in ' +
                myApiResponse.source.last4;
            document.body.appendChild(paragraph);
        }
    );
};

showPaymentDetails();
