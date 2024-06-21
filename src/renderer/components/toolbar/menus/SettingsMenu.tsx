import React, { forwardRef, useEffect, useState } from "react";


interface SettingsMenuProps {
  id: string;
  toggleDirection: () => void;
}

const SettingsMenu = forwardRef<HTMLDivElement, SettingsMenuProps>(({ id, toggleDirection }, ref) => {

    return (
      <div id={id}
          className="menu-container"
          onClick={(e) => {e.stopPropagation()}}
          ref={ref}
      >
        <h1 className="text-neutral-300 text-center font-bold underline underline-offset-3">Settings</h1>
        <div className="hotkey-header m-1">
          <h1 className="text-neutral-300 text-sm font-semibold">Hotkeys</h1>
          <div className="w-full h-[0.05rem] bg-neutral-500"></div>
        </div>
        <div className="flex justify-between items-center text-neutral-300 my-1">
          <div className="text-neutral-300 text-xs font-bold mx-2 border border-neutral-400 px-1 py-0.5 rounded">
            Ctrl+Alt+P
          </div>
          <div className="text-xs font-semibold bg-blue-600 py-1 px-2.5 mx-1.5 rounded-xl">
            Reset
          </div>
        </div>
      </div>
    );
  }
);

export default SettingsMenu;
