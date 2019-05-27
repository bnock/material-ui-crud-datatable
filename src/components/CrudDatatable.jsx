import React, { Component } from 'react';
import get from 'lodash/get';
import set from 'lodash/set';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import EditorDialog from '@bnock/material-ui-editor-dialog';
import LoadingDialog from '../LoadingDialog';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import Snackbar, { SUCCESS_TYPE, ERROR_TYPE } from '../Snackbar';
import FilterBar from './FilterBar';
import CarrierFilter from '../../containers/datatable/filters/CarrierFilter';
import StatusFilter from './filters/StatusFilter';
import StateFilter from '../../containers/datatable/filters/StateFilter';
import TextFilter from './filters/TextFilter';

export const ORDER_ASC = 'asc';
export const ORDER_DESC = 'desc';
export const STATUS_FILTER_TYPE = 'STATUS_FILTER_TYPE';
export const STATE_FILTER_TYPE = 'STATE_FILTER_TYPE';
export const CARRIER_FILTER_TYPE = 'CARRIER_FILTER_TYPE';
export const TEXT_FILTER_TYPE = 'TEXT_FILTER_TYPE';

const DELETE_OPERATION = 'DELETE_OPERATION';
const CREATE_OPERATION = 'CREATE_OPERATION';
const EDIT_OPERATION = 'EDIT_OPERATION';

const styles = {
    editButton: {
        color: blue['A700']
    },
    deleteButton: {
        color: red['A700']
    },
    addButton: {
        color: green['700']
    }
};

