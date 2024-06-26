// ToolbarOption.tsx
import React, { useEffect, useRef, useState } from "react";
import { Category } from '../../enums';
import ColorMenu from "./menus/ColorMenu";
import DrawMenu from "./menus/DrawMenu";
import SettingsMenu from "./menus/SettingsMenu";
import ShapesMenu from "./menus/ShapesMenu";


interface ToolbarOptionProps {
  option: Option
  currentDrawMode?: string;
  selected: boolean
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMenuAction: (actionType: string, ...args: any[]) => void;
  toggleDirection: () => void;
  updateOpenMenus: (menuRef: React.RefObject<HTMLDivElement>, isOpen: boolean) => void;
  updateMenuOverflow: (menuRef: React.RefObject<HTMLDivElement>) => void;
  updateMenuMaxHeight: (menuRef: React.RefObject<HTMLDivElement>) => void;
}

const ToolbarOption: React.FC<ToolbarOptionProps> = ({
  option,
  currentDrawMode,
  selected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMenuAction,
  toggleDirection,
  updateOpenMenus,
  updateMenuOverflow,
  updateMenuMaxHeight
}) => {

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuIds = ["mode", "shapes", "draw-color", "settings"];
  const hasMenu = (id: string) => {
    return menuIds.includes(id);
  };

  const toggleMenu = () => {
    onClick();

    if (option.category !== Category.DRAW || (option.category === Category.DRAW && selected)) {
      setShowMenu(prev => !prev);

      if (hasMenu(option.id)) {
        updateOpenMenus(menuRef, !showMenu)
      }
    }

    switch (option.id) {
      case "mode":
        onMenuAction("setDrawMode", currentDrawMode);
        break;
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

  const handleMenuAction = (actionType: string, ...args: any[]) => {
    onMenuAction(actionType, args[0]);
    setShowMenu(prev => !prev);
    if (hasMenu(option.id)) {
      updateOpenMenus(menuRef, !showMenu)
    }
  }

  useEffect(() => {
    if (showMenu) {
      updateMenuOverflow(menuRef);
      updateMenuMaxHeight(menuRef);
    }
  }, [showMenu])

  useEffect(() => {
    if (!selected && showMenu && menuRef.current) {
      setShowMenu(false);
      updateOpenMenus(menuRef, false);
    }
  }, [selected, showMenu, menuRef, setShowMenu, updateOpenMenus]);

  const isSelected = selected && option.category !== Category.FORMAT && option.category !== Category.UTILITY;

  return (
    <div
      id={option.id}
      className={`toolbar-option ${isSelected ? "selected" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={toggleMenu}
    >
      {option.icon}
      {showMenu && option.id === "mode" && (
        <DrawMenu ref={menuRef} id={option.id} onMenuAction={handleMenuAction} />
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
