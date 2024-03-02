import React, { forwardRef, useEffect, useState } from "react";
import { LuPencil, LuMove } from "react-icons/lu";
import { BsCircleFill, BsHighlighter } from "react-icons/bs"
import { ReactComponent as LaserPointerIcon } from '../../../resources/laser-pointer.svg'

interface DrawMenuProps {
  id: string;
  onMenuAction: (actionType: string, ...args: any[]) => void;
}

const DrawMenu = forwardRef<HTMLDivElement, DrawMenuProps>(({ id, onMenuAction }, ref) => {

  const handleModeChange = (mode: string) => {

    switch (mode) {
      case 'select':
        onMenuAction('setDrawMode', mode);
        break;
      case 'free':
        onMenuAction('setDrawMode', mode);
        break;
      case 'highlight':
        onMenuAction('setDrawMode', mode);
        break;
      default:
        console.error(mode, " is not a valid draw mode.");

    }
  }




  return (
    <div id={id}
        className="menu-container"
        onClick={(e) => {e.stopPropagation()}}
        ref={ref}
    >
      <div className="draw-mode-container">
        <LuMove className="draw-mode" onClick={() => handleModeChange('select')}/>
        <LuPencil className="draw-mode" onClick={() => handleModeChange('free')}/>
        <BsHighlighter className="draw-mode" onClick={() => handleModeChange('highlight')}/>
        <LaserPointerIcon className="draw-mode h-[1.3rem] w-[1.3rem]" onClick={() => handleModeChange('present')}/>
      </div>
      <div className="draw-size-container">
        <div className="draw-size"  onClick={() => onMenuAction('setStrokeWidth', 4)}>
          <BsCircleFill className="extra-fine w-1 h-1"/>
        </div>
        <div className="draw-size" onClick={() => onMenuAction('setStrokeWidth', 8)}>
          <BsCircleFill className="fine w-2 h-2"/>
        </div>
        <div className="draw-size" onClick={() => onMenuAction('setStrokeWidth', 12)}>
          <BsCircleFill className="medium w-3 h-3" />
        </div>
        <div className="draw-size"  onClick={() => onMenuAction('setStrokeWidth', 16)}>
          <BsCircleFill className="bold"/>
        </div>
      </div>
    </div>
  );

});

export default DrawMenu;
