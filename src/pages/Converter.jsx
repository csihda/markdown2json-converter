import React, { useState } from "react";
import MarkdownInput from "../components/MarkdownInput";
import JsonResult from "../components/JsonResult";
import DescListResult from "../components/DescListResult";
import { Button } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const Converter = () => {
  const [markdownData, setMarkdownData] = useState();
  const [schema, setSchema] = useState();
  const [descList, setDescList] = useState();
  const [convertDisabled, setConvertDisabled] = useState(true);
  const [title, setTitle] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const handleConvertPressed = () => {
    if ((title === "") | (title === undefined)) {
      setOpenDialog(true);
    } else {
      handleConvertPressedContinued();
    }
  };

  const handleConvertPressedContinued = () => {
    // close dialog
    setOpenDialog(false);

    // here convert the markdown data to a valid json schema and pass it to JsonResult
    let markdownArrayRep = JSON.stringify(markdownData).replaceAll('"', "");
    markdownArrayRep = markdownArrayRep.split(/\r?\\n/);

    // create schema
    let updatedSchema = { ...schema };
    updatedSchema["$schema"] = "http://json-schema.org/draft-04/schema#";
    updatedSchema["id"] = "TO DO: need to create automatic id generation";
    if ((title !== "") | (title !== undefined)) {
      updatedSchema["title"] = title;
    }
    updatedSchema["description"] = "Some schema description";
    updatedSchema["type"] = "object";
    updatedSchema["properties"] = {};

    let pattern = "([a-zA-Z])\\1*";
    let markdownArrayTrans = [];
    for (let i = 0; i < markdownArrayRep.length; i++) {
      let markdownSubArray = markdownArrayRep[i].split("|");
      // delete first and last element of markdownSubArray
      markdownSubArray.shift();
      markdownSubArray.pop();

      if (markdownSubArray.length !== 0) {
        if (!markdownSubArray[0].match(pattern)) {
          // do nothing
        } else {
          // trim then push
          let arr = markdownSubArray.map((str) => str.trim());
          markdownArrayTrans.push(arr);
        }
      }
    }

    // now reshape the array
    let reshapedArray = [];
    for (let i = 0; i < markdownArrayTrans[0].length; i++) {
      let tempArray = [];
      for (let j = 0; j < markdownArrayTrans.length; j++) {
        tempArray.push(markdownArrayTrans[j][i]);
      }
      reshapedArray.push(tempArray);
    }

    // reshape to object
    let objectified = {};
    for (let i = 0; i < reshapedArray.length; i++) {
      const key = reshapedArray[i][0].toLowerCase();
      const value = JSON.parse(JSON.stringify(reshapedArray[i]));
      value.shift();
      objectified[key] = value;
    }

    // now input this array content to the schema
    for (let j = 0; j < objectified["key"].length; j++) {
      let value = {};
      if (objectified["title"][j] !== "") {
        value["title"] = objectified["title"][j];
      }
      if (objectified["description"][j] !== "") {
        value["description"] = objectified["description"][j];
      }
      if (objectified["default value"][j] !== "") {
        value["default"] = objectified["default value"][j];
      }
      if (objectified["type"][j] !== "") {
        value["type"] = objectified["type"][j];
      }
      updatedSchema["properties"][objectified["key"][j]] = value;
    }

    if (objectified["required"] !== undefined) {
      let required = [];
      for (let i = 0; i < objectified["required"].length; i++) {
        if (objectified["required"][i] === "true") {
          required.push(objectified["key"][i]);
        }
      }
      updatedSchema["required"] = required;
    }

    console.log(updatedSchema);
    setSchema(updatedSchema);

    // here convert the valid json schema to HTML description list
    let descriptionList = "<dl>\n";
    for (let i = 0; i < objectified["key"].length; i++) {
      descriptionList += `<dt>${objectified["title"][i]}</dt>\n`;
      descriptionList += `<dd>${objectified["description"][i]}</dd>\n`;
    }
    descriptionList += "</dl>";

    setDescList(descriptionList);
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
          convertDisabled={convertDisabled}
          setSchema={setSchema}
          setDescList={setDescList}
          setTitle={setTitle}
        />
        <JsonResult convertDisabled={convertDisabled} schema={schema} />
        <DescListResult
          convertDisabled={convertDisabled}
          descListData={descList}
        />
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
