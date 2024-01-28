import React from "react";
import ColorOption from "./ColorOption";


interface ColorSelectionProps {
    hex: string;
}


const ColorSelection: React.FC<ColorSelectionProps> = ({ 
    hex
}) => {


    return (
        <ColorOption hex={hex}/>
    );

};

export default ColorSelection;