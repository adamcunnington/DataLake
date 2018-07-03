
function getAccessToken() {
    return authorisation.accessToken;
}

const Ajax = {

    fetch(url, options) {

        // Default request options
         const requestOptions = {
             headers: {
                 "Authorization": getAccessToken()
             }
         };

        // Merge objects
        Object.assign(requestOptions, options);

        return window.fetch(url, requestOptions);
    }

};

export default Ajax;
