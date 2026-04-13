import { useState, useMemo, useEffect, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { defaultScript } from './defaultScript';
import { Clip, ScriptData, Track } from './types';
import { Upload, Play, Pause, Settings, Layers, Film, Mic, Music, Volume2, Eye, EyeOff } from 'lucide-react';

// Helper to parse script to clips
function parseScriptToClips(script: ScriptData): Clip[] {
  const clips: Clip[] = [];
  let currentFrame = 0;
  const defaultDuration = 90; // 3 seconds at 30fps
  
  if (!script || !script[0] || !script[0].scene) return clips;
  
  script[0].scene.forEach((item, index) => {
    // Video clip
    clips.push({
      id: `video-${index}`,
      type: 'video',
      startFrame: currentFrame,
      durationFrames: defaultDuration,
      data: item,
      trackId: 'track-video-1'
    });
    
    // Voice clip
    if (item.speaker && item.content) {
      clips.push({
        id: `voice-${index}`,
        type: 'voice',
        startFrame: currentFrame,
        durationFrames: defaultDuration,
        data: item,
        trackId: 'track-voice-1'
      });
    }
    
    currentFrame += defaultDuration;
  });
  
  return clips;
}

const initialTracks: Track[] = [
  { id: 'track-video-1', name: 'V1', type: 'video', visible: true, muted: false },
  { id: 'track-voice-1', name: 'A1 (配音)', type: 'audio', subType: 'voice', visible: true, muted: false },
  { id: 'track-music-1', name: 'A2 (配乐)', type: 'audio', subType: 'music', visible: true, muted: false },
  { id: 'track-sfx-1', name: 'A3 (音效)', type: 'audio', subType: 'sfx', visible: true, muted: false },
];

export default function App() {
  const [scriptData, setScriptData] = useState<ScriptData>(defaultScript);
  const [clips, setClips] = useState<Clip[]>(() => parseScriptToClips(defaultScript));
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(2); // pixels per frame

  const selectedClip = useMemo(() => clips.find(c => c.id === selectedClipId), [clips, selectedClipId]);

  // Dragging state
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartFrame, setDragStartFrame] = useState(0);
  
  // Resizing state
  const [resizingClipId, setResizingClipId] = useState<string | null>(null);
  const [resizeEdge, setResizeEdge] = useState<'left' | 'right' | null>(null);
  const [resizeStartFrames, setResizeStartFrames] = useState({ start: 0, duration: 0 });

  const headersRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headersRef.current) {
      headersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (rulerRef.current) {
      rulerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setScriptData(json);
        setClips(parseScriptToClips(json));
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const toggleTrackVisibility = (trackId: string) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, visible: !t.visible } : t));
  };

  const handleClipMouseDown = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setDraggingClipId(clip.id);
    setDragStartX(e.clientX);
    setDragStartFrame(clip.startFrame);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, clip: Clip, edge: 'left' | 'right') => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setResizingClipId(clip.id);
    setResizeEdge(edge);
    setDragStartX(e.clientX);
    setResizeStartFrames({ start: clip.startFrame, duration: clip.durationFrames });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingClipId) {
        const dx = e.clientX - dragStartX;
        const dFrames = Math.round(dx / zoom);
        
        setClips(prev => {
          const newClips = prev.map(c => ({ ...c }));
          const draggedClip = newClips.find(c => c.id === draggingClipId);
          if (!draggedClip) return prev;
          
          const newStartFrame = dragStartFrame + dFrames;
          
          const trackClips = newClips.filter(c => c.trackId === draggedClip.trackId);
          
          const getCenter = (clip: Clip) => {
             if (clip.id === draggingClipId) {
                return newStartFrame + clip.durationFrames / 2;
             }
             return clip.startFrame + clip.durationFrames / 2;
          };
          
          trackClips.sort((a, b) => getCenter(a) - getCenter(b));
          
          let currentFrame = 0;
          trackClips.forEach(clip => {
             clip.startFrame = currentFrame;
             currentFrame += clip.durationFrames;
          });
          
          return newClips.map(c => trackClips.find(tc => tc.id === c.id) || c);
        });
      } else if (resizingClipId && resizeEdge) {
        const dx = e.clientX - dragStartX;
        const dFrames = Math.round(dx / zoom);
        
        setClips(prev => {
          const newClips = prev.map(c => ({ ...c }));
          const resizedClip = newClips.find(c => c.id === resizingClipId);
          if (!resizedClip) return prev;
          
          if (resizeEdge === 'left') {
            const newDuration = Math.max(10, resizeStartFrames.duration - dFrames);
            resizedClip.durationFrames = newDuration;
          } else {
            const newDuration = Math.max(10, resizeStartFrames.duration + dFrames);
            resizedClip.durationFrames = newDuration;
          }
          
          const trackClips = newClips.filter(c => c.trackId === resizedClip.trackId);
          trackClips.sort((a, b) => a.startFrame - b.startFrame);
          
          let currentFrame = 0;
          trackClips.forEach(clip => {
             clip.startFrame = currentFrame;
             currentFrame += clip.durationFrames;
          });
          
          return newClips.map(c => trackClips.find(tc => tc.id === c.id) || c);
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingClipId(null);
      setResizingClipId(null);
      setResizeEdge(null);
    };

    if (draggingClipId || resizingClipId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingClipId, resizingClipId, resizeEdge, dragStartX, dragStartFrame, resizeStartFrames, zoom]);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(t => t + 1);
      }, 1000 / 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleClipDataChange = (field: string, value: string) => {
    if (!selectedClipId) return;
    setClips(prev => prev.map(c => 
      c.id === selectedClipId 
        ? { ...c, data: { ...c.data, [field]: value } }
        : c
    ));
  };

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
    setCurrentTime(Math.max(0, Math.round(x / zoom)));
  };

  return (
    <div className="h-screen w-full bg-[#1d1d1d] text-gray-200 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Bar */}
      <header className="h-12 bg-[#1d1d1d] border-b border-[#000000] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-[#b0b0b0]" />
          <span className="font-semibold text-sm tracking-wide">Automated Filming Editor</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#303030] hover:bg-[#404040] rounded cursor-pointer transition-colors text-sm">
            <Upload className="w-4 h-4 text-[#b0b0b0]" />
            <span>Upload Script</span>
            <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="vertical" className="h-full">
          {/* Top Half: Preview & Details */}
          <Panel defaultSize={55} minSize={30}>
            <Group orientation="horizontal">
              {/* Preview Window */}
              <Panel defaultSize={65} minSize={30} className="bg-[#1d1d1d] flex flex-col relative">
                <div className="h-8 border-b border-[#303030] flex items-center px-3 shrink-0">
                  <span className="text-xs font-medium text-[#b0b0b0] uppercase tracking-wider">Preview</span>
                </div>
                <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
                  {/* Mock Preview Content */}
                  <div className="text-center">
                    <p className="text-[#b0b0b0] mb-2">Frame: {currentTime}</p>
                    {selectedClip ? (
                      <div className="border border-[#303030] p-4 rounded bg-[#1d1d1d]">
                        <p className="text-lg font-bold">{selectedClip.data.speaker || 'Scene'}</p>
                        <p className="text-md text-gray-400">{selectedClip.data.content || 'Action/Move'}</p>
                        <p className="text-xs text-gray-500 mt-2">Shot: {selectedClip.data.shot_type}</p>
                      </div>
                    ) : (
                      <p className="text-[#b0b0b0]">No clip selected</p>
                    )}
                  </div>
                  
                  {/* Playback Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1d1d1d]/80 backdrop-blur px-4 py-2 rounded-full border border-[#303030]">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white text-[#b0b0b0] transition-colors">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </Panel>

              <Separator className="w-1 bg-[#000000] hover:bg-[#303030] transition-colors cursor-col-resize" />

              {/* Details Window */}
              <Panel defaultSize={35} minSize={20} className="bg-[#1d1d1d] flex flex-col border-l border-[#000000]">
                <div className="h-8 border-b border-[#303030] flex items-center px-3 shrink-0">
                  <span className="text-xs font-medium text-[#b0b0b0] uppercase tracking-wider">Details</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedClip ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#b0b0b0] mb-1">Speaker</label>
                        <input 
                          type="text" 
                          value={selectedClip.data.speaker || ''} 
                          onChange={(e) => handleClipDataChange('speaker', e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-[#303030] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#b0b0b0] mb-1">Content</label>
                        <textarea 
                          value={selectedClip.data.content || ''} 
                          onChange={(e) => handleClipDataChange('content', e.target.value)}
                          rows={3}
                          className="w-full bg-[#0a0a0a] border border-[#303030] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#b0b0b0] mb-1">Shot Type</label>
                          <input 
                            type="text" 
                            value={selectedClip.data.shot_type || ''} 
                            onChange={(e) => handleClipDataChange('shot_type', e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#303030] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#b0b0b0] mb-1">Shot Blend</label>
                          <input 
                            type="text" 
                            value={selectedClip.data.shot_blend || ''} 
                            onChange={(e) => handleClipDataChange('shot_blend', e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#303030] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                          />
                        </div>
                      </div>
                      {selectedClip.data.actions && (
                        <div>
                          <label className="block text-xs text-[#b0b0b0] mb-2">Actions</label>
                          <div className="space-y-2">
                            {selectedClip.data.actions.map((act, i) => (
                              <div key={i} className="bg-[#0a0a0a] border border-[#303030] rounded p-2 text-xs">
                                <span className="font-semibold text-gray-300">{act.character}</span>: {act.action}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#b0b0b0] text-sm">
                      Select a clip to edit details
                    </div>
                  )}
                </div>
              </Panel>
            </Group>
          </Panel>

          <Separator className="h-1 bg-[#000000] hover:bg-[#303030] transition-colors cursor-row-resize" />

          {/* Bottom Half: Timeline */}
          <Panel defaultSize={45} minSize={20} className="bg-[#1d1d1d] flex flex-col border-t border-[#000000]">
            {/* Timeline Toolbar */}
            <div className="h-8 border-b border-[#303030] flex items-center px-3 justify-between shrink-0 bg-[#1a1a1a]">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-[#b0b0b0] uppercase tracking-wider">Timeline</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#b0b0b0]">Zoom:</span>
                  <input 
                    type="range" 
                    min="0.5" max="5" step="0.1" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-24 accent-gray-500"
                  />
                </div>
              </div>
              <div className="text-xs text-[#b0b0b0] font-mono">
                30 FPS
              </div>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Top: Ruler area */}
              <div className="flex shrink-0 bg-[#1a1a1a] border-b border-[#303030]">
                {/* Empty space above track headers */}
                <div className="w-48 shrink-0 border-r border-[#303030]" />
                {/* Time Ruler */}
                <div 
                  className="flex-1 overflow-hidden relative h-6 cursor-text" 
                  onClick={handleRulerClick}
                  ref={rulerRef}
                >
                  <div className="absolute inset-0 flex" style={{ width: 3000 * zoom }}>
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="shrink-0 border-l border-[#303030] text-[10px] text-[#b0b0b0] pl-1 pt-1 pointer-events-none" style={{ width: 30 * zoom }}>
                        {i}s
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom: Tracks area */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Track Headers */}
                <div 
                  className="w-48 shrink-0 border-r border-[#303030] bg-[#1a1a1a] flex flex-col overflow-hidden z-20"
                  ref={headersRef}
                >
                  {tracks.map((track, i) => (
                    <div key={track.id} className={`h-24 shrink-0 border-b border-[#303030] flex flex-col justify-center px-3 ${track.type === 'video' && i === 0 ? 'border-b-2 border-b-[#555]' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {track.type === 'video' ? <Film className="w-4 h-4 text-[#b0b0b0]" /> : 
                           track.subType === 'voice' ? <Mic className="w-4 h-4 text-[#b0b0b0]" /> :
                           track.subType === 'music' ? <Music className="w-4 h-4 text-[#b0b0b0]" /> :
                           <Volume2 className="w-4 h-4 text-[#b0b0b0]" />}
                          <span className="text-xs font-medium text-gray-300">{track.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => toggleTrackVisibility(track.id)}
                            className="p-1 hover:bg-[#303030] rounded text-[#b0b0b0]"
                          >
                            {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracks Content */}
                <div 
                  className="flex-1 overflow-auto relative bg-[#141414]"
                  onScroll={handleTimelineScroll}
                >
                  <div className="relative" style={{ width: 3000 * zoom }}>
                    {tracks.map((track, i) => (
                      <div key={track.id} className={`h-24 border-b border-[#303030] relative ${track.type === 'video' && i === 0 ? 'border-b-2 border-b-[#555]' : ''} ${!track.visible ? 'opacity-30' : ''}`}>
                        {clips.filter(c => c.trackId === track.id).map(clip => (
                          <div
                            key={clip.id}
                            onMouseDown={(e) => handleClipMouseDown(e, clip)}
                            className={`absolute top-2 bottom-2 rounded border overflow-hidden transition-colors ${
                              selectedClipId === clip.id 
                                ? 'border-white z-10 shadow-[0_0_0_1px_rgba(255,255,255,1)]' 
                                : 'border-[#404040] hover:border-gray-400'
                            } ${
                              clip.type === 'video' ? 'bg-[#2a4365]/80' : 'bg-[#276749]/80'
                            } ${draggingClipId === clip.id ? 'opacity-80 cursor-grabbing' : 'cursor-grab'}`}
                            style={{
                              left: clip.startFrame * zoom,
                              width: clip.durationFrames * zoom,
                            }}
                          >
                            {/* Left Resize Handle */}
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/20 z-20"
                              onMouseDown={(e) => handleResizeMouseDown(e, clip, 'left')}
                            />
                            
                            <div className="px-2 py-1 text-[10px] font-medium text-white truncate bg-black/20 pointer-events-none">
                              {clip.data.speaker ? `${clip.data.speaker}: ${clip.data.content}` : 'Action'}
                            </div>
                            
                            {/* Right Resize Handle */}
                            <div 
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/20 z-20"
                              onMouseDown={(e) => handleResizeMouseDown(e, clip, 'right')}
                            />
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Playhead */}
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                      style={{ left: currentTime * zoom }}
                    >
                      <div className="w-3 h-3 bg-red-500 absolute -top-1.5 -left-1.5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
