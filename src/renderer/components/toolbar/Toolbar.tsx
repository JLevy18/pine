import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import '../../styles/Toolbar.css';
import ToolbarOption from './ToolbarOption';
import { Category } from '../../enums'
import { LuPencil, LuRedo2, LuSave, LuSettings, LuShapes, LuTrash2, LuUndo2, LuX } from 'react-icons/lu';
import ColorSelection from './ColorSelection';


interface ToolbarProps {
  onMenuAction: (actionType: string, ...args: any[]) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onMenuAction }) => {

  // Configuration JSON
  const categories = ["Draw", "Format", "Utility", "Settings"];

  const [selectedOptions, setSelectedOptions] = useState<{ [key in Category]?: string }>({
    [Category.DRAW]: 'mode'
  });
  const options = [
    { id: "mode", category: Category.DRAW, selected: true, icon: <LuPencil size={20} /> },
    { id: "shapes", category: Category.DRAW, selected: false, icon: <LuShapes size={20} /> },
    { id: "eraser", category: Category.DRAW, selected: false, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.133 1.491C13.341.283 15.3.281 16.508 1.491L22.511 7.492C23.719 8.7 23.717 10.66 22.511 11.867L11.869 22.509C10.648 23.73 8.798 23.815 7.469 22.486 7.424 22.441 1.489 16.507 1.489 16.507.281 15.298.281 13.34 1.489 12.131L12.133 1.491V1.491ZM15.414 2.585C14.811 1.981 13.83 1.981 13.227 2.585L6.059 9.752 14.248 17.941 21.415 10.773C22.019 10.168 22.019 9.189 21.415 8.584L15.414 2.583 15.414 2.585ZM13.154 19.034 4.966 10.846 2.585 13.227C1.98 13.832 1.981 14.811 2.585 15.414L8.583 21.412C9.232 22.062 10.125 22.082 10.775 21.415L13.154 19.034Z" /></svg> },
    { id: "draw-color", category: Category.FORMAT, selected: false, icon: <ColorSelection hex="#DB2777" /> },
    { id: "undo", category: Category.UTILITY, selected: false, icon: <LuUndo2 size={20} /> },
    { id: "redo", category: Category.UTILITY, selected: false, icon: <LuRedo2 size={20} /> },
    { id: "clear", category: Category.UTILITY,  selected: false, icon: <LuTrash2 size={20} /> },
    { id: "save", category: Category.UTILITY, selected: false, icon: <LuSave size={20} /> },
    { id: "settings", category: Category.SETTINGS, selected: false, icon: <LuSettings size={20} /> },
    { id: "hide", category: Category.SETTINGS, selected: false, icon: <LuX size={20} /> },
  ];


  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const MENU_GAP = 3;

  const [disableDrag, setDisableDrag] = useState(false);

  const [openMenus, setOpenMenus] = useState<React.RefObject<HTMLDivElement>[]>([]);
  const [menuOverflow, setMenuOverflow] = useState<number>(0);
  const [toolbarDirection, setToolbarDirection] = useState("horizontal");
  const [toolbarPosition, setToolbarPosition] = useState<Position>({ x: 0, y: 0 });

  function sortMenuRefs(menuRefs: React.RefObject<HTMLDivElement>[]): React.RefObject<HTMLDivElement>[] {
    // Step 1: Map ids to indices
    const idToIndexMap = new Map<string, number>();
    options.forEach((option, index) => {
      idToIndexMap.set(option.id, index);
    });

    // Step 2: Sort menuRefs based on the order in options config array
    return menuRefs.sort((a, b) => {
      let aId = a.current?.getAttribute('id');
      let bId = b.current?.getAttribute('id');

      let aIndex = aId ? idToIndexMap.get(aId) ?? Infinity : Infinity; // Handle missing or null refs
      let bIndex = bId ? idToIndexMap.get(bId) ?? Infinity : Infinity;

      return aIndex - bIndex;
    });
  }

  function getXTranslation(element: HTMLElement): number {
    const style = window.getComputedStyle(element);
    const transform = style.getPropertyValue('transform');

    // Check if the transform value is in the matrix format
    const match = /matrix\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^)]+)\)/.exec(transform);

    if (match) {
      // Parse the fifth value in the matrix, which is the tx (translation in X)
      return parseFloat(match[5]);
    } else {
      // Return 0 if the matrix format is not found
      return 0;
    }
  }

  function fitToBounds(menuRefs: React.RefObject<HTMLDivElement>[]): void {

    let toolbarElement = toolbarRef.current;
    if (menuOverflow > 0 && toolbarElement) {
      let toolbarRightEdge = toolbarElement.getBoundingClientRect().right;
      if (window.innerWidth - toolbarRightEdge < menuOverflow) {

        let translation = (window.innerWidth - toolbarRightEdge) - menuOverflow;
        for (let i = menuRefs.length - 1; i >= 0; i--) {

          let menuElement = menuRefs[i].current;
          let prevMenuElement = menuRefs[i + 1]?.current;
          if (menuElement) {
            if (i === menuRefs.length - 1) {
              let currentTransform = getXTranslation(menuElement);
              translation = translation + currentTransform;
              menuElement.style.transform = `translateX(${translation}px)`;

            } else if (prevMenuElement) {
              let menuRightEdge = menuElement.getBoundingClientRect().right;
              let prevMenuLeftEdge = prevMenuElement.getBoundingClientRect().left;
              let currentTransform = getXTranslation(menuElement);

              if (menuRightEdge + MENU_GAP > prevMenuLeftEdge) {
                menuElement.style.transform = `translateX(${currentTransform - ((menuRightEdge + MENU_GAP) - prevMenuLeftEdge)}px)`;
              }
            }
          }
        }
      }
    }
  }

  const calculateMenuPositions = useCallback((menuRefs: React.RefObject<HTMLDivElement>[]) => {
    for (let i = 0; i < menuRefs.length; i++) {

      let menuElement = menuRefs[i].current;
      let prevMenuElement = menuRefs[i - 1]?.current;

      if (menuElement) {
        //Reset the menu to default position
        menuElement.style.transform = `translateX(0px)`;

        if (prevMenuElement) {
          let prevMenuRightEdge = prevMenuElement.getBoundingClientRect().right;
          let menuLeftEdge = menuElement.getBoundingClientRect().left;

          let translation = (prevMenuRightEdge + MENU_GAP) - menuLeftEdge;
          // Resolve collisions
          if (translation > 0) {
            menuElement.style.transform = `translateX(${translation}px)`;
          }
        }

        // On the last menu we need to update the menuOverflow in case it has changed.
        if (i === menuRefs.length - 1) {
          updateMenuOverflow(menuRefs[i]);
        }
      }
    }
  }, []);

  const updateOpenMenus = (menuRef: React.RefObject<HTMLDivElement>, isOpen: boolean) => {
    setOpenMenus(prev => isOpen ? [...prev, menuRef] : prev.filter(ref => ref !== menuRef));
  };

  const updateMenuOverflow = (menuRef: React.RefObject<HTMLDivElement>) => {
    const menuElement = menuRef.current;
    const toolbarElement = toolbarRef.current;

    if (menuElement && toolbarElement) {
      const menuRightEdge = Math.round(menuElement.getBoundingClientRect().right);
      const toolbarRightEdge = Math.round(toolbarElement.getBoundingClientRect().right);
      setMenuOverflow(menuRightEdge - toolbarRightEdge);
    }
  }

  const handleDirectionToggle = () => {
    setToolbarDirection(toolbarDirection === "vertical" ? "horizontal" : "vertical");
  };

  const handleOptionMouseEnter = () => {
    setDisableDrag(true);
  }

  const handleOptionMouseLeave = () => {
    setDisableDrag(false);
  }

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    setToolbarPosition({ x: data.x, y: data.y });
  };

  const handleOnMenuAction = (actionType: string, ...args: any[]) => {
    onMenuAction(actionType, args[0])
    if (actionType === 'setBrushColor') {
      options.forEach( option => {
        if (option.id === 'draw-color' && args[0]){
          option.icon = <ColorSelection hex={args[0]} />
        }
      })
    }
  }

  // Recalculate menu positions when openMenus changes
  useEffect(() => {
    calculateMenuPositions(sortMenuRefs(openMenus));
    fitToBounds(sortMenuRefs(openMenus));
  }, [toolbarPosition, openMenus, menuOverflow]);

  const handleOptionClick = (clickedOption: Option) => {
    const isSelected = selectedOptions[clickedOption.category] === clickedOption.id;
    const currentlySelected = selectedOptions[clickedOption.category];
    // If the clicked option is already selected and belongs to the DRAW category, return early
    if (currentlySelected === clickedOption.id && clickedOption.category === Category.DRAW) {
      return;
    }
    setSelectedOptions(prev => ({
      ...prev,
      [clickedOption.category]: isSelected ? undefined : clickedOption.id
    }));
  }

  return (
    <Draggable
      bounds="parent"
      handle=".toolbar"
      disabled={disableDrag}
      position={toolbarPosition}
      onDrag={handleDrag}
      onStop={handleDrag}
    >
      <div ref={toolbarRef} className={`toolbar ${toolbarDirection}`}>
        {categories.map((category, categoryIndex) => (
          <React.Fragment key={categoryIndex}>
            {categoryIndex > 0 && <div className="separator" />}
            {options
              .filter((option) => option.category === category)
              .map((option) => {

                return (
                  <ToolbarOption
                    key={option.id}
                    option={option}
                    selected={selectedOptions[option.category] === option.id}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={handleOptionMouseEnter}
                    onMouseLeave={handleOptionMouseLeave}
                    onMenuAction={handleOnMenuAction}
                    updateOpenMenus={updateOpenMenus}
                    updateMenuOverflow={updateMenuOverflow}
                    toggleDirection={handleDirectionToggle}
                  />
                )
              })}
          </React.Fragment>
        ))}
      </div>
    </Draggable>
  );
};

export default Toolbar;



