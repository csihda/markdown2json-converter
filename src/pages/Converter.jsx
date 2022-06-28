import React, { useState } from "react";
import MarkdownInput from "../components/MarkdownInput";
import JsonResult from "../components/JsonResult";
import DescListResult from "../components/DescListResult";
import { Button } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
//import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

// remove keys that have value null or ""
const removeEmpty = (obj) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && typeof val === "object" && removeEmpty(val)) ||
      ((val === null || val === "") && delete obj[key])
  );
  return obj;
};

const validateTable = (markdownData) => {
  const ID = 0; const KEY = 1; const TYPE = 5; const OCC = 6; const ALLOWED_VAL = 7
  let messages = [];
  let result = true;
  try {
    // here convert the markdown data to a valid json schema and pass it to JsonResult
    let markdownArrayRep = JSON.stringify(markdownData).replaceAll('"', "");
    markdownArrayRep = markdownArrayRep.split(/\r?\\n/);

    markdownArrayRep = removeEmpty(markdownArrayRep);

    for (let i =0;i<markdownArrayRep.length;i++){
      let row0 = markdownArrayRep[i];
      row0 = row0.split("|")
      const set = new Set(row0)
      let row = Array.from(set)

      // remove first and last elements
      row.shift();
      
      // trim the excess spaces after and before a text
      if (i === 0){
        row = row.map( element => element.toLowerCase());
        row = row.map( element => element.trim());
        const arr = [ "id", "key", "title", "unit", "description", "type", "occ", "allowed values" ]
        if (row.join(".") !== arr.join(".")){
          result = false;
          console.log("tatata")
          messages.push("Typo(s) found in the first row")
        }
      }
      else if (i === 1){
        console.log("Validation: skipping second row")
      }
      else {
        row = row.map( element => element.trim());

        // check first coloumn / ID
        if (row[ID].split(".").length > 2){
          result = false;
          messages.push(`Typo is found in "Id" of row no. ${i-1} : |${row[ID]}|`);
        }
        // check second coloumn / KEY
        if (row[KEY] === ""){
          result = false;
          messages.push(`"Key" must not be empty. Row no. ${i-1}`);
        }
        // check sixth coloumn / TYPE
        if (!["string", "number", "integer", "boolean",""].includes(row[TYPE].toLowerCase())){
          result = false;
          messages.push(`"Type" must be one of these types: "string", "number", "integer", or "boolean". Row no. ${i-1}: ${row[TYPE]}`);
        }
        // check seventh coloumn / OCC
        let minmax = row[OCC].split("-");
        const allPositiveIntegerRegex = /^\d+$/;
        if (row[OCC] === ""){
          result = false;
          messages.push(`"Occ" should not be empty. Row no. ${i-1}`)
        }
        else if (minmax.length > 1){
          if (!allPositiveIntegerRegex.test(minmax[0])){
            result = false;
            messages.push(`Typo is found in "Occ" of row no. ${i-1}: |${row[OCC]}|`);
          }
          if (!allPositiveIntegerRegex.test(minmax[1])){
            if (minmax[1] !== "n"){
              result = false;
              messages.push(`Typo is found in "Occ" of row no. ${i-1}: |${row[OCC]}|`);
            }
          } else if (minmax[1] === "0"){
            result = false;
            messages.push(`Max. part of "Occ" cannot be zero. Row no. ${i-1}: |${row[OCC]}|`);
          }
          // check if max is bigger than min
          if (allPositiveIntegerRegex.test(minmax[0]) && allPositiveIntegerRegex.test(minmax[1])){
            const min = parseInt(minmax[0]);
            const max = parseInt(minmax[1]);
            if (min > max){
              result = false;
              messages.push(`Min. value of "Occ" cannot be equal or bigger than the Max. value. Row no. ${i-1}: |${row[OCC]}|`)
            } 
          }
        }
        // check eight coloumn / ALLOWED_VAL
        // specific check for number and integer types
        if (row[TYPE].toLowerCase() === "number"){
          let values = row[ALLOWED_VAL].split(";");
          if (values !== ['']){
            try{
              values = values.map(value => parseFloat(value));
            } catch (error) {
              result = false;
              messages.push(`"Allowed values" must be numbers. Row no. ${i-1}: |${row[ALLOWED_VAL]}|`);
            }
          }
        }
        if (row[TYPE].toLowerCase() === "integer"){
          let values = row[ALLOWED_VAL].split(";");
          if (values !== ['']){
            let k = i-1;
            let integerResult = true;
            try {
              // first turn it to float
              values = values.map(value => parseFloat(value));
              for (let j = 0; j<values.length; j++){
                let value = values[j];
                if ( value % 1 !== 0) {
                  result = false;
                  integerResult = false;
                } else {
                  values[j] = parseInt(value);
                }
              }
              if (integerResult === false) {
                messages.push(`"Allowed values" must be integers. Row no. ${k}: |${row[ALLOWED_VAL]}|`);
              }
            }
            catch (error) {
              console.log(error);
              result = false;
              messages.push(`"Allowed values" must be integers. Row no. ${k}: |${row[ALLOWED_VAL]}|`);
            }
          }
        }
        if (row[TYPE].toLowerCase() === "" && row[ALLOWED_VAL] !== ""){
          result = false;
          messages.push(`bject or array type cannot have "Allowed values". Row no. ${i-1}: |${row[ALLOWED_VAL]}|`);
        }
      }
    }
    return [result, messages]
  } catch (error) {
    console.error(error);
    messages.push("The table is really wrong, the converter did not understand the table at all. Skipping this file.")
    return [result, messages]
  }
}

