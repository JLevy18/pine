interface Position {
  x: number;
  y: number;
}

interface BrushState {
  mode: string;
  listeners?: { [key: string]: (event: fabric.IEvent) => void };
}

interface Listeners {
  'mouse:down': (e: fabric.IEvent) => void;
  'mouse:move': (e: fabric.IEvent) => void;
  'mouse:up': (e: fabric.IEvent) => void;
}

declare enum Category {
  DRAW = "Draw",
  FORMAT = "Format",
  UTILITY = "Utility",
  SETTINGS = "Settings"
}

interface Option {
  category: Category;
  id: string;
  className?: string;
  icon: JSX.Element | null;
  selected: boolean;
}

type SelectedOptions = {
  [key in Category]: string | null;
}
