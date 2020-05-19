var MERCHANT_ID = "merchant.test.example.com";
var BACKEND_URL_VALIDATE_SESSION = window.location.href + "validateSession";
var BACKEND_URL_PAY = window.location.href + "pay";

var appleButton = document.querySelector(".apple-pay-button");

// Check if Apple Pay is available
if (window.ApplePaySession &&
    ApplePaySession.canMakePaymentsWithActiveCard(MERCHANT_ID)) {
    // Show Apple Pay button
    appleButton.getElementsByClassName.display = "block";
}

// Handle Apple Pay button click
appleButton.addEventListener("click", function () {
    var applePaySession = new ApplePaySession(3, {
        currencyCode: "USD",
        countryCode: "GB",
        merchantCapabilities: [
          "supports3DS",
          "supportsEMV",
          "supportsCredit",
          "supportsDebit"
        ],
        supportedNetworks: ["amex", "masterCard", "visa"],
        shippingType: "shipping",
        requiredBillingContactFields: [
          "postalAddress",
          "name",
          "phone",
          "email"
        ],
        requiredShippingContactFields: [
          "postalAddress",
          "name",
          "phone",
          "email"
        ],
        total: {
          label: "Demo Shop",
          amount: 0.1,
          type: "final"
        }
      });
      applePaySession.begin();


    // This is the first event Apple triggers
    // Validate the Apple Pay session from back-end
    applePaySession.onvalidatemerchant = function (event) {
        var validationUrl = event.validationURL;
        console.log(validationUrl);
        validateSession(validationUrl, function (merchantSession) {
            applePaySession.completeMerchantValidation(merchantSession);
        });
    };

    // This triggers after user has confirmed transaction with Touch/Face ID
    // Apple payment token returned
    applePaySession.onpaymentauthorized = function (event) {
        var applePaymentToken = event.payment.token;

        pay(applePaymentToken, function (outcome) {
            if (outcome) {
                applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);
            } else {
                applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);
            }
        });
    };
});


var validateSession = function (validationUrl, callback) {
    // Send the validation URL to back-end
        http(
            {
                method: 'POST',
                route: '/validateSession',
                body: {
                    appleUrl: validationUrl
                }
            },
            // This function is called after the server code is executed
            (response) => {
                console.log(response);
                callback(response);
            }
        );
};

var pay = function (applePaymentToken, callback) {
        http(
            {
                method: 'POST',
                route: '/payWithApple',
                body: {
                    token: applePaymentToken
                }
            },
            // This function is called after the server code is executed
            (response) => {
                console.log(response);
                callback(response);
            }
        );
};

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