const createDescriptionList = (schema) => {
  let subSchemas = [];
  let arraySchemas = [];

  let mainSchema = JSON.parse(JSON.stringify(schema))
  let schemaProp = schema["properties"];

  Object.keys(schemaProp).forEach(key => {
    if (schemaProp[key]["type"] === "object"){
      subSchemas.push(schemaProp[key]);
      delete mainSchema["properties"][key];
    }
    if (schemaProp[key]["type"] === "array" && schemaProp[key]["items"]["type"] === "object"){
      arraySchemas.push(schemaProp[key]);
      delete mainSchema["properties"][key];
    }
  });

  let descriptionList = `<h1><strong>${mainSchema["title"]}</strong></h1>\n`;
  descriptionList += `<dl>\n`;
  // loop through first the main schema
  Object.keys(mainSchema["properties"]).forEach(key=>{
    descriptionList += `<dt>${mainSchema["properties"][key]["title"]}</dt>\n`;
    descriptionList += `<dd>${mainSchema["properties"][key]["description"]}</dd>\n`;
  });
  // loop through subschemas
  for (let i = 0; i<subSchemas.length;i++){
    let subschema = subSchemas[i];
    descriptionList += `<dt style="background-color: #ffffff; border: 0px; height: 10px;"></dt>\n`;
    descriptionList += `<dt style="background-color: #ffffff; border: 0px;"><a style="color: #000000;"><strong>${subschema["title"]}</strong></a></dt>\n`;
    Object.keys(subschema["properties"]).forEach(key => {
      descriptionList += `<dt>${subschema["properties"][key]["title"]}</dt>\n`;
      descriptionList += `<dd>${subschema["properties"][key]["description"]}</dd>\n`;
    })
  }
  descriptionList += "</dl>";
  for (let i = 0; i<arraySchemas.length;i++){
    let arrschema = arraySchemas[i];
    descriptionList +=`\n<div style="background-color: #ffffff; border: 0px;"><a style="color:#000000;"><strong>${arrschema["title"]}</strong></a></div>\n`;
    descriptionList +='<div>\n';
    descriptionList +='<table style="border-collapse: collapse;" border="1">\n';
    descriptionList +='<tbody>\n';
    descriptionList +='<tr>\n';
    descriptionList +='<td style="text-align: left;"><strong>No.</strong></td>\n';
    let arrProp = arrschema["items"]["properties"]
    Object.keys(arrProp).forEach(key => {
      descriptionList += `<td style="text-align: center;"><strong>${arrProp[key]["title"]}</strong></td>\n`;
    })
    descriptionList += `</tr>\n`;

    descriptionList +='<tr>\n';
    descriptionList +='<td style="text-align: left;">1</td>\n';

    Object.keys(arrProp).forEach(key => {
      descriptionList += `<td style="text-align: center;">${arrProp[key]["description"]}</td>\n`;
    })
    descriptionList += '</tr>\n';
    descriptionList += '</tbody>\n';
    descriptionList += '</table>\n';
    descriptionList += '</div>';
  }

  return descriptionList;

}

