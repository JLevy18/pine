import React, { forwardRef, useEffect, useState } from "react";
import ColorOption from "../ColorOption";


interface ColorMenuProps {
  id: string;
  onColorSelection: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ColorMenu = forwardRef<HTMLDivElement, ColorMenuProps>(({ id, onColorSelection }, ref) => {

    return (
      <div id={id} 
          className="menu-container" 
          onClick={(e) => {e.stopPropagation()}}
          ref={ref}
      >
        <div className="color-presets grid grid-cols-6 gap-2 m-1">
          <ColorOption onColorSelection={onColorSelection} hex="#DC2626"/>
          <ColorOption onColorSelection={onColorSelection} hex="#EA580C"/>
          <ColorOption onColorSelection={onColorSelection} hex="#CA8A04"/>
          <ColorOption onColorSelection={onColorSelection} hex="#16A34A"/>
          <ColorOption onColorSelection={onColorSelection} hex="#2563EB"/>
          <ColorOption onColorSelection={onColorSelection} hex="#9333EA"/>
          <ColorOption onColorSelection={onColorSelection} hex="#DB2777"/>
          <ColorOption onColorSelection={onColorSelection} hex="#FFFFFF"/>
          <ColorOption onColorSelection={onColorSelection} hex="#000000"/>
        </div>
        
      </div>
    );
  }
);

export default ColorMenu;