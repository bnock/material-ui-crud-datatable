export const parseRequestError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 400:
                if (error.response.data) {
                    return error.response.data;
                } else {
                    return 'Improper request';
                }

            case 401:
                return 'Unauthenticated';

            case 403:
                return 'Unauthorized access';

            case 404:
                return 'Requested resource does not exist';

            case 500:
                return 'The server responded with an error';

            default:
                return 'An unknown error occurred';
        }

    } else if (error.request) {
        return 'No response received from server';

    } else {
        return 'Error creating request';
    }
};
