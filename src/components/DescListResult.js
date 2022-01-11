import React, { useState, useEffect } from "react";
import Typography from '@material-ui/core/Typography';
import { TextField, Button } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
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


const DescListResult = ({ downloadDisabled, descListData, convertDisabled }) => {
    const classes = useStyles();
    const [selectedDisplay, setSelectedDisplay] = useState("Source")
    const [value, setValue] = useState(descListData);
    const [displayOptionDisabled, setDisplayOptionDisabled] = useState(true);
    useEffect(() => {
        if (descListData !== undefined) {
            setDisplayOptionDisabled(false);
            setValue(descListData);
        }
        if (convertDisabled) {
            setSelectedDisplay("Source")
            setDisplayOptionDisabled(true)
            setValue("")
        }
    }, [descListData, convertDisabled])

    const displayOption = ["Source", "eLabFTW rendered template"]

    const handleSelectDisplay = (event) => {
        setSelectedDisplay(event.target.value)
    }

    const handleDownloadTPLFile = () => {
        let content = { ...descListData };

        // calculate hash for the content
        // calculate hash using CryptoJS
        let sha256_hash = CryptoJS.SHA256(JSON.stringify(content));

        let a = document.createElement("a");
        let file = new Blob([value]);
        a.href = URL.createObjectURL(file);
        a.download = `tplfile-${sha256_hash}.tpl`;
        a.click();
    };

    return (<div style={{ padding: "10px", width: "33%" }}>
        <div style={{ textAlign: "center" }}>
            <Typography className={classes.heading}>HTML Description List</Typography>
        </div>
        <Divider />
        <div>
            <TextField
                disabled={displayOptionDisabled}
                variant="outlined"
                margin="normal"
                onChange={(event) => handleSelectDisplay(event)}
                fullWidth
                value={selectedDisplay}
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
            {selectedDisplay === "Source" ?
                <TextField
                    disabled
                    margin="normal"
                    variant="filled"
                    fullWidth
                    value={value}
                    multiline
                    minRows={23}
                    maxRows={23}
                />
                :
                <div style={{ height: "498px", overflowY: "auto" }}>
                    <div dangerouslySetInnerHTML={{ __html: value }}></div>
                </div>
            }
        </div>
        <div style={{ paddingTop: "10px", display: "flex", justifyContent: "right" }}>
            <Button
                disabled={downloadDisabled}
                onClick={() => handleDownloadTPLFile()}
                variant="outlined"
            >
                Download .tpl file
            </Button>
        </div>
    </div>);
}

export default DescListResult;