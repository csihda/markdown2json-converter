import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Accordion from "@material-ui/core/Accordion";
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import AddIcon from "@material-ui/icons/AddBox";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrayItemRenderer from "./ArrayItemRenderer";
import generateUniqueID from "../utils/generateUniqueID";
import { IconButton } from "@material-ui/core";

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

const ArrayType = ({ pathSchema, path, field_required, field_id, field_label, field_description, field_items }) => {
    const [expand, setExpand] = useState(true);
    const [inputItems, setInputItems] = useState([]);
    const [dataInputItems, setDataInputItems] = useState([]);

    // This is to expand or contract the accordion, because normally open is used 
    const expandOnChange = () => {
        const value = expand
        setExpand(!value)
    };


    var required;
    if (field_required === undefined) {
        required = false;
    } else if (field_required.includes(field_id)) {
        required = true;
    };

    const classes = useStyles();

    // handle add array item
    const handleAddArrayItem = () => {
        let field_items = { type: "string", field_id: `${generateUniqueID()}` }
        let arr = inputItems;
        const items = Array.from(arr);
        items.push(field_items);
        setInputItems(items);
    }

    // handle delete item
    const handleDeleteArrayItem = (index) => {
        // for schema
        let arr = inputItems
        const items = Array.from(arr);
        items.splice(index, 1);
        setInputItems(items)

        // for data
        let arr2 = dataInputItems;
        const items2 = Array.from(arr2);
        items2.splice(index, 1);
        setDataInputItems(items2)
    }

    return (<>
        <div style={{ width: "100%", padding: "10px 0px 10px 0px" }}>
            <Accordion expanded={expand} >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    IconButtonProps={{
                        onClick: expandOnChange
                    }}
                >
                    <div style={{ paddingTop: "10px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                        <div style={{ width: "100%" }}>
                            <Typography className={classes.heading}>{field_label + (required ? "*" : "")}</Typography>
                            {expand ? <div style={{ color: "gray" }}>
                                {field_description}
                            </div> : null}
                        </div>
                    </div>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    <div style={{ width: "100%" }}>
                        {Object.keys(inputItems).map((item, index) => {
                            return (
                                <div key={item}>
                                    <ArrayItemRenderer pathSchema={pathSchema} dataInputItems={dataInputItems} setDataInputItems={setDataInputItems} field_label={field_label} field_items={field_items} edit={true} handleDeleteArrayItem={handleDeleteArrayItem} path={path + ".properties"} fieldIndex={index} fieldId={inputItems[index]["field_id"]} type={inputItems[index]["type"]} />
                                </div>
                            );
                        })}
                        <div style={{ display: "flex", justifyContent: "right" }}>
                            <IconButton onClick={() => { handleAddArrayItem() }} style={{ marginLeft: "5px", marginTop: "5px", height: "45px" }}><AddIcon fontSize="small" color="primary" /></IconButton>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    </>
    );
};

export default ArrayType;