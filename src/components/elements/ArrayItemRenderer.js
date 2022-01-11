import React from 'react';
import ItemStringType from "./array_items/ItemStringType";

const ArrayItemRenderer = ({ pathSchema, dataInputItems, setDataInputItems, path, type, edit, fieldIndex, fieldId, handleDeleteArrayItem }) => {

    switch (type) {
        case 'string':
            return (<ItemStringType
                setDataInputItems={setDataInputItems}
                pathSchema={pathSchema}
                dataInputItems={dataInputItems}
                path={path + "." + fieldIndex}
                index={fieldIndex}
                field_id={fieldId}
                handleDeleteArrayItem={handleDeleteArrayItem}
                edit={edit}
                field_type={type}
            />)

        default:
            return null;
    }


}

export default ArrayItemRenderer;
