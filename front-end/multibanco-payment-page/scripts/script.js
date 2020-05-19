var payButton = document.getElementById('pay-button');
var form = document.getElementById('payment-form');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    http({
            method: 'POST',
            route: '/payMultibanco',
            body:{}
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            console.log('Response: ', myApiResponse);
            // redirect to the Multibanco URL
            window.location.href = myApiResponse.redirectionUrl;
        }
    );
});

// Utility method
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