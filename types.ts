export enum AppStep {
  UPLOAD = 'UPLOAD',
  SELECT_FEATURE = 'SELECT_FEATURE',
  CONFIGURE = 'CONFIGURE',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export enum FeatureType {
  MULTI_ANGLE = 'MULTI_ANGLE',
  SCENE_PLACEMENT = 'SCENE_PLACEMENT',
}

export enum AngleOption {
  FRONT = 'Front view (straight on)',
  BACK = 'Rear view (back side)',
  LEFT = 'Left side view',
  RIGHT = 'Right side view',
  SLANTED = 'Slightly tilted side view (15-30 degrees)',
  THREE_QUARTER = '3/4 isometric view',
  TOP_DOWN = 'Top-down overhead view',
  LOW_ANGLE = 'Low angle view (looking slightly up)',
}

export enum RoomOption {
  LIVING_ROOM = 'Living room',
  DINING_ROOM = 'Dining room',
  BEDROOM = 'Bedroom',
}

export interface CostInfo {
  usd: string;
  vnd: string;
}

export interface GenerationResult {
  imageUrl: string;
  cost: CostInfo;
}

// Interface for Google AI Studio embedded features
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}