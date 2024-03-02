import './styles/App.css';

import { fabric } from 'fabric';
import { FabricJSCanvas, FabricJSEditor, useFabricJSEditor } from 'fabricjs-react';
import React from 'react';
import Toolbar from './components/toolbar/Toolbar';


interface ActionHandler {
  (editor: FabricJSEditor | undefined, ...args: any[]): void;
}

interface ActionHandlers {
  [key: string]: ActionHandler;
}

const App: React.FC = () => {

  const { editor, onReady } = useFabricJSEditor()

  const handleCanvasReady = (canvas: fabric.Canvas) => {
    onReady(canvas);

    // Set default canvas settings
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 4;
    canvas.freeDrawingBrush.color = '#DB2777';
  };

  const handleMenuAction = (actionType: string, ...args: any[]) => {
    const handler = actionHandlers[actionType];
    if (handler) {
      handler(editor, ...args);
    } else {
      console.error(`No handler for action type: ${actionType}`);
    }
  };

  const actionHandlers: ActionHandlers = {
    setDrawMode: (editor, mode: string) => {
      let canvas = editor?.canvas;
      if (canvas) {
        if (mode === "select") {
          canvas.isDrawingMode = false;
        } else if (mode === "highlight") {
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.color = convertHexToOpacity(canvas.freeDrawingBrush.color, 80);
          canvas.freeDrawingBrush.strokeLineCap = 'square';
        } else if (mode === "eraser") {
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.strokeLineCap = 'round';
        } else {
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.strokeLineCap = 'round'
          canvas.freeDrawingBrush.color = convertHexToOpacity(canvas.freeDrawingBrush.color, 100)
        }
      }
    },
    setStrokeWidth: (editor, newWidth: number) => {
      let canvas = editor?.canvas;
      if (canvas && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = newWidth;
      }
    },

    setBrushColor: (editor, newColor: string) => {
      let canvas = editor?.canvas;
      if (canvas) {
        canvas.freeDrawingBrush.color = newColor;
      }
    },
    clearCanvas: () => {
      let canvas = editor?.canvas;
      if (canvas) {
        canvas.clear();
      }
    }

    // Add other handlers here
    // e.g., addCircle: () => { ... }
  };

  return (
    <main>
      <Toolbar onMenuAction={handleMenuAction} />
      <FabricJSCanvas className='pine-canvas absolute top-0 bottom-0 left-0 right-0 z-0' onReady={handleCanvasReady} />
    </main>
  );

}

export default App;

function convertHexToOpacity(hexColor: string, opacityPercentage: number): string {
  if (!/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(hexColor)) {
    throw new Error('Invalid hex color code');
  }
  if (opacityPercentage < 0 || opacityPercentage > 100) {
    throw new Error('Opacity percentage must be between 0 and 100');
  }

  // Convert opacity percentage to decimal, then to a 0-255 scale, and finally to hexadecimal
  const opacityHex = Math.round(opacityPercentage / 100 * 255).toString(16).padStart(2, '0').toUpperCase();

  // Remove existing opacity if present
  const hexColorWithoutOpacity = hexColor.substring(0, 7).toUpperCase();

  return hexColorWithoutOpacity + opacityHex;
}
