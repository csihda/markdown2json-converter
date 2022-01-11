import React, { useContext, useEffect, useState } from 'react'
import TextField from "@material-ui/core/TextField"
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from '@material-ui/core';
import EditElement from '../EditElement';
import { FormContext } from '../../FormContext';
import deleteKey from '../utils/deleteKey';


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


const StringType = ({ dataInputItems, setDataInputItems, withinArray, path, pathSchema, field_required, field_index, edit, field_id, field_label, field_description, field_enumerate, defaultValue }) => {
    //const [descriptionText, setDescriptionText] = useState(field_description);
    const [openDialog, setOpenDialog] = useState(false);
    const { convertedSchema } = useContext(FormContext);
    //const [required, setRequired] = useState(false)
    const classes = useStyles();

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
        "type": "string"
    }


    // handle on blur
    const handleOnBlur = (event, pathSchema, type) => {
        if (withinArray !== undefined & withinArray) {
            let newPathSchema = pathSchema.split(".");
            newPathSchema.pop()
            newPathSchema = newPathSchema.join(".")

            let arr = dataInputItems;
            const items = Array.from(arr);
            items[field_index][field_id] = event.target.value;
            setDataInputItems(items);

            // store to the main form data
            let value = {
                "target": {
                    "value":
                        items
                }
            }
        }
    }


    // if enumerate and no defaultValue then already store the first enumerate value to form data
    // this is for any enumerate in a subschema (e.g., in anyOf), for the rest of enumerate is taken care of in AdamantMain.jsx
    useEffect(() => {
        if (field_enumerate !== undefined & withinArray !== undefined & withinArray === true) {
            let newPathSchema = pathSchema.split(".");
            newPathSchema.pop()
            newPathSchema = newPathSchema.join(".")
            let arr = dataInputItems;
            const items = Array.from(arr);
            items[field_index][field_id] = field_enumerate[0];
            setDataInputItems(items);

            // store to the main form data
            let event = {
                "target": {
                    "value":
                        items
                }
            }
        }
    }, [])

    if (field_enumerate === undefined) {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    <TextField onBlur={(event) => handleOnBlur(event, pathSchema, "string")} required={required} helperText={field_description} defaultValue={defaultValue} fullWidth={true} className={classes.heading} id={field_id} label={field_label} variant="outlined" />
                </div>
            </>
        )
    } else {
        return (
            <>
                <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                    < TextField
                        onBlur={(event) => handleOnBlur(event, pathSchema, "string")}
                        required={required}
                        select
                        fullWidth={true}
                        className={classes.heading}
                        id={field_id}
                        label={field_label}
                        variant="outlined"
                        SelectProps={{
                            native: true,
                        }
                        }
                        helperText={field_description}
                        defaultValue={defaultValue}
                    >
                        {
                            field_enumerate.map((content, index) => (
                                <option key={index} value={content}>
                                    {content}
                                </option>
                            ))
                        }
                    </TextField >
                </div >
            </>
        )
    }
};

export default StringType;
