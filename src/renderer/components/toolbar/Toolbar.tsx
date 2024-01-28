import '../../styles/Toolbar.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import ToolbarOption from './ToolbarOption';

import { BsEraser } from 'react-icons/bs';
import { TbSquareLetterT } from 'react-icons/tb';
import { LuX, LuSettings, LuTrash2, LuPencil, LuUndo2, LuRedo2, LuSave, LuShapes } from 'react-icons/lu';
import { Position } from '../types';
import ColorSelection from './ColorSelection';
import ColorOption from './ColorOption';

const Toolbar: React.FC = () => {



    const categories = ["Draw", "Format", "Utility", "Settings"];


    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    
    const [brushColor, setBrushColor] = useState("#DB2777");

    const options = [
        { category: "Draw", id: "free", icon: <LuPencil />},
        { category: "Draw", id: "shapes", icon: <LuShapes />},
        { category: "Draw", id: "text-box", icon: <TbSquareLetterT />},
        { category: "Draw", id: "eraser", icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12.133 1.491C13.341.283 15.3.281 16.508 1.491L22.511 7.492C23.719 8.7 23.717 10.66 22.511 11.867L11.869 22.509C10.648 23.73 8.798 23.815 7.469 22.486 7.424 22.441 1.489 16.507 1.489 16.507.281 15.298.281 13.34 1.489 12.131L12.133 1.491V1.491ZM15.414 2.585C14.811 1.981 13.83 1.981 13.227 2.585L6.059 9.752 14.248 17.941 21.415 10.773C22.019 10.168 22.019 9.189 21.415 8.584L15.414 2.583 15.414 2.585ZM13.154 19.034 4.966 10.846 2.585 13.227C1.98 13.832 1.981 14.811 2.585 15.414L8.583 21.412C9.232 22.062 10.125 22.082 10.775 21.415L13.154 19.034Z"/></svg>},
        { category: "Format", id: "draw-color", icon: <ColorSelection hex={brushColor}/>},
        { category: "Utility", id: "undo", icon: <LuUndo2 /> },
        { category: "Utility", id: "redo", icon: <LuRedo2 />},
        { category: "Utility", id: "clear", icon: <LuTrash2 />},
        { category: "Utility", id: "save", icon: <LuSave />},
        { category: "Settings", id: "settings", icon: <LuSettings />},
        { category: "Settings", id: "hide", icon: <LuX />},
    ];


    const [disableDrag, setDisableDrag] = useState(false);
    const [toolbarDirection, setToolbarDirection] = useState("horizontal");
    const [toolbarPosition, setToolbarPosition] = useState<Position>({x: 0, y: 0});

    const [menuMaxOverflow, setMenuMaxOverflow] = useState<number>(0);
  
    const calculateMenuPosition = useCallback((menuRef: React.RefObject<HTMLDivElement>) => {
        const menuElement = menuRef.current;
        const toolbarElement = toolbarRef.current;
        const rightBound = window.innerWidth;
    
        if (menuElement && toolbarElement) {

            const toolbarRect = toolbarElement.getBoundingClientRect();
            const toolbarRightEdge = Math.round(toolbarRect.right);
            const toolbarRemainDrag = (rightBound - toolbarRightEdge);

            const menuRect = menuElement.getBoundingClientRect();
            const menuRightEdge = Math.round(menuRect.right);
            
            // Menu translation
            const transform = window.getComputedStyle(menuElement).transform;
            const transformValues = transform.match(/matrix.*\((.+)\)/);
            const translateX = transformValues ? parseFloat(transformValues[1].split(', ')[4]) : 0;

            let translation = translateX || 0;
            let overflowing = (rightBound - menuRightEdge) < 0;



            // HORIZONTAL COLLISION DETECTION
            if (overflowing && toolbarRemainDrag >= 0) {

                translation = -(menuMaxOverflow - (rightBound - toolbarRightEdge));
                menuElement.style.transform = `translateX(${translation}px)`;

                // console.log("Approach",{
                //     menuMaxOverflow: menuMaxOverflow,
                //     translation: -(menuMaxOverflow - (rightBound - toolbarRightEdge)),
                //     toolbarRemainDrag: rightBound - toolbarRightEdge,
                //     overflowing: overflowing,
                //     onBoundary: menuOnBoundary
                // })

            }else if (!overflowing && toolbarRemainDrag <= menuMaxOverflow) {
                
                translation = -(menuMaxOverflow - (rightBound - toolbarRightEdge));
                menuElement.style.transform = `translateX(${translation}px)`;

                // console.log("Leaving",{
                //     menuMaxOverflow: menuMaxOverflow,
                //     translation: -(menuMaxOverflow - (rightBound - toolbarRightEdge)),
                //     toolbarRemainDrag: rightBound - toolbarRightEdge,
                //     overflowing: overflowing,
                // })
            }  

            
            let gap;

            // Slightly different calculation depending on the state of the menu
            if (menuElement.style.bottom === ""){
                gap = (menuRect.top - toolbarRect.bottom);
            }else{
                gap = (toolbarRect.top - menuRect.bottom);
            }

            let overflowingY = (toolbarRect.bottom + menuRect.height + gap) > window.innerHeight;

            // VERTICAL COLLISION DETECTION
            if (overflowingY){
                //menuElement.style.top = "0%";
                menuElement.style.bottom = "100%";
                menuElement.style.removeProperty('top');
            } else if (!overflowingY) {
                menuElement.style.top = "100%";
                menuElement.style.removeProperty('bottom');
            }

        
        } 
    }, [toolbarPosition, menuMaxOverflow]);

    const handleDirectionToggle = () => {
        setToolbarDirection(toolbarDirection === "vertical" ? "horizontal" : "vertical");
    };

    const handleOptionMouseEnter = () => {
        setDisableDrag(true);
    }

    const handleOptionMouseLeave = () => {
        setDisableDrag(false);
    }

    const handleUpdateMaxOverflow = () => {
        const menuElement = menuRef.current;
        const toolbarElement = toolbarRef.current;
        const rightBound = window.innerWidth;

        if(menuElement && toolbarElement){

            const menuRightEdge = Math.round(menuElement.getBoundingClientRect().right);
            const toolbarRightEdge = Math.round(toolbarElement.getBoundingClientRect().right);
            setMenuMaxOverflow((rightBound - toolbarRightEdge) - (rightBound - menuRightEdge));
        }

        
        
    }

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        setToolbarPosition({x: data.x, y: data.y});
    };


    // Thanks GPT
    const rgbToHex = (r: number, g: number, b: number): string => {
        const toHex = (c: number): string => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
    
        return "#" + toHex(r) + toHex(g) + toHex(b);
    };

     // Thanks GPT
    const convertRGBtoHex = (rgb: string): string => {
        const result = rgb.match(/\d+/g);
    
        if (result) {
            const r = parseInt(result[0]);
            const g = parseInt(result[1]);
            const b = parseInt(result[2]);
    
            return rgbToHex(r, g, b);
        }
    
        return ''; // Return an empty string or some default value if parsing fails
    };
    

    const handleColorSelection = (e: React.MouseEvent<HTMLDivElement>) => {
        setBrushColor(convertRGBtoHex(e.currentTarget.style.backgroundColor))
    }

    return(
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
                            //.sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((option) => (
                            <ToolbarOption 
                                key={option.id} 
                                option={option}
                                toggleDirection={handleDirectionToggle}
                                onMouseEnter={handleOptionMouseEnter}
                                onMouseLeave={handleOptionMouseLeave}
                                
                                menuRef={menuRef}
                                calculateMenuPosition={calculateMenuPosition}
                                updateMaxOverflow={handleUpdateMaxOverflow}

                                onColorSelection={handleColorSelection}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </Draggable>
    );
};

export default Toolbar;