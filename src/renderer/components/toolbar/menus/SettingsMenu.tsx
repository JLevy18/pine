import React, { forwardRef, useEffect, useState } from "react";
import { Settings } from '../../../settings';

interface SettingsMenuProps {
  id: string;
  toggleDirection: () => void;
}

const SettingsMenu = forwardRef<HTMLDivElement, SettingsMenuProps>(({ id, toggleDirection }, ref) => {

  const DEFAULT_TOGGLE_PINE_KEY = "Ctrl+Alt+P";
  const HOTKEY_BLACKLIST = ["Ctrl+S", "Ctrl+Z", "Ctrl+Y"];
  const MODIFIER_PRIORITY = ["Ctrl", "Shift", "Alt"];

  const [togglePineKey, setTogglePineKey] = useState(DEFAULT_TOGGLE_PINE_KEY);
  const [recording, setRecording] = useState(false);
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  const [previousKey, setPreviousKey] = useState<string>("Ctrl+Alt+P");
  const [temporaryMessage, setTemporaryMessage] = useState<string | null>(null);

  const sortKeys = (keys: string[]) => {
    return keys.sort((a, b) => {
      const aIndex = MODIFIER_PRIORITY.indexOf(a);
      const bIndex = MODIFIER_PRIORITY.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return 0;
      }
    });
  };

  // Function to start recording keystrokes
  const startRecording = (e: React.MouseEvent<HTMLDivElement>) => {
    setPreviousKey(togglePineKey);
    setTogglePineKey("[ ___ ]");
    setRecording(true);
    (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e5e5";
    window.electron.ipcRenderer.sendMessage('start-record-hotkey');
  };

  // Function to stop recording keystrokes
  const stopRecording = () => {
    setKeysPressed([]);
    setRecording(false);
    const element = document.getElementById("toggle-pine-binding");
    if (element) {
      element.style.borderColor = "#a3a3a3"; // Default border color
    }
    window.electron.ipcRenderer.sendMessage('stop-record-hotkey');
  };

  const resetHotkey = async () => {
    try {
      const settings: Settings = await window.electron.ipcRenderer.getSettings();
      settings.hotkeys.togglePine = DEFAULT_TOGGLE_PINE_KEY;
      await window.electron.ipcRenderer.putSettings(settings);
      setTogglePineKey(DEFAULT_TOGGLE_PINE_KEY);
    } catch (error) {
      setTogglePineKey(previousKey);
      console.error("Failed to update settings.json:", error);
    }
  }

  const applyTemporaryStyles = (element: HTMLElement | null, response: string, temporaryText: string | null) => {
    if (element){
      if (response === "OK"){
        element.classList.add("hotkey-bound");
        setTimeout(() => {
            element.classList.remove("hotkey-bound");
        }, 500); // Duration to keep the invalid styles
      } else {
        setTemporaryMessage(temporaryText);
        element.classList.add("hotkey-invalid");
        setTimeout(() => {
            element.classList.remove("hotkey-invalid");
            setTemporaryMessage(null);
        }, 500); // Duration to keep the invalid styles
      }
    }
  };

  // Add and remove keydown event listener for recording keystrokes
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (recording) {
        const keys = [...keysPressed];
        const key = e.key.toUpperCase();

        if (e.ctrlKey && !keys.includes("Ctrl")) keys.push("Ctrl");
        if (e.altKey && !keys.includes("Alt")) keys.push("Alt");
        if (e.shiftKey && !keys.includes("Shift")) keys.push("Shift");

        if (!keys.some(k => /^[A-Z0-9]$/.test(k)) && /^[A-Z0-9]$/.test(key)) keys.push(key); // Only add the first alphanumeric key
        if (key.startsWith("F") && !isNaN(Number(key.substring(1))) && !keys.includes(key)) keys.push(key);

        setKeysPressed(keys);
      }
    };

    const handleKeyup = async (e: KeyboardEvent) => {
      if (recording) {
        const isModifierOnly = keysPressed.every(k => k === "Ctrl" || k === "Alt" || k === "Shift");
        const sortedKeys = sortKeys(keysPressed);
        const hotkey = sortedKeys.join("+");

        const element = document.getElementById("toggle-pine-binding");

        if (!isModifierOnly && !HOTKEY_BLACKLIST.includes(hotkey)) {
          try {
            const settings: Settings = await window.electron.ipcRenderer.getSettings();
            settings.hotkeys.togglePine = hotkey;
            await window.electron.ipcRenderer.putSettings(settings);
            setTogglePineKey(hotkey);
          } catch (error) {
            setTogglePineKey(previousKey);
            console.error("Failed to update settings.json:", error);
            applyTemporaryStyles(element, "Code: 500", "Error");
          }
        } else {
          setTogglePineKey(previousKey);
          applyTemporaryStyles(element, "Code: 400", "Invalid");
        }

        stopRecording();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("keyup", handleKeyup);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("keyup", handleKeyup);
    };
  }, [recording, keysPressed]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings: Settings = await window.electron.ipcRenderer.getSettings();
        setTogglePineKey(settings.hotkeys.togglePine || "Ctrl+Alt+P");
      } catch (error) {
        console.error("Failed to fetch settings.json:", error);
      }
    };

    fetchSettings();
  }, []); // Empty dependency array ensures this runs only once, before the component mounts

  return (
    <div id={id}
      className="menu-container select-none"
      onClick={(e) => { e.stopPropagation() }}
      ref={ref}
    >
      <h1 className="text-neutral-300 text-center font-bold underline underline-offset-3">Settings</h1>
      <div className="hotkey-header m-1">
        <h1 className="text-neutral-300 text-sm font-semibold">Hotkeys</h1>
        <div className="w-full h-[0.05rem] bg-neutral-500"></div>
      </div>
      <div className="flex justify-between items-center text-neutral-300 my-1">
        <div className=" text-neutral-300 text-xs font-bold select-none mx-2">
          Toggle Pine
        </div>
        <div
          id="toggle-pine-binding"
          className="text-neutral-300 text-xs text-center font-bold mx-2 min-w-20 border border-neutral-400 px-1 py-0.5 rounded hover:cursor-pointer transition-all ease-in-out"
          onClick={startRecording}
        >
          {temporaryMessage  || togglePineKey}
        </div>
        <div onClick={resetHotkey} className="text-xs font-semibold bg-blue-600 py-1 px-2.5 rounded-xl hover:cursor-pointer hover:bg-blue-700 transition-all ease-in-out">
          Reset
        </div>
      </div>
    </div>
  );
}
);

export default SettingsMenu;
