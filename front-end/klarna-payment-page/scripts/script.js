var payButton = document.getElementById('pay-button');
var form = document.getElementById('payment-form');
var ckoURL = 'https://api.sandbox.checkout.com/klarna-external/credit-sessions'

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

// If URL contains Klarna client token, load widget
if (window.location.href.indexOf("client-token") > -1) {
    window.klarnaAsyncCallback = function () {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('client-token')
        console.log(token);

        try {
            Klarna.Payments.init({
                client_token: token
            });
        } catch (e) {
            // Handle error
        }

        try {
            Klarna.Payments.load(
                // options
                {
                    container: "#klarna_container",
                    payment_method_categories: ["pay_over_time", "pay_later"],
                    instance_id: "klarna-payments-instance"
                },
                // data
                {},
                // callback
                function (response) {}
            );
        } catch (e) {
            // Handle error. The load~callback will have been called
            // with "{ show_form: false }" at this point.
        }

    };
}
// Append client token to URL
else {

    /* Create new Klarna session on page load */
    http({
            method: 'POST',
            route: '/createKlarnaSession',
            body: {}
        },
        // Function called after server code is executed
        (response) => {
            console.log('Klarna session: ', response);
            const clientToken = response.client_token;

            window.history.pushState(null, null, "/klarna-payment-page?client-token=" + clientToken);

            location.reload();

        }
    );
}

form.addEventListener('submit', function (event) {
    event.preventDefault();
    try {
        Klarna.Payments.authorize(
            // options
            {
                instance_id: "klarna-payments-instance" // Same as instance_id set in Klarna.Payments.load().
            },
            // data
            {
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
                }
            },
            // callback
            function (response) {
                console.log('Submitted: ', response)

                const token = response.authorization_token;

                // Payment request
                http({
                        method: 'POST',
                        route: '/payKlarna',
                        body: {
                            token: token
                        }
                    },
                    // This function is called after the server code is executed
                    (apiResponse) => {
                        console.log('Payment: ', apiResponse);
                        // redirect to the Klarna URL
                        window.location.href = '/klarna-confirmation-page?pay-id=' + apiResponse.id;
                    }
                );
            }
        );
    } catch (e) {
        // Handle error. The authorize~callback will have been called
        // with "{ show_form: false, approved: false }" at this point.
    }
});