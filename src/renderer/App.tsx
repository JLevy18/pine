import './styles/App.css';

import { fabric } from 'fabric';
import { FabricJSCanvas, FabricJSEditor, useFabricJSEditor } from 'fabricjs-react';
import React, { useState } from 'react';
import Toolbar from './components/toolbar/Toolbar';
import { IEvent } from 'fabric/fabric-impl';

interface ActionHandler {
  (editor: FabricJSEditor | undefined, ...args: any[]): void;
}

interface ActionHandlers {
  [key: string]: ActionHandler;
}

interface Erasable {
  object: fabric.Object;
  originalOpacity: number;
}

type CanvasAction = {
  type: 'add' | 'remove';
  object: fabric.Object;
}

class CanvasHistory {
  private static instance: CanvasHistory;
  private undoStack: CanvasAction[] = [];
  private redoStack: CanvasAction[] = [];

  private constructor() {}

  static getInstance(): CanvasHistory {
    if (!CanvasHistory.instance) {
      CanvasHistory.instance = new CanvasHistory();
    }
    return CanvasHistory.instance;
  }

  add(action: CanvasAction){
    this.undoStack.push(action);
    this.redoStack = [];
  }

  undo(canvas: fabric.Canvas) {
    console.log(this.undoStack)
    const action = this.undoStack.pop();
    if (action) {
      this.applyAction(canvas, action, 'undo')
      this.redoStack.push(action);
    }
  }

  redo(canvas: fabric.Canvas) {
    const action = this.redoStack.pop();
    if (action) {
      this.applyAction(canvas, action, 'redo');
      this.undoStack.push(action);
    }
  }

  private applyAction(canvas: fabric.Canvas, action: CanvasAction, mode: 'undo' | 'redo') {
    if (action.type === 'add' && mode === 'undo') {
      canvas.remove(action.object);
    } else if (action.type === 'remove' && mode === 'undo') {
      console.log("redoing")
      canvas.add(action.object);
    }
    canvas.renderAll();
  }
}

function updateAlpha(rgba: string, newAlpha: number): string {
  const rgbaRegex = /rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3})(, ([0-1]?\.?\d*))?\)/;
  // Check if the input is a valid rgba color
  const matches = rgba.match(rgbaRegex);
  if (!matches) {
    throw new Error("Invalid RGBA color format");
  }

  // Extract the red, green, blue, and existing alpha values
  const [red, green, blue] = [matches[1], matches[2], matches[3]];

  // Clamp newAlpha between 0 and 1
  const clampedAlpha = Math.max(0, Math.min(1, newAlpha));

  // Return the updated rgba string
  return `rgba(${red}, ${green}, ${blue}, ${clampedAlpha})`;
}

const HIGHLIGHT_OPACITY = 0.6;

