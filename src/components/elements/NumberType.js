import React, { useState } from 'react'
import TextField from "@material-ui/core/TextField";
import { makeStyles } from '@material-ui/core/styles';
import { InputAdornment } from '@material-ui/core';
import getUnit from '../utils/getUnit';


const useStyles = makeStyles((theme) => ({
    root: {
        width: 'auto',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));


const NumberType = ({ dataInputItems, setDataInputItems, withinArray, pathSchema, defaultValue, field_required, field_index, field_id, field_label, field_description, field_enumerate }) => {

    const [inputValue, setInputValue] = useState(defaultValue === undefined ? "" : defaultValue)

    const classes = useStyles();

    let unit = getUnit(field_label)

    var required
    if (field_required === undefined) {
        required = false;
    } else if (field_required.includes(field_id)) {
        required = true;
    };

    /*
    var enumerated
    if (field_enumerate === undefined) {
        enumerated = false;
    } else {
        enumerated = true;
    }
    */

    // handle input on change for number a.k.a signed float
    const handleInputOnChange = (event) => {
        let inputValueVar
        if (inputValue === undefined) {
            inputValueVar = ""
        } else {
            inputValueVar = inputValue
        }
        inputValueVar = inputValueVar.toString()
        if (((inputValueVar.split('.').length - 1) > 1) & (event.target.value.at(-1) === '.')) {
            let value = inputValueVar
            setInputValue(value.replace(/ /g, ''))
        } else {
            let value = event.target.value.replace(/(?!^-)[^0-9.]/g, "").replace(/(\..*)\./g, '$1')
            setInputValue(value.replace(/ /g, ''))
        }
    }

    // handle input on blur for signed integer
    const handleInputOnBlur = () => {

        if (withinArray !== undefined & withinArray) {

            let value = inputValue;
            value = parseFloat(value)
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
            value = parseFloat(value)
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

export default NumberType;
