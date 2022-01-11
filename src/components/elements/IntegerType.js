import React, { useContext, useState } from 'react'
import TextField from "@material-ui/core/TextField";
import { makeStyles } from '@material-ui/core/styles';
import { FormContext } from '../../FormContext';
import deleteKey from '../utils/deleteKey';
import getUnit from '../utils/getUnit';
import { InputAdornment } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    root: {
        width: 'auto',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));

const style = {
    paddingTop: "10px",
    paddingBottom: "10px",
}


const IntegerType = ({ dataInputItems, setDataInputItems, withinArray, defaultValue, path, pathSchema, field_required, field_index, edit, field_id, field_label, field_description, field_enumerate }) => {

    const { updateParent, convertedSchema, handleDataInput, handleDataDelete } = useContext(FormContext);
    const [inputValue, setInputValue] = useState(defaultValue === undefined ? "" : defaultValue);

    const classes = useStyles();

    let unit = getUnit(field_label)

    var required
    if (field_required === undefined) {
        required = false;
    } else if (field_required.includes(field_id)) {
        required = true;
    };

    var enumerated
    if (field_enumerate === undefined) {
        enumerated = false;
    } else {
        enumerated = true;
    }

    // construct UI schema
    let UISchema = {
        "fieldId": field_id,
        "title": field_label,
        "description": field_description,
        "type": "integer"
    }

    // handle input on change for signed integer
    const handleInputOnChange = (event) => {
        let inputValueVar
        if (inputValue === undefined) {
            inputValueVar = ""
        } else {
            inputValueVar = inputValue
        }
        inputValueVar = inputValueVar.toString()
        if (event.target.value === ".") {
            return
        }
        if ((event.target.value.at(-1) === '.')) {
            let value = inputValueVar
            setInputValue(value.replace(/ /g, ''))
        } else {
            let value = event.target.value.replace(/(?!^-)[^0-9]/g, "")
            setInputValue(value.replace(/ /g, ''))
        }
    }

    // handle input on blur for signed integer
    const handleInputOnBlur = () => {

        if (withinArray !== undefined & withinArray) {

            let value = inputValue;
            value = parseInt(value)
            if (!isNaN(value)) {
                setInputValue(value)
                // store in jData
                let newPathSchema = pathSchema.split(".");
                newPathSchema.pop()
                newPathSchema = newPathSchema.join(".")

                let arr = dataInputItems;
                const items = Array.from(arr);
                items[field_index][field_id] = value;
                setDataInputItems(items);
            }
        } else {
            let value = inputValue;
            value = parseInt(value)
            if (!isNaN(value)) {
                setInputValue(value)
            }
        }
    }

    if (field_enumerate === undefined) {

        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    <TextField onBlur={() => handleInputOnBlur()} onChange={e => handleInputOnChange(e)} value={inputValue === undefined ? defaultValue : inputValue} required={required} helperText={field_description} fullWidth={true} className={classes.heading} id={field_id} label={field_label} variant="outlined" InputProps={{
                        endAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
                    }} />
                </div>
            </>
        )
    } else {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    <TextField
                        select
                        onBlur={() => handleInputOnBlur()}
                        onChange={e => handleInputOnChange(e)}
                        value={inputValue === undefined ? defaultValue : inputValue}
                        required={required}
                        helperText={field_description}
                        fullWidth={true}
                        className={classes.heading}
                        id={field_id}
                        label={field_label}
                        variant="outlined"
                        InputProps={{
                            endAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
                        }}
                        SelectProps={{
                            native: true,
                        }}>
                        {
                            field_enumerate.map((content, index) => (
                                <option key={index} value={content}>
                                    {content}
                                </option>
                            ))
                        }
                    </TextField>
                </div>
            </>
        )
    }
};

export default IntegerType;
