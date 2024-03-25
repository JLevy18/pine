import React from "react";


interface ColorOptionProps {
    hex: string;
    onMenuAction: (actionType: string, ...args: any[]) => void;
  }


const ColorSelection: React.FC<ColorOptionProps> = ({
    hex,
    onMenuAction
}) => {

const handleMenuAction = (e: React.MouseEvent<HTMLDivElement>) => {
  if (onMenuAction){
    onMenuAction("setBrushColor", e.currentTarget.style.backgroundColor);
  }
}


    return (
        <div onClick={handleMenuAction} className="color-option" style={{backgroundColor: hex}}/>
    );

};

export default ColorSelection;
