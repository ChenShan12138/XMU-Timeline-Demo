export type SceneItem = {
  speaker?: string;
  content?: string;
  shot_blend?: string;
  shot?: string;
  shot_type?: string;
  Follow?: number;
  actions?: any[];
  "current position"?: any[];
  motion_description?: string;
  move?: any[];
  camera?: number;
};

export type ScriptData = {
  "scene information": any;
  "initial position": any[];
  scene: SceneItem[];
}[];

export type ClipType = 'video' | 'voice' | 'music' | 'sfx';

export type Clip = {
  id: string;
  type: ClipType;
  startFrame: number;
  durationFrames: number;
  data: SceneItem;
  trackId: string;
};

export type Track = {
  id: string;
  name: string;
  type: 'video' | 'audio';
  subType?: 'voice' | 'music' | 'sfx';
  visible: boolean;
  muted: boolean;
};
