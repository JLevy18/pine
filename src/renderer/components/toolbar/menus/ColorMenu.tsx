import React, { forwardRef, useEffect, useState } from "react";
import ColorOption from "../ColorOption";


interface ColorMenuProps {
  id: string;
  onMenuAction: (actionType: string, ...args: any[]) => void;
}

const ColorMenu = forwardRef<HTMLDivElement, ColorMenuProps>(({ id, onMenuAction }, ref) => {

    return (
      <div id={id}
          className="menu-container"
          onClick={(e) => {e.stopPropagation()}}
          ref={ref}
      >
        <div className="color-presets grid grid-cols-6 gap-2 m-1">
          <ColorOption onMenuAction={onMenuAction} hex="#DC2626"/>
          <ColorOption onMenuAction={onMenuAction} hex="#EA580C"/>
          <ColorOption onMenuAction={onMenuAction} hex="#CA8A04"/>
          <ColorOption onMenuAction={onMenuAction} hex="#16A34A"/>
          <ColorOption onMenuAction={onMenuAction} hex="#2563EB"/>
          <ColorOption onMenuAction={onMenuAction} hex="#9333EA"/>
          <ColorOption onMenuAction={onMenuAction} hex="#DB2777"/>
          <ColorOption onMenuAction={onMenuAction} hex="#FFFFFF"/>
          <ColorOption onMenuAction={onMenuAction} hex="#000000"/>
        </div>

      </div>
    );
  }
);

export default ColorMenu;
