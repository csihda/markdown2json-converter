import React, { useState } from "react";
import { TextField, Button } from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import { Divider } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        color: 'rgba(82, 94, 103, 1)',
        fontSize: theme.typography.pxToRem(25),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));

const MarkdownInput = ({ setTitle, setDescList, setSchema, convertDisabled, setConvertDisabled, setDownloadDisabled, setMarkdownData, handleConvertPressed, downloadDisabled }) => {
    const classes = useStyles();

    const handleChangeMarkdownData = (event) => {
        const value = event.target.value;
        if (value !== "" & value !== undefined & value !== null) {
            setConvertDisabled(false);
            setMarkdownData(value);
        } else {
            setConvertDisabled(true);
            setDownloadDisabled(true);
            setSchema();
            setDescList();
        }
    }

    const handleOnBlurMarkdownTitle = (event) => {
        setTitle(event.target.value.trim())
    }

    return (<div style={{ padding: "10px", width: "33%" }}>
        <div style={{ textAlign: "center" }}>
            <Typography className={classes.heading}>Markdown Input</Typography>
        </div>
        <Divider />
        <div>
            <TextField onBlur={event => handleOnBlurMarkdownTitle(event)} fullWidth margin="normal" label="Markdown Title" variant="outlined" />
        </div>
        <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            <TextField
                onChange={(event) => handleChangeMarkdownData(event)}
                margin="normal"
                variant="filled"
                style={{ width: "1500px" }}
                label="Markdown Data"
                multiline
                minRows={34}
                maxRows={34}
            />
        </div>
        <div style={{ paddingTop: "10px", display: "flex", justifyContent: "right" }}>
            <Button
                disabled={convertDisabled}
                variant="contained"
                color="primary"
                onClick={(event) => handleConvertPressed(event)}
            >
                Convert
            </Button>
        </div>
    </div>);
}

export default MarkdownInput;