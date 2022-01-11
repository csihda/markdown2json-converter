import React, { useContext, useState } from "react";
//import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ElementRenderer from "./ElementRenderer";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from "@material-ui/icons/AddBox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FormContext } from '../FormContext';
import DragHandleIcon from "@material-ui/icons/DragIndicator";
import RevertIvon from "@material-ui/icons/History";
import AddElement from "./AddElement";
import EditSchemaHeader from "./EditSchemaHeader";

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

const FormRenderer = ({ revertAllChanges, schema, edit }) => {
    const { updateParent, convertedSchema } = useContext(FormContext);
    const [openDialogAddElement, setOpenDialogAddElement] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    console.log(schema)

    const classes = useStyles();

    // deconstruct
    const { properties, title, description, required, $schema, id } = schema ?? {}

    /*
    console.log("converted:", convertedSchema)
    let deconvertedSchema = JSON.parse(JSON.stringify(convertedSchema))
    deconvertedSchema["properties"] = array2object(convertedSchema["properties"])
    console.log("deconverted:", deconvertedSchema)
    */

    // default schema for add new element
    let defaultSchema = {}

    return (<>
        <div style={{ width: "100%", paddingLeft: "0px", paddingRight: "0px" }}>
            <div style={{ paddingTop: "0px", paddingBottom: "10px", display: 'inline-flex', width: '100%' }}>
                <Typography className={classes.heading} style={{ width: "100%" }}>{title}</Typography>
                {edit ? <> <Button onClick={() => setOpenDialog(true)} style={{ marginLeft: "5px" }}> <EditIcon color="primary" /></Button> <Button onClick={() => revertAllChanges()} style={{ marginLeft: "5px" }}> <RevertIvon color="primary" /></Button>  </> : null}
            </div>
            <Divider />
            <Typography>{description}</Typography>
            {Object.keys(properties).map((item, index) => {
                return (
                    <div key={item} style={{ display: "flex" }}>
                        <ElementRenderer schema={schema} path={"properties"} fieldId={properties[item]["fieldId"]} fieldIndex={item} elementRequired={required} edit={edit} field={properties[item]} />
                    </div>
                );
            })}
        </div>
    </>);
};

export default FormRenderer;