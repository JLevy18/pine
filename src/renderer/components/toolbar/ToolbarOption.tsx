// ToolbarOption.tsx
import React, { useEffect, useRef, useState } from "react";
import ColorMenu from "./menus/ColorMenu";
import DrawMenu from "./menus/DrawMenu";
import SettingsMenu from "./menus/SettingsMenu";
import ShapesMenu from "./menus/ShapesMenu";


interface ToolbarOptionProps {
  option: Option
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMenuAction: (actionType: string, ...args: any[]) => void;
  toggleDirection: () => void;
  updateOpenMenus: (menuRef: React.RefObject<HTMLDivElement>, isOpen: boolean) => void;
  updateMenuOverflow: (menuRef: React.RefObject<HTMLDivElement>) => void;
}

const ToolbarOption: React.FC<ToolbarOptionProps> = ({
  option,
  onMouseEnter,
  onMouseLeave,
  onMenuAction,
  toggleDirection,
  updateOpenMenus,
  updateMenuOverflow,
}) => {

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuIds = ["mode", "shapes", "draw-color", "settings"];

  const hasMenu = (id: string) => {
    return menuIds.includes(id);
  };

  const toggleMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    setShowMenu(prev => !prev);

    if (hasMenu(option.id)) {
      updateOpenMenus(menuRef, !showMenu)
    }

    switch (option.id) {
      case "clear":
        onMenuAction("clearCanvas");
        break;
      case "eraser":
        onMenuAction("setDrawMode", option.id)
        break;
      default:
        break;
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
      className={`toolbar-option ${option.className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={toggleMenu}
    >
      {option.icon}
      {showMenu && option.id === "mode" && (
        <DrawMenu ref={menuRef} id={option.id} onMenuAction={onMenuAction} />
      )}
      {showMenu && option.id === "shapes" && (
        <ShapesMenu ref={menuRef} id={option.id} onMenuAction={onMenuAction} />
      )}
      {showMenu && option.id === "draw-color" && (
        <ColorMenu ref={menuRef} id={option.id} onMenuAction={onMenuAction} />
      )}
      {showMenu && option.id === "settings" && (
        <SettingsMenu ref={menuRef} id={`menu-${option.id}`} toggleDirection={toggleDirection} />
      )}
    </div>
  );
};

export default ToolbarOption;
