import React, { forwardRef, useEffect, useState } from "react";
import { LuCircle, LuSquare, LuTriangle } from "react-icons/lu";


interface ShapesMenuProps {
  id: string;
  onMenuAction: (actionType: string) => void;
}

const ShapesMenu = forwardRef<HTMLDivElement, ShapesMenuProps>(({ id, onMenuAction }, ref) => {

    return (
      <div id={id}
          className="menu-container"
          onClick={(e) => {e.stopPropagation()}}
          ref={ref}
      >
        <div className="shape-option hover:cursor-pointer">
            <LuSquare size={20} onClick={() => onMenuAction('addRectangle')}/>
            <LuCircle size={20} onClick={() => onMenuAction('addCircle')}/>
            <LuTriangle size={20} onClick={() => onMenuAction('addTriangle')}/>
        </div>
      </div>
    );
  }
);

export default ShapesMenu;
