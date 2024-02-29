import React, { forwardRef, useEffect, useState } from "react";
import { LuCircle, LuSquare, LuTriangle } from "react-icons/lu";


interface ShapesMenuProps {
  id: string;
  onAddRectangle: () => void;
}

const ShapesMenu = forwardRef<HTMLDivElement, ShapesMenuProps>(({ id, onAddRectangle }, ref) => {

    return (
      <div id={id}
          className="menu-container"
          onClick={(e) => {e.stopPropagation()}}
          ref={ref}
      >
        <div className="shape-option hover:cursor-pointer">
            <LuSquare size={20} onClick={onAddRectangle}/>
            <LuCircle size={20}/>
            <LuTriangle size={20}/>
        </div>
      </div>
    );
  }
);

export default ShapesMenu;
