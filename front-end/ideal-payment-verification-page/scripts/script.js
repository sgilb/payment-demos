var payButton = document.getElementById('pay-button');
var form = document.getElementById('payment-form');
var issuerInput = document.getElementById("issuer-input");
var ckoURL = 'https://api.sandbox.checkout.com/ideal-external/issuers';


// TODO: Proper issuer validation (i.e. get list of issuers https://docs.checkout.com/docs/ideal#section-get-a-list-of-supported-issuers)
issuerInput.addEventListener("keyup", function () {
    if (issuerInput.value != "") {
        payButton.removeAttribute("disabled");
    } else {
        payButton.setAttribute("disabled", null);
    }
});

form.addEventListener('submit', function (event) {
    event.preventDefault();
    http({
            method: 'POST',
            route: '/payIdeal',
            body: {
                bic: issuerInput.value // issuerId
            }
        },
        // This function is called after the server code is executed
        (myApiResponse) => {
            console.log('Response: ', myApiResponse);
            // redirect to the iDEAL URL
            window.location.href = myApiResponse.redirectionUrl;
        }
    );
});

// TODO: run on page load to allow drop-down selection of BIC/issuerId
function getIssuerList() {
    fetch(ckoURL, {
            method: "GET",
            headers: {
                "Authorization": "'pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a'",
                "Content-Type": "application/json"
            }
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Supported Issuers:", data);

            // TODO: Populate drop-down with issuer names

        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

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