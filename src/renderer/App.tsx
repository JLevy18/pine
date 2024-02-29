import './styles/App.css';

import React, { useEffect } from 'react';
import Toolbar from './components/toolbar/Toolbar';
import { FabricJSCanvas, FabricJSEditor, useFabricJSEditor } from 'fabricjs-react';

const App: React.FC = () => {

  const { editor, onReady } = useFabricJSEditor()

  const handleCanvasReady = (canvas: fabric.Canvas) => {
    onReady(canvas);
    canvas.isDrawingMode = true; // Enable drawing mode
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 10;
    }
  };

  const onAddRectangle = () => {
    editor?.addRectangle()
    console.log("ran")
  }

  return (
    <main>
      <Toolbar onAddRectangle={onAddRectangle} />
      <FabricJSCanvas className='pine-canvas absolute top-0 bottom-0 left-0 right-0 z-0' onReady={handleCanvasReady}/>
    </main>
  );

}

export default App;
