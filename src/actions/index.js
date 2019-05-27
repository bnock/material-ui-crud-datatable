import axios from 'axios';
import { parseRequestError } from '../utilities/errorUtility';
import { SUCCESS_TYPE, ERROR_TYPE } from '../components/Snackbar';

export const PAGE_CHANGE = 'PAGE_CHANGE';
export const PER_PAGE_CHANGE = 'PER_PAGE_CHANGE';
export const SORT_CHANGE = 'SORT_CHANGE';
export const ITEMS_SUCCESS = 'ITEMS_SUCCESS';
export const SHOW_SNACKBAR = 'SHOW_SNACKBAR';
export const HIDE_SNACKBAR = 'HIDE_SNACKBAR';
export const SHOW_LOADING = 'SHOW_LOADING';
export const HIDE_LOADING = 'HIDE_LOADING';

export const pageChange = page => ({
    type: PAGE_CHANGE,
    payload: {
        page: page
    }
});

export const perPageChange = perPage => ({
    type: PER_PAGE_CHANGE,
    payload: {
        perPage: perPage
    }
});

export const sortChange = (column, direction) => ({
    type: SORT_CHANGE,
    payload: {
        column: column,
        direction: direction
    }
});

export const showSnackbar = (message, variant) => ({
    type: SHOW_SNACKBAR,
    payload: {
        message: message,
        variant: variant
    }
});

export const hideSnackbar = () => ({
    type: HIDE_SNACKBAR
});

export const showLoading = (title, message) => ({
    type: SHOW_LOADING,
    payload: {
        title: title,
        message: message
    }
});

export const hideLoading = () => ({
    type: HIDE_LOADING
});

export const fetchItems = (endpoint) => {
    return async (dispatch, getState) => {
        dispatch(showLoading('Loading Records', 'Loading records. Please wait.'));

        try {
            const response = await axios.get(
                `${endpoint}/${getState().page}/${getState().perPage}/${getState().column}/${getState().direction}`);
            dispatch(itemsSuccess(response.data.data, response.data.totalCount));

        } catch (e) {
            dispatch(showSnackbar(parseRequestError(e), ERROR_TYPE));

        } finally {
            dispatch(hideLoading());
        }
    }
};

const itemsSuccess = (items, totalCount) => ({
    type: ITEMS_SUCCESS,
    payload: {
        items: items,
        totalCount: totalCount
    }
});
