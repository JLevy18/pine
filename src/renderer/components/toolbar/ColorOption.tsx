import React from "react";


interface ColorOptionProps {
    hex: string;
    onColorSelection?: (e: React.MouseEvent<HTMLDivElement>) => void;
}


const ColorSelection: React.FC<ColorOptionProps> = ({ 
    hex,
    onColorSelection
}) => {


    return (
        <div onClick={onColorSelection} className="color-option" style={{backgroundColor: hex}}/>
    );

};

export default ColorSelection;