const App: React.FC = () => {

  const [activeBrush, setActiveBrush] = useState<BrushState | null>({ mode: "free" });
  const [brushColor, setBrushColor] = useState<string>('rgba(219, 39, 119, 1)');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const { editor, onReady } = useFabricJSEditor()

  const history = CanvasHistory.getInstance();

  const handleCanvasReady = (canvas: fabric.Canvas) => {
    onReady(canvas);
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = strokeWidth;
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.strokeLineCap = "round";

    // Track path creation for history
    canvas.on('path:created', onPathCreated);
  };

  const handleMenuAction = (actionType: string, ...args: any[]) => {
    const handler = actionHandlers[actionType];
    if (handler) {
      handler(editor, ...args);
    } else {
      console.error(`No handler for action type: ${actionType}`);
    }
  };

  const onPathCreated = (e: fabric.IEvent) => {
    const path = (e as any).path as fabric.Path;
    if (path) {
      history.add({type: 'add', object: path });
      console.log(history)
    }
  }

  const actionHandlers: ActionHandlers = {
    setDrawMode: (editor, mode: string) => {
      if (!editor || !editor.canvas) {
        console.warn('Canvas is not initialized');
        return;
      }
      let canvas = editor.canvas;
      // Reset the brush settings
      if (activeBrush) {
        if (activeBrush.listeners) {
          Object.keys(activeBrush.listeners).forEach(eventType => canvas.off(eventType, activeBrush.listeners![eventType]));
        }
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = strokeWidth;
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.strokeLineCap = "round";
      }

      // Toggle selected draw mode
      switch (mode) {
        case "select":
          canvas.isDrawingMode = false;
          setActiveBrush({ mode: mode })
          break;
        case "highlight":
          canvas.freeDrawingBrush.color = updateAlpha(brushColor, HIGHLIGHT_OPACITY)
          canvas.freeDrawingBrush.strokeLineCap = "square"
          setActiveBrush({ mode: mode })
          break;
        case "eraser":
          let isErasing = false;
          let objectsToRemove: Erasable[] = [];
          canvas.isDrawingMode = false;
          canvas.selection = false;

          const eraserListeners = {
            'mouse:down': (e: fabric.IEvent) => {
              isErasing = true;
            },
            'mouse:move': (e: fabric.IEvent) => {
              if (!isErasing) return;
              let pointer = canvas.getPointer(e.e);
              let path = new fabric.Path(`M ${pointer.x} ${pointer.y}`);
              const objects = canvas.getObjects();
              for (let obj of objects) {
                if (obj === path || objectsToRemove.some(item => item.object === obj)) continue;
                if (path.intersectsWithObject(obj)) {
                  objectsToRemove.push({object: obj, originalOpacity: obj.opacity || 1})
                  obj.set('opacity', 0.3)
                  canvas.renderAll();
                }
              }
            },
            'mouse:up': (e: fabric.IEvent) => {
              isErasing = false;
              if (objectsToRemove.length > 0) {
                for (let {object, originalOpacity} of objectsToRemove) {
                  object.set('opacity', originalOpacity)
                  history.add({type: 'remove', object: object});
                  canvas.remove(object)
                }
                console.log(history)
                objectsToRemove = [];
              }
            }
          };
          Object.keys(eraserListeners).forEach(eventType => {
            canvas.on(eventType, eraserListeners[eventType as keyof Listeners]);
          });
          setActiveBrush({ mode: mode, listeners: eraserListeners })
          break;
        default:
          setActiveBrush({ mode: mode })
          break;
      }
    },
    setStrokeWidth: (editor, newWidth: number) => {
      let canvas = editor?.canvas;
      if (canvas && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = newWidth;
        setStrokeWidth(newWidth);
      }
    },

    setBrushColor: (editor, newColor: string) => {
      let canvas = editor?.canvas;
      if (canvas) {
        if (activeBrush?.mode === "highlight") {
          console.log(updateAlpha(newColor, HIGHLIGHT_OPACITY))
          canvas.freeDrawingBrush.color = updateAlpha(newColor, HIGHLIGHT_OPACITY);
        } else {
          canvas.freeDrawingBrush.color = newColor;
        }
        setBrushColor(newColor);
      }
    },
    clearCanvas: (editor) => {
      let canvas = editor?.canvas;
      if (canvas) {
        for (let obj of canvas.getObjects()){
          history.add({type: 'remove', object: obj});
        }
        console.log(history)
        canvas.clear();
      }
    },
    undoAction: (editor) => {
      let canvas = editor?.canvas;
      if (canvas) {
        history.undo(canvas)
      }
    },
    redoAction: (editor) => {
      let canvas = editor?.canvas;
      if (canvas) {
        history.redo(canvas)
      }
    }
  };

  return (
    <main>
      <Toolbar onMenuAction={handleMenuAction} />
      <FabricJSCanvas className='pine-canvas absolute top-0 bottom-0 left-0 right-0 z-0' onReady={handleCanvasReady} />
    </main>
  );

}

export default App;

