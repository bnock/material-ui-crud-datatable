import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CrudDatatableComponent from '../components/CrudDatatable';
import {
    fetchItems, hideLoading, hideSnackbar, pageChange, perPageChange, showLoading, showSnackbar, sortChange
} from '../actions';

const mapStateToProps = state => ({
    items: state.items,
    totalCount: state.totalCount,
    page: state.page,
    perPage: state.perPage,
    sortColumn: state.sort.column,
    sortDirection: state.sort.direction,
    loading: state.loading,
    snackbar: state.snackbar
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchItems: () => dispatch(fetchItems(ownProps.dataEndpoint)),
    pageChange: page => dispatch(pageChange(page)),
    perPageChange: perPage => dispatch(perPageChange(perPage)),
    sortChange: (column, direction) => dispatch(sortChange(column, direction)),
    showLoading: (title, message) => dispatch(showLoading(title, message)),
    hideLoading: () => dispatch(hideLoading()),
    showSnackbar: (message, variant) => dispatch(showSnackbar(message, variant)),
    hideSnackbar: () => dispatch(hideSnackbar())
});

class CrudDatatable extends Component {
    static propTypes = {
        dataEndpoint: PropTypes.string.isRequired
    };

    render() {
        return <CrudDatatableComponent {...this.props} />;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CrudDatatable);
