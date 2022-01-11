import React, { useContext, useState, useEffect } from 'react'
import { Checkbox, FormLabel, FormHelperText, FormControl } from '@material-ui/core';
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


const BooleanType = ({ path, pathSchema, field_required, field_index, edit, field_id, field_label, field_description, defaultValue }) => {
    //const [descriptionText, setDescriptionText] = useState(field_description);
    const [openDialog, setOpenDialog] = useState(false);
    const { convertedSchema } = useContext(FormContext);
    const [inputValue, setInputValue] = useState(typeof (defaultValue) === "boolean" ? defaultValue : false);
    //const [required, setRequired] = useState(false)
    const classes = useStyles();

    var required
    if (field_required === undefined) {
        required = false;
    } else if (field_required.includes(field_id)) {
        required = true;
    };

    // construct UI schema
    let UISchema = {
        "fieldId": field_id,
        "title": field_label,
        "description": field_description,
        "type": "boolean"
    }

    // handle input on change for checkbox (boolean type: checked is true unchecked is false)
    const handleInputOnChange = () => {
        let value = inputValue
        setInputValue(!value)
    }

    // if boolean field is newly created then store a false input data already to the form data
    useEffect(() => {
    }, [])


    return (
        <>
            <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', alignItems: "center", width: '100%' }}>
                <div style={{ paddingLeft: "15px", width: "100%" }}>
                    <FormControl >
                        <FormLabel>{field_label === undefined ? "" : field_label + ":"}</FormLabel>
                        <div style={{ textAlign: "center", width: "100%" }}>
                            <Checkbox onChange={() => handleInputOnChange()} checked={inputValue} />
                        </div>
                        <FormHelperText>{field_description}</FormHelperText>
                    </FormControl>
                </div>
            </div>
        </>
    )
};

export default BooleanType;
