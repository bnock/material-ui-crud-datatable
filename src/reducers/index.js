import { produce } from 'immer';
import {
    ITEMS_SUCCESS, PAGE_CHANGE, PER_PAGE_CHANGE, SORT_CHANGE, SHOW_LOADING, HIDE_LOADING, SHOW_SNACKBAR, HIDE_SNACKBAR
} from '../actions';

const initialState = {
    items: [],
    totalCount: 0,
    page: 1,
    perPage: 5,
    sort: {
        column: '',
        direction: 'asc'
    },
    loading: {
        title: null,
        message: null
    },
    snackbar: {
        variant: null,
        message: null
    }
};

export default (state = initialState, action) => produce(state, draft => {
    switch (action.type) {
        case ITEMS_SUCCESS:
            draft.items = action.payload.items;
            draft.totalCount = action.payload.totalCount;
            break;

        case PAGE_CHANGE:
            draft.page = action.payload.page;
            break;

        case PER_PAGE_CHANGE:
            draft.perPage = action.payload.perPage;
            break;

        case SORT_CHANGE:
            draft.sort.column = action.payload.column;
            draft.sort.direction = action.payload.direction;
            break;

        case SHOW_LOADING:
            draft.loading.title = action.payload.title;
            draft.loading.message = action.payload.message;
            break;

        case HIDE_LOADING:
            draft.loading.title = null;
            draft.loading.message = null;
            break;

        case SHOW_SNACKBAR:
            draft.snackbar.message = action.payload.message;
            draft.snackbar.variant = action.payload.variant;
            break;

        case HIDE_SNACKBAR:
            draft.snackbar.message = null;
            draft.snackbar.variant = null;
            break;
    }
});
