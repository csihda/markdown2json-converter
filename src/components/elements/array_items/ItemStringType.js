import React from 'react'
import TextField from "@material-ui/core/TextField"
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from '@material-ui/core';
import { Typography } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    root: {
        width: 'auto',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));



const ItemStringType = ({ dataInputItems, setDataInputItems, edit, index, field_id, handleDeleteArrayItem }) => {
    const classes = useStyles();

    // handle input field on blur
    const handleOnBlur = (event, index) => {
        let arr = dataInputItems;
        const items = Array.from(arr);
        items[index] = event.target.value;
        setDataInputItems(items);
    }


    return (
        <>
            {index !== undefined ? <div style={{ padding: "5px" }}>
                <Typography className={classes.heading}>Item #{index + 1}</Typography>
            </div> : null}
            <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                <TextField onBlur={(event) => handleOnBlur(event, index)} id={field_id} fullWidth={true} className={classes.heading} variant="outlined" />
                {edit ? <>
                    <IconButton onClick={() => handleDeleteArrayItem(index)} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><DeleteIcon fontSize="small" color="secondary" /></IconButton></> : null}
            </div>

        </>
    )

};

export default ItemStringType;
