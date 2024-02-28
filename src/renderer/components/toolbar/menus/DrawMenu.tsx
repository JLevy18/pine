import React, { forwardRef, useEffect, useState } from "react";
import { LuPencil } from "react-icons/lu";
import { BsCircleFill, BsHighlighter } from "react-icons/bs"
import { ReactComponent as LaserPointerIcon } from '../../../resources/laser-pointer.svg'

interface DrawMenuProps {
  id: string;
}

const DrawMenu = forwardRef<HTMLDivElement, DrawMenuProps>(({ id }, ref) => {

  return (
    <div id={id}
        className="menu-container"
        onClick={(e) => {e.stopPropagation()}}
        ref={ref}
    >
      <div className="draw-mode-container">
        <LuPencil className="draw-mode"/>
        <BsHighlighter className="draw-mode"/>
        <LaserPointerIcon className="draw-mode h-[1.3rem] w-[1.3rem]"/>
      </div>
      <div className="draw-size-container">
        <div className="draw-size">
          <BsCircleFill className="extra-fine w-1 h-1"/>
        </div>
        <div className="draw-size">
          <BsCircleFill className="fine w-2 h-2"/>
        </div>
        <div className="draw-size">
          <BsCircleFill className="medium w-3 h-3"/>
        </div>
        <div className="draw-size">
          <BsCircleFill className="bold"/>
        </div>
      </div>
    </div>
  );

});

export default DrawMenu;