class CrudDataTable extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        columns: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            sortable: PropTypes.bool.isRequired,
            sortKey: PropTypes.string,
            renderCallback: PropTypes.func
        })).isRequired,
        filterConfig: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.oneOf([STATUS_FILTER_TYPE, STATE_FILTER_TYPE, CARRIER_FILTER_TYPE,
                TEXT_FILTER_TYPE]).isRequired,
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
        })),
        editorConfig: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.oneOf([TEXT_TYPE, TEXT_AREA_TYPE, RICH_TEXT_AREA_TYPE, NUMBER_TYPE, PASSWORD_TYPE,
                EMAIL_TYPE, CURRENCY_TYPE, PERCENT_TYPE, TOGGLE_TYPE, SELECT_TYPE, DATE_TYPE]).isRequired,
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            required: PropTypes.bool.isRequired,
            selectOptions: PropTypes.arrayOf(PropTypes.shape({
                key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
                label: PropTypes.string.isRequired
            }))
        })).isRequired,
        modelName: PropTypes.string.isRequired,
        defaultSortColumn: PropTypes.string.isRequired,
        dataEndpoint: PropTypes.string.isRequired,
        modelEndpoint: PropTypes.string.isRequired,
        createEndpoint: PropTypes.string.isRequired,
        updateEndpoint: PropTypes.string.isRequired,
        deleteEndpoint: PropTypes.string.isRequired,
        disableAdd: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.state = {
            items: [],
            totalCount: 0,
            page: 0,
            perPage: 25,
            sortColumn: props.defaultSortColumn,
            sortDirection: ORDER_ASC,
            additionalFilters: Boolean(props.filterConfig) ? props.filterConfig.map(config => config.value) : [],
            isLoading: false,
            error: null,
            success: null,
            model: null,
            operationType: null
        };
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchItems();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { page, perPage, sortColumn, sortDirection, additionalFilters } = this.state;

        if (page !== prevState.page || perPage !== prevState.perPage || sortColumn !== prevState.sortColumn ||
            sortDirection !== prevState.sortDirection || !isEqual(additionalFilters, prevState.additionalFilters)) {
            // noinspection JSIgnoredPromiseFromCall
            this.fetchItems();
        }
    }

    fetchItems = async () => {
        const { dataEndpoint } = this.props;
        const { page, perPage, sortColumn, sortDirection, additionalFilters } = this.state;

        const url = `${dataEndpoint}/${page}/${perPage}/${sortColumn}/${sortDirection}` +
            (Boolean(additionalFilters) ? '/' + additionalFilters.join('/') : '');

        this.setState({
            isLoading: true
        });

        try {
            const response = await axios.get(url);
            this.setState({
                items: response.data.data,
                totalCount: response.data.meta.total
            });

        } catch (error) {
            this.setState({
                error: parseRequestError(error)
            });

        } finally {
            this.setState({
                isLoading: false
            });
        }
    };

    onSort = columnKey => {
        this.setState(state => ({
            sortColumn: columnKey,
            sortDirection: state.sortColumn === columnKey ? (state.sortDirection === ORDER_ASC ? ORDER_DESC : ORDER_ASC)
                : ORDER_ASC
        }));
    };

    onFilterChange = (index, value) => {
        this.setState(state => {
            const additionalFilters = Array.from(state.additionalFilters);
            additionalFilters[index] = value;

            return {
                additionalFilters: additionalFilters
            }
        });
    };

    initiateCreation = () => {
        const { editorConfig } = this.props;

        let model = {};

        for (let config of editorConfig) {
            let value;

            switch (config.type) {
                case TEXT_TYPE:
                case TEXT_AREA_TYPE:
                case PASSWORD_TYPE:
                case EMAIL_TYPE:
                    value = '';
                    break;

                case NUMBER_TYPE:
                case CURRENCY_TYPE:
                case PERCENT_TYPE:
                case SELECT_TYPE:
                    value = 0;
                    break;

                case TOGGLE_TYPE:
                    value = false;
                    break;

                case DATE_TYPE:
                    value = moment().format('YYYY-MM-DD');
                    break;
            }

            set(model, config.key, value);
        }

        this.setState({
            model: model,
            operationType: CREATE_OPERATION
        });
    };

    fetchModel = async id => {
        const { modelEndpoint } = this.props;

        this.setState({
            isLoading: true
        });

        try {
            const response = await axios.get(`${modelEndpoint}/${id}`);
            this.setState({
                model: response.data
            });

        } catch (error) {
            this.setState({
                error: parseRequestError(error)
            });

        } finally {
            this.setState({
                isLoading: false
            });
        }
    };

    initiateEdit = async id => {
        await this.fetchModel(id);
        this.setState({
            operationType: EDIT_OPERATION
        });
    };

    initiateDeletion = async id => {
        await this.fetchModel(id);
        this.setState({
            operationType: DELETE_OPERATION
        });
    };

    submit = async (operationType) => {
        const { createEndpoint, updateEndpoint, deleteEndpoint, modelName } = this.props;
        const { model } = this.state;

        this.setState({
            isLoading: true
        });

        try {
            switch (operationType) {
                case CREATE_OPERATION:
                    await axios.post(createEndpoint, model);
                    this.setState({
                        success: 'Successfully created ' + modelName
                    });
                    break;

                case EDIT_OPERATION:
                    await axios.put(`${updateEndpoint}/${model.id}`, model);
                    this.setState({
                        success: 'Successfully updated ' + modelName
                    });
                    break;

                case DELETE_OPERATION:
                    await axios.delete(`${deleteEndpoint}/${model.id}`);
                    this.setState({
                        success: 'Successfully deleted ' + modelName
                    });
                    break;
            }

            await this.fetchItems();

            this.setState({
                model: null,
                operationType: null
            });

        } catch (error) {
            this.setState({
                error: parseRequestError(error)
            });

        } finally {
            this.setState({
                isLoading: false
            });
        }
    };

    setModelAttribute = (key, value) => {
        this.setState((state) => {
            const model = Object.assign({}, state.model);

            set(model, key, value);

            return {
                model: model
            };
        });
    };

    render() {
        const { classes, columns, modelName, editorConfig, filterConfig, disableAdd } = this.props;
        const {
            items, totalCount, page, perPage, sortColumn, sortDirection, additionalFilters, isLoading, model,
            operationType, error, success
        } = this.state;

        return (
            <div>
                {(success !== null || error !== null) && (
                    <Snackbar
                        type={success !== null ? SUCCESS_TYPE : ERROR_TYPE}
                        message={success !== null ? success : error}
                        onClose={() => this.setState({
                            error: null,
                            success: null
                        })}
                    />
                )}

                {isLoading && (
                    <LoadingDialog
                        title="Loading"
                        message="Loading. Please wait."
                    />
                )}

                {model !== null && operationType === DELETE_OPERATION && (
                    <DeleteConfirmationDialog
                        onConfirm={() => this.submit(operationType)}
                        onCancel={() => this.setState({
                            operationType: null,
                            model: null
                        })}
                        title="Delete Confirmation"
                        message={'Are you sure you want to delete this ' + modelName + '?  This action cannot be undone.'}
                    />
                )}

                {model !== null && (operationType === CREATE_OPERATION || operationType === EDIT_OPERATION) && (
                    <EditorDialog
                        formConfig={editorConfig}
                        isNew={operationType === CREATE_OPERATION}
                        setter={(key, value) => this.setModelAttribute(key, value)}
                        model={model}
                        modelName={modelName}
                        onSave={() => this.submit(operationType)}
                        onCancel={() => this.setState({
                            operationType: null,
                            model: null
                        })}
                    />
                )}

                <Grid container>
                    <Grid item xs>
                        <Grid container>
                            {!Boolean(disableAdd) && (
                                <Grid item xs>
                                    <Button className={classes.addButton} onClick={() => this.initiateCreation()}>
                                        <AddCircleIcon /> Create {modelName}
                                    </Button>
                                </Grid>
                            )}
                            <Grid item xs>
                                {Boolean(filterConfig) && filterConfig.length > 0 && (
                                    <FilterBar>
                                        {filterConfig.map((config, index) => {
                                            switch (config.type) {
                                                case CARRIER_FILTER_TYPE:
                                                    return (
                                                        <CarrierFilter
                                                            key={index}
                                                            selectedCarrierId={additionalFilters[index]}
                                                            onCarrierChange={value => this.onFilterChange(index, value)}
                                                        />
                                                    );

                                                case STATUS_FILTER_TYPE:
                                                    return (
                                                        <StatusFilter
                                                            key={index}
                                                            selectedStatus={additionalFilters[index]}
                                                            onStatusChange={value => this.onFilterChange(index, value)}
                                                        />
                                                    );

                                                case STATE_FILTER_TYPE:
                                                    return (
                                                        <StateFilter
                                                            key={index}
                                                            selectedState={additionalFilters[index]}
                                                            onStateChange={value => this.onFilterChange(index, value)}
                                                        />
                                                    );

                                                case TEXT_FILTER_TYPE:
                                                    return (
                                                        <TextFilter
                                                            key={index}
                                                            filterText={additionalFilters[index]}
                                                            onChange={value => this.onFilterChange(index, value)}
                                                        />
                                                    );
                                            }
                                        })}
                                    </FilterBar>
                                )}
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item xs>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {columns.map(column => {
                                                return (
                                                    <TableCell
                                                        key={column.key}
                                                        sortDirection={sortColumn === (Boolean(column.sortKey) ? column.sortKey : column.key) ? sortDirection : false}
                                                    >
                                                        {column.sortable ? (
                                                            <TableSortLabel
                                                                active={sortColumn === (Boolean(column.sortKey) ? column.sortKey : column.key)}
                                                                direction={sortDirection}
                                                                onClick={() => this.onSort(Boolean(column.sortKey) ? column.sortKey : column.key)}
                                                            >
                                                                {column.label}
                                                            </TableSortLabel>
                                                        ) : column.label}
                                                    </TableCell>
                                                )
                                            }, this)}
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.length > 0 ?
                                            items.map(item => {
                                                    return (
                                                        <TableRow
                                                            key={item.id}
                                                        >
                                                            {columns.map(column => {
                                                                return (
                                                                    <TableCell
                                                                        key={item.id + column.key}
                                                                    >
                                                                        {column.renderCallback ? column.renderCallback(get(item, column.key)) :
                                                                            get(item, column.key)}
                                                                    </TableCell>
                                                                )
                                                            })}
                                                            <TableCell>
                                                                <Tooltip title="Edit record">
                                                                    <IconButton
                                                                        className={classes.editButton}
                                                                        onClick={() => this.initiateEdit(item.id)}
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete record">
                                                                    <IconButton
                                                                        className={classes.deleteButton}
                                                                        onClick={() => this.initiateDeletion(item.id)}
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                }
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length + 1}>No records found</TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                count={totalCount}
                                                onChangePage={(e, page) => this.setState({page: page})}
                                                onChangeRowsPerPage={(e) => this.setState({perPage: e.target.value})}
                                                page={page}
                                                rowsPerPage={perPage}
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(CrudDataTable);