const Converter = () => {
  const [markdownData, setMarkdownData] = useState();
  const [schema, setSchema] = useState();
  const [descList, setDescList] = useState();
  const [convertDisabled, setConvertDisabled] = useState(true);
  const [title, setTitle] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [downloadDisabled, setDownloadDisabled] = useState(true);

  const handleConvertPressed = () => {
    if ((title === undefined) | (title === "")) {
      setTitle(undefined);
      setOpenDialog(true);
    } else {
      handleConvertPressedContinued();
    }
  };

  const handleConvertPressedContinued = () => {
    const ID = 0; const KEY = 1; const TITLE = 2; const UNIT = 3 ; const DESCRIPTION = 4; const TYPE = 5; const OCC = 6; const ALLOWED_VAL = 7;
    // close dialog
    setOpenDialog(false);

    // validate markdownData or markdown table
    const [result, messages] = validateTable(markdownData)
    if (!result) {
      let alertMessages = "Error(s) found:\n";
      messages.forEach(message => alertMessages+=">>> "+message+"\n");
      alert(alertMessages)
      console.log(">>> markdown table is not valid. Conversion did not happen")
      return null;
    } else {
      console.log(">>> markdown table is valid. Continue to conversion")
    }

    // here convert the markdown data to a valid json schema and pass it to JsonResult
    let markdownArrayRep = JSON.stringify(markdownData).replaceAll('"', "");
    markdownArrayRep = markdownArrayRep.split(/\r?\\n/);

    // create initial schema
    let schema = {};
    schema["$schema"] = "http://json-schema.org/draft-04/schema#";
    schema["id"] = "some schema id";
    schema["title"] = "some schema title";
    schema["description"] = "some schema description";
    schema["type"] = "object";
    schema["properties"] = {};
    schema["required"] = [];

    // go through markdown_array_rep, and create schema property for each element
    // but first and second get rid of the first row
    markdownArrayRep.shift();
    markdownArrayRep.shift();
    // get rid of empty element
    markdownArrayRep = removeEmpty(markdownArrayRep);

    let i = 1;
    let currentSubschemaIdx = 0;
    let currentRowType = "";

    markdownArrayRep.forEach(row => {
      // convert string to array
      row = row.split("|");
      // remove first element
      row.shift();
      // trim the excess spaces after and before a text
      row = row.map(element => element.trim());

      // first, check if the current row is actually within a subschema
      if (currentRowType === "array_subschema"){
        // add a new property element into the schema
        let upperRow = markdownArrayRep[currentSubschemaIdx];
        // convert string to array
        upperRow = upperRow.split("|");
        // remove first element
        upperRow.shift();
        // trun excess spaces
        upperRow = upperRow.map(element => element.trim());
        if (upperRow[KEY] !== ""){
          schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]] = {}
          if (row[OCC][0] === "1"){
            let schemaRequired = schema["properties"][upperRow[KEY]]["items"]["required"];
            schemaRequired.push(row[KEY]);
            schema["properties"][upperRow[KEY]]["items"]["required"] = schemaRequired
          }
        } else {
          console.log(`"Key" is not found at row ${i}`);
          return null;
        }
        // add title to the new element, if applicable
        if (row[TITLE] !== ""){
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["title"] = row[TITLE]
          }
        // add unit to the new element, if applicable
        if (row[UNIT] !== "") {
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["title"] = row[TITLE]+` [${row[UNIT]}]`
          }
        // add description to the new element
        if (row[DESCRIPTION] !== "") {
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["description"] = row[DESCRIPTION]
          }
        if (row[TYPE] !== "") {
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["type"] = row[TYPE].toLowerCase()
          }
        if (row[ALLOWED_VAL] !== ""){
            let enum_values = row[ALLOWED_VAL].split(";")
            enum_values = enum_values.map(val => val.trim());
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["enum"] = enum_values
          }
        if (row[OCC].split("-").length > 1) {
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["type"] = "array"
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["items"] = {}
            schema["properties"][upperRow[KEY]]["items"]["properties"][row[KEY]]["items"]["type"] = row[TYPE].toLowerCase()
        }
        // check if next iter is still "array_subschema"
        try {
          let nextRow = markdownArrayRep[i];
          // convert string to array
          nextRow = nextRow.split("|");
          // remove first element
          nextRow.shift();
          // trim the excess spaces after and before a text
          nextRow = nextRow.map(val => val.trim());
          //console.log(`next_row: ${nextRow}, line 287`);
          if (nextRow[ID].split(".").length < 2){
            currentRowType = ""
            }
          i+=1
        }
        catch (error) {
          console.log("Finished");
        }
      }
      else if (currentRowType === "subschema"){
        // add a new property element into the schema
        let upperRow = markdownArrayRep[currentSubschemaIdx];
        // convert string to array
        upperRow = upperRow.split("|");
        // remove first and last elements
        upperRow.shift();
        // trim the excess spaces after and before a text
        upperRow = upperRow.map(val => val.trim());

        if (upperRow[KEY] !== ""){
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]] = {};
          if (row[OCC] === "1"){
            let schemaRequired = schema["properties"][upperRow[KEY]]["required"];
            schemaRequired.push(row[KEY]);
            schema["properties"][upperRow[KEY]]["required"] = schemaRequired;
          }
        }
        else {
          console.log(`"Key" is not found at row ${i}`);
          return null;
        }
        // add title to the new element, if applicable
        if (row[TITLE] !== "") {
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["title"] = row[TITLE];
          }
        // add unit to the new element, if applicable
        if (row[UNIT] !== "") {
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["title"] = row[TITLE]+` [${row[UNIT]}]`;
          }
          // add description to the new element
        if (row[DESCRIPTION] !== "") {
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["description"] = row[DESCRIPTION];
          }
        if (row[TYPE] !== "") {
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["type"] = row[TYPE].toLowerCase();
          }
        if (row[ALLOWED_VAL] !== "") {
          let enum_values = row[ALLOWED_VAL].split(";");
          enum_values = enum_values.map(val => val.trim());
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["enum"] = enum_values;
          }
        if (row[OCC].split("-").length > 1) {
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["type"] = "array";
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["items"] = {};
          schema["properties"][upperRow[KEY]]["properties"][row[KEY]]["items"]["type"] = row[TYPE].toLowerCase();                    
        // check if next iter is still "array_subschema"
        }
        // check if next iter is still "array_subschema"
        try{
          let nextRow = markdownArrayRep[i]
          // convert string to array
          nextRow = nextRow.split("|")
          // remove first element
          nextRow.shift()
          // trim the excess spaces after and before a text
          nextRow = nextRow.map(val => val.trim())
          //console.log(`next_row: ${nextRow}, line 354`);
          if (nextRow[ID].split(".").length < 2){
              currentRowType = ""
            }
          i+=1
        }
        catch (error) {
          console.log("Finished")
        }
      }
      else {
        // add a new property element into schema
        if (row[KEY] !== ""){
          schema["properties"][row[KEY]] = {}
          // handle required
          if (row[OCC][0] === "1") {
            let schemaRequired = schema["required"]
            schemaRequired.push(row[KEY])
            schema["required"] = schemaRequired
          }
        }
        else {
          console.log(`"Key" is not found at row ${i}`);
          return null;
        }
        /////// first add common keywords
        // add title to the new element, if applicable
        if (row[TITLE] !== ""){
          schema["properties"][row[KEY]]["title"] = row[TITLE]
        }
        // add unit to the new element, if applicable
        if (row[UNIT] !== ""){
          schema["properties"][row[KEY]]["title"] = row[TITLE]+` [${row[UNIT]}]`
        }
        // add description to the new element
        if (row[DESCRIPTION] !== "") {
          schema["properties"][row[KEY]]["description"] = row[DESCRIPTION]
        }
        // add type to the new element
        if (row[TYPE] !== ""){
          schema["properties"][row[KEY]]["type"] = row[TYPE].toLowerCase()
        }
        else {
          // check if this row is actually an object or array with a subschema
          // by checking the next id
          let nextRow = markdownArrayRep[i]
          // convert string to array
          nextRow = nextRow.split("|")
          // remove first element
          nextRow.shift()
          // trim the excess spaces after and before a text
          nextRow = nextRow.map(val => val.trim())
          if (nextRow[ID].split(".").length === 2 && row[OCC].split("-").length===2){
            // then it is an array with a subschema
            // add object type to the row
            schema["properties"][row[KEY]]["type"] = "array"
            // add properties keywords
            schema["properties"][row[KEY]]["items"] = {}
            schema["properties"][row[KEY]]["items"]["type"] = "object"
            schema["properties"][row[KEY]]["items"]["required"] = []
            schema["properties"][row[KEY]]["items"]["properties"] = {}
            currentSubschemaIdx = i-1
            currentRowType = "array_subschema"
            // assign min and max items
            let minmax = row[OCC].split("-")
            if (minmax[0] !== "0"){
              schema["properties"][row[KEY]]["minItems"] = parseInt(minmax[0])
            }
            if (minmax[1] !== "n"){
              schema["properties"][row[KEY]]["maxItems"] = parseInt(minmax[1])
            }
          }
          else if (nextRow[ID].split(".").length === 2 && row[OCC].length<2){
              // add object type to the row
              schema["properties"][row[KEY]]["type"] = "object"
              // add properties keywords
              schema["properties"][row[KEY]]["required"] = []
              schema["properties"][row[KEY]]["properties"] = {}
              currentSubschemaIdx = i-1
              currentRowType = "subschema"
            }

        if (row[ALLOWED_VAL] !== ""){
            if (row[TYPE] === "string"){
                let enum_values = row[ALLOWED_VAL].split(";")
                enum_values = enum_values.map(val=>val.trim())
                schema["properties"][row[KEY]]["enum"] = enum_values
              }
            if (row[TYPE] === "number"){
                let enum_values = row[ALLOWED_VAL].split(";")
                enum_values = enum_values.map(val=>val.trim())
                schema["properties"][row[KEY]]["enum"] = enum_values
              }
            if (row[TYPE] === "integer"){
                let enum_values = row[ALLOWED_VAL].split(";")
                schema["properties"][row[KEY]]["enum"] = enum_values
                schema["properties"][row[KEY]]["enum"] = enum_values
              }
          }
        if (row[TYPE] !== "" && row[OCC].split("-").length === 2){
            // then this row is an array
            // then change the type to array
            schema["properties"][row[KEY]]["type"] = "array"
            // add type of items
            schema["properties"][row[KEY]]["items"] = { "type": row[TYPE].toLowerCase()}
            // assign min and max items
            let minmax = row[OCC].split("-")
            if (minmax[0] !== "0"){
                schema["properties"][row[KEY]]["minItems"] = parseInt(minmax[0])
              }
            if (minmax[1] !== "n") {
                schema["properties"][row[KEY]]["maxItems"] = parseInt(minmax[1])
              }
            }
           
          }
        i += 1  
      }
    })
    console.log(">>> finished converting")
    setSchema(schema)

    // create eLabFTW description list
    let descriptionList = createDescriptionList(JSON.parse(JSON.stringify(schema)));
    setDescList(descriptionList);

    // enable download
    setDownloadDisabled(false);
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        <MarkdownInput
          markdownData={markdownData}
          setMarkdownData={setMarkdownData}
          handleConvertPressed={handleConvertPressed}
          handleConvertPressedContinued={handleConvertPressedContinued}
          setConvertDisabled={setConvertDisabled}
          setDownloadDisabled={setDownloadDisabled}
          convertDisabled={convertDisabled}
          setSchema={setSchema}
          setDescList={setDescList}
          setTitle={setTitle}
        />
        <JsonResult
          downloadDisabled={downloadDisabled}
          convertDisabled={convertDisabled}
          schema={schema}
        />
        <DescListResult
          downloadDisabled={downloadDisabled}
          convertDisabled={convertDisabled}
          descListData={descList}
        />
      </div>
      <div style={{ padding: "5px" }}>
        Markdown to json schema and eLabFTW description list converter
        v2.0.0
      </div>
      <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">
          <div
            style={{
              display: "inline-flex",
              width: "100%",
              verticalAlign: "middle",
            }}
          >
            <div style={{ width: "100%", alignSelf: "center" }}>
              Convert Markdown
            </div>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon fontSize="large" color="secondary" />
            </IconButton>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>Convert Markdown without title?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => handleConvertPressedContinued()}
            color="primary"
            variant="contained"
            autoFocus
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Converter;
