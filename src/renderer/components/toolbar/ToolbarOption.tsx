// ToolbarOption.tsx
import React, { useEffect, useRef, useState } from "react";
import ColorMenu from "./menus/ColorMenu";
import DrawMenu from "./menus/DrawMenu";
import SettingsMenu from "./menus/SettingsMenu";
import ShapesMenu from "./menus/ShapesMenu";

interface ToolbarOptionProps {
  option: {
    icon: JSX.Element | null;
    category: string;
    id: string;
  };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAddRectangle: () => void;
  toggleDirection: () => void;
  onColorSelection: (e: React.MouseEvent<HTMLDivElement>) => void;
  updateOpenMenus: (menuRef: React.RefObject<HTMLDivElement>, isOpen: boolean) => void;
  updateMenuOverflow: (menuRef: React.RefObject<HTMLDivElement>) => void;
}

const ToolbarOption: React.FC<ToolbarOptionProps> = ({
  option,
  onMouseEnter,
  onMouseLeave,
  onAddRectangle,
  toggleDirection,
  updateOpenMenus,
  updateMenuOverflow,
  onColorSelection
}) => {

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [highlightSelection, setHighlightSelection] = useState(false);

  const menuIds = ["mode", "shapes", "draw-color", "settings"];

  const hasMenu = (id: string) => {
    return menuIds.includes(id);
  };

  const toggleMenu = () => {

    setShowMenu(prev => !prev);

    if (hasMenu(option.id)) {
      updateOpenMenus(menuRef, !showMenu)
    }

    if(option.id !== "settings"){
      setHighlightSelection(false)
    }else if (option.id === "settings" && highlightSelection){
      setHighlightSelection(false)
    }else {
      setHighlightSelection(true)
    }
  }

  useEffect(() => {
    if (showMenu) {
      updateMenuOverflow(menuRef);
    }
  }, [showMenu])

  return (
    <div
      id={option.id}
      className={`toolbar-option ${highlightSelection ? "selected" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={toggleMenu}
    >
      {option.icon}
      {showMenu && option.id === "mode" && (
        <DrawMenu ref={menuRef} id={option.id}/>
      )}
      {showMenu && option.id === "shapes" && (
        <ShapesMenu ref={menuRef} id={option.id} onAddRectangle={onAddRectangle}/>
      )}
      {showMenu && option.id === "draw-color" && (
        <ColorMenu ref={menuRef} id={option.id} onColorSelection={onColorSelection}/>
      )}
      {showMenu && option.id === "settings" && (
        <SettingsMenu ref={menuRef} id={`menu-${option.id}`} toggleDirection={toggleDirection} />
      )}
    </div>
  );
};

export default ToolbarOption;
