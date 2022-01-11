import React, { useEffect, useState } from "react";
import Typography from '@material-ui/core/Typography';
import { TextField, Button } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import FormRenderer from './FormRenderer';
import object2array from './utils/object2array'
import { FormContext } from "../FormContext";
import CryptoJS from "crypto-js";

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

const JsonResult = ({ downloadDisabled, schema, convertDisabled }) => {
    const classes = useStyles();
    const [selectedDisplay, setSelectedDisplay] = useState("JSON Schema");
    const [convertedSchema, setConvertedSchema] = useState();
    const [value, setValue] = useState(JSON.stringify(schema, undefined, 2));
    const [displayOptionDisabled, setDisplayOptionDisabled] = useState(true);
    useEffect(() => {
        if (schema !== undefined) {
            let convSchema = JSON.parse(JSON.stringify(schema));
            convSchema["properties"] = object2array(schema["properties"]);
            setConvertedSchema(convSchema);
            setDisplayOptionDisabled(false);
            setValue(JSON.stringify(schema, undefined, 2));
        }
        if (convertDisabled) {
            setSelectedDisplay("JSON Schema")
            setDisplayOptionDisabled(true)
            setValue("")
        }
    }, [schema, convertDisabled])

    const displayOption = ["JSON Schema", "Rendered Form"]

    const handleSelectDisplay = (event) => {
        setSelectedDisplay(event.target.value)
    }


    const handleDownloadJsonSchema = () => {
        let content = { ...schema };

        // calculate hash for the content
        // calculate hash using CryptoJS
        let sha256_hash = CryptoJS.SHA256(JSON.stringify(content));

        let a = document.createElement("a");
        let file = new Blob([JSON.stringify(content)], {
            type: "application/json",
        });
        a.href = URL.createObjectURL(file);
        a.download = `jsonschema-${sha256_hash}.json`;
        a.click();
    };

    return (
        <>
            <FormContext.Provider
                value={{
                    convertedSchema,
                }}>
                <div style={{ padding: "10px", width: "33%" }}>
                    <div style={{ textAlign: "center" }}>
                        <Typography className={classes.heading}>JSON Schema</Typography>
                    </div>
                    <Divider />
                    <div>
                        <TextField
                            disabled={displayOptionDisabled}
                            variant="outlined"
                            margin="normal"
                            onChange={(event) => handleSelectDisplay(event)}
                            value={selectedDisplay}
                            fullWidth
                            select
                            id={"select-display"}
                            label={"Display Options"}
                            SelectProps={{ native: true }}
                        >
                            {displayOption.map((content, index) => (
                                <option key={index} value={content}>
                                    {content}
                                </option>
                            ))}
                        </TextField>
                        {selectedDisplay === "JSON Schema" ?
                            <TextField
                                disabled
                                margin="normal"
                                variant="filled"
                                fullWidth
                                value={value}
                                multiline
                                minRows={34}
                                maxRows={34}
                            />
                            :
                            <div style={{ height: "725px", overflowY: "auto" }}>
                                <FormRenderer
                                    schema={convertedSchema}
                                    edit={false} />
                            </div>
                        }

                    </div>
                    <div style={{ paddingTop: "10px", display: "flex", justifyContent: "right" }}>
                        <Button
                            onClick={(event) => handleDownloadJsonSchema(event)}
                            disabled={downloadDisabled}
                            variant="outlined"
                        >
                            Download Schema
                        </Button>
                    </div>
                </div>
            </FormContext.Provider>
        </>);
}

export default JsonResult;