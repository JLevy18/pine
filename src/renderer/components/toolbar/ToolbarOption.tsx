// ToolbarOption.tsx
import React, { useEffect, useRef, useState } from "react";
import ColorMenu from "./menus/ColorMenu";
import SettingsMenu from "./menus/SettingsMenu";

interface ToolbarOptionProps {
  option: {
    icon: JSX.Element | null;
    category: string;
    id: string;
  };
  menuRef: React.RefObject<HTMLDivElement>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  toggleDirection: () => void;
  updateMaxOverflow: () => void;
  calculateMenuPosition: (menuRef: React.RefObject<HTMLDivElement>) => void;
  onColorSelection: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ToolbarOption: React.FC<ToolbarOptionProps> = ({ 
  option,
  menuRef,
  onMouseEnter,
  onMouseLeave, 
  toggleDirection,
  updateMaxOverflow,
  calculateMenuPosition,
  onColorSelection
}) => {

  const [showMenu, setShowMenu] = useState(false);
  const [highlightSelection, setHighlightSelection] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if(option.id !== "settings"){
      setHighlightSelection(false)
    }else if (option.id === "settings" && highlightSelection){
      setHighlightSelection(false)
    }else {
      setHighlightSelection(true)
    }
  } 

  useEffect(() => {
    if(showMenu){
      updateMaxOverflow();
    }

  }, [showMenu]);


  useEffect(() => {

    if (showMenu) {
      calculateMenuPosition(menuRef);
    }

  }, [showMenu, calculateMenuPosition]);



  return (
    <div 
      id={option.id} 
      className={`toolbar-option ${highlightSelection ? "selected" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={toggleMenu}
    >
      {option.icon}
      {showMenu && option.id === "settings" && (
        <SettingsMenu ref={menuRef} id={`menu-${option.id}`} toggleDirection={toggleDirection} />
      )}
      {showMenu && option.id === "draw-color" && (
        <ColorMenu ref={menuRef} id={option.id} onColorSelection={onColorSelection}/>
      )}
    </div>
  );
};

export default ToolbarOption;