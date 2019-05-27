import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MuiSnackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';

export const SUCCESS_TYPE = 'SUCCESS_TYPE';
export const ERROR_TYPE = 'ERROR_TYPE';

const styles = (theme) => ({
    message: {
        display: 'flex',
        alignItems: 'center'
    },
    messageIcon: {
        marginRight: theme.spacing(1)
    },
    error: {
        backgroundColor: theme.palette.error.dark
    },
    success: {
        backgroundColor: green[600]
    }
});

class Snackbar extends Component {
    static propTypes = {
        type: PropTypes.oneOf([SUCCESS_TYPE, ERROR_TYPE]).isRequired,
        message: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
        onClose: PropTypes.func.isRequired
    };

    render() {
        const { classes, message, onClose, type } = this.props;

        return (
            <MuiSnackbar
                open={true}
                autoHideDuration={10000}
                onClose={() => onClose()}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'top'
                }}
            >
                <SnackbarContent
                    className={type === ERROR_TYPE ? classes.error : classes.success}
                    message={
                        <span className={classes.message}>
                            {type === ERROR_TYPE ? (
                                <ErrorIcon className={classes.messageIcon} />
                            ) : (
                                <CheckCircleIcon className={classes.messageIcon} />
                            )}
                            {Array.isArray(message) ? (
                                <ul>
                                    {message.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span>{message}</span>
                            )}
                        </span>
                    }
                    action={
                        <IconButton
                            color="inherit"
                            onClick={() => onClose()}
                        >
                            <CloseIcon />
                        </IconButton>
                    }
                />
            </MuiSnackbar>
        )
    }
}

export default withStyles(styles, { withTheme: true })(Snackbar);
