/**
 * @providesModule ml-api
 */

const BASE_URL = "https://spareme.pw/";
const ENDPOINT_ADD = "add";
const ENDPOINT_PREDICT = "predict"
const ENDPOINT_LABELS = "labels"
const DEFAULT_CATEGORY = "harmless";
const ENDPOINT_RESET = "reset";

/**
 * Gets categories for a group of Strings
 *
 * @param batch a JSON object whose keys are the Strings to analyze
 * @param idToken the auth token of the current user
 */
export function getCategoriesForBatch(batch, idToken, callback) {
    let url = BASE_URL + ENDPOINT_PREDICT;

    var form = new FormData();
    form.append('id_token', idToken);
    form.append('unlabeled_text', JSON.stringify(batch));

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).then(function(response) {
        console.log('getCategoriesForBatch got response: ' + JSON.stringify(response._bodyText));
        callback(JSON.parse(response._bodyText));
    }).catch(error => {
        console.log(error);
    });
}

/**
 * Tells the API to label the text with the given category for the current user.
 *
 * @param text the actual text that's being labeled
 * @param category the category (label) that's being applied to the text
 * @param idToken the auth token of the current user
 */
export function addTextToCategory(text, category, idToken) {
    let url = BASE_URL + ENDPOINT_ADD;

    var form = new FormData();
    form.append('id_token', idToken);
    form.append('label', category);
    form.append('text', text);

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).then(function(response) {
        console.log('addTextToCategory got response: ' + JSON.stringify(response._bodyText));
    }).catch(error => {
        console.log(error);
    });
}

export function getCategories(idToken, callback) {
    let url = BASE_URL + ENDPOINT_LABELS;

    var form = new FormData();
    form.append('id_token', idToken);

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).then(function(response) {
        console.log('getCategories got response: ' + JSON.stringify(response._bodyText));
        callback(JSON.parse(response._bodyText));
    }).catch(error => {
        console.log(error);
    });
}

/**
*   Deletes all data
*
*
*/
export function dataReset(idToken) {
    let url = BASE_URL + ENDPOINT_RESET;

    var form = new FormData();
    form.append('id_token', idToken);

    let requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: form
    }

    fetch(url, requestData).then(function(response) {
        console.log('dataReset got response: ' + JSON.stringify(response._bodyText));
    }).catch(error => {
        console.log(error);
    });

}
