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
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  toggleDirection: () => void;
  onColorSelection: (e: React.MouseEvent<HTMLDivElement>) => void;
  updateOpenMenus: (menuRef: React.RefObject<HTMLDivElement>, isOpen: boolean) => void;
}

const ToolbarOption: React.FC<ToolbarOptionProps> = ({ 
  option,
  onMouseEnter,
  onMouseLeave, 
  toggleDirection,
  updateOpenMenus,
  onColorSelection
}) => {

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [highlightSelection, setHighlightSelection] = useState(false);

  const toggleMenu = () => {
 
    setShowMenu(prev => !prev);
    updateOpenMenus(menuRef, !showMenu);

    if(option.id !== "settings"){
      setHighlightSelection(false)
    }else if (option.id === "settings" && highlightSelection){
      setHighlightSelection(false)
    }else {
      setHighlightSelection(true)
    }
  } 

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
      {showMenu && option.id === "shapes" && (
        <ColorMenu ref={menuRef} id={option.id} onColorSelection={onColorSelection}/>
      )}
      {showMenu && option.id === "eraser" && (
        <ColorMenu ref={menuRef} id={option.id} onColorSelection={onColorSelection}/>
      )}
    </div>
  );
};

export default ToolbarOption;