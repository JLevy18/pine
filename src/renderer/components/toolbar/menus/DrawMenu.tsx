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
        
      </div>
    );
  }
);

export default DrawMenu;