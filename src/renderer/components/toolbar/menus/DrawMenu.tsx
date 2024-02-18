import React, { forwardRef, useEffect, useState } from "react";


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
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">awewww</h1>
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">Test</h1>
      <h1 className="text-white">Test</h1>
    </div>
  );

});

export default DrawMenu;
