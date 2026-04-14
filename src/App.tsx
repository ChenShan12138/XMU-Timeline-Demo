import { useState, useMemo, useEffect, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { defaultScript } from './defaultScript';
import { Clip, ScriptData, Track } from './types';
import { Upload, Play, Pause, Settings, Layers, Film, Mic, Music, Volume2, VolumeX, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

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
      trackId: 'track-video-1',
      name: item.speaker ? `${item.speaker} (Shot)` : `Scene ${index + 1}`
    });
    
    // Voice clip
    if (item.speaker && item.content) {
      clips.push({
        id: `voice-${index}`,
        type: 'voice',
        startFrame: currentFrame,
        durationFrames: defaultDuration,
        data: item,
        trackId: 'track-voice-1',
        name: `${item.speaker} (VO)`
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement | null}>({});

  const activeClip = useMemo(() => {
    return clips.find(c => c.type === 'video' && currentTime >= c.startFrame && currentTime < c.startFrame + c.durationFrames);
  }, [clips, currentTime]);

  const activeAudioClips = useMemo(() => {
    return tracks
      .filter(t => t.type === 'audio')
      .reduce((acc, track) => {
        const clip = clips.find(c => c.trackId === track.id && currentTime >= c.startFrame && currentTime < c.startFrame + c.durationFrames);
        if (clip) acc[track.id] = clip;
        return acc;
      }, {} as {[key: string]: Clip});
  }, [clips, currentTime, tracks]);

  useEffect(() => {
    if (videoRef.current && activeClip?.videoUrl) {
      const clipTime = (currentTime - activeClip.startFrame) / 30;
      if (Math.abs(videoRef.current.currentTime - clipTime) > 0.1) {
        videoRef.current.currentTime = clipTime;
      }
    }
    
    // Sync audio clips
    Object.entries(activeAudioClips).forEach(([trackId, clip]) => {
      const audioEl = audioRefs.current[trackId];
      if (audioEl && clip.audioUrl) {
        const clipTime = (currentTime - clip.startFrame) / 30;
        if (Math.abs(audioEl.currentTime - clipTime) > 0.1) {
          audioEl.currentTime = clipTime;
        }
      }
    });
  }, [currentTime, activeClip, activeAudioClips]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
    
    // Play/Pause audio
    tracks.forEach(track => {
      if (track.type === 'audio') {
        const audioEl = audioRefs.current[track.id];
        if (audioEl) {
          if (isPlaying && activeAudioClips[track.id]?.audioUrl && !track.muted) {
            audioEl.play().catch(() => {});
          } else {
            audioEl.pause();
          }
        }
      }
    });
  }, [isPlaying, activeAudioClips, tracks]);

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
        setCurrentTime(0);
        setIsPlaying(false);
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClipId) return;
    
    const url = URL.createObjectURL(file);
    setClips(prev => prev.map(c => 
      c.id === selectedClipId ? { ...c, videoUrl: url } : c
    ));
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClipId) return;
    
    const url = URL.createObjectURL(file);
    setClips(prev => prev.map(c => 
      c.id === selectedClipId ? { ...c, audioUrl: url, name: file.name } : c
    ));
  };

  const addAudioClip = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    const lastClipInTrack = [...clips].filter(c => c.trackId === trackId).sort((a, b) => b.startFrame - a.startFrame)[0];
    const startFrame = lastClipInTrack ? lastClipInTrack.startFrame + lastClipInTrack.durationFrames : 0;
    
    const newClip: Clip = {
      id: `audio-${Date.now()}`,
      type: track.subType as any || 'sfx',
      startFrame,
      durationFrames: 150, // 5 seconds default
      trackId,
      name: 'New Audio Clip'
    };
    
    setClips(prev => [...prev, newClip]);
    setSelectedClipId(newClip.id);
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
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the timeline?")) {
                setScriptData(defaultScript);
                setClips(parseScriptToClips(defaultScript));
                setCurrentTime(0);
                setIsPlaying(false);
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 rounded text-red-400 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
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
                  {activeClip?.videoUrl ? (
                    <video 
                      ref={videoRef}
                      src={activeClip.videoUrl}
                      className="max-w-full max-h-full"
                      muted // Muted for auto-play compatibility if needed, though we control it
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-[#b0b0b0] mb-2">Frame: {currentTime}</p>
                      {activeClip ? (
                        <div className="border border-[#303030] p-4 rounded bg-[#1d1d1d]">
                          <p className="text-lg font-bold">{activeClip.data.speaker || 'Scene'}</p>
                          <p className="text-md text-gray-400">{activeClip.data.content || 'Action/Move'}</p>
                          <p className="text-xs text-gray-500 mt-2">Shot: {activeClip.data.shot_type}</p>
                        </div>
                      ) : (
                        <p className="text-[#b0b0b0]">No active clip at this time</p>
                      )}
                    </div>
                  )}
                  
                  {/* Playback Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1d1d1d]/80 backdrop-blur px-4 py-2 rounded-full border border-[#303030]">
                    <div className="text-xs font-mono text-gray-300 min-w-[80px] text-center">
                      {Math.floor(currentTime / 1800).toString().padStart(2, '0')}:
                      {Math.floor((currentTime % 1800) / 30).toString().padStart(2, '0')}:
                      {(currentTime % 30).toString().padStart(2, '0')}
                    </div>
                    <div className="w-px h-4 bg-[#303030]" />
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
                        <label className="block text-xs text-[#b0b0b0] mb-1">{selectedClip.type === 'video' ? 'Speaker' : 'Name'}</label>
                        <input 
                          type="text" 
                          value={(selectedClip.type === 'video' ? selectedClip.data?.speaker : selectedClip.name) || ''} 
                          onChange={(e) => selectedClip.type === 'video' ? handleClipDataChange('speaker', e.target.value) : setClips(prev => prev.map(c => c.id === selectedClipId ? { ...c, name: e.target.value } : c))}
                          className="w-full bg-[#0a0a0a] border border-[#303030] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                        />
                      </div>
                      {selectedClip.type === 'video' && (
                        <>
                          <div>
                            <label className="block text-xs text-[#b0b0b0] mb-1">Content</label>
                            <textarea 
                              value={selectedClip.data?.content || ''} 
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
                                value={selectedClip.data?.shot_type || ''} 
                                onChange={(e) => handleClipDataChange('shot_type', e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#303030] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-[#b0b0b0] mb-1">Shot Blend</label>
                              <input 
                                type="text" 
                                value={selectedClip.data?.shot_blend || ''} 
                                onChange={(e) => handleClipDataChange('shot_blend', e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#303030] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {selectedClip.data?.actions && (
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

                      <div className="pt-4 mt-4 border-t border-[#303030]">
                        <button 
                          onClick={() => {
                            setClips(prev => prev.filter(c => c.id !== selectedClipId));
                            setSelectedClipId(null);
                          }}
                          className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-medium rounded border border-red-900/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Clip
                        </button>
                      </div>

                      {selectedClip.type === 'video' && (
                        <div className="pt-2 border-t border-[#303030]">
                          <label className="block text-xs text-[#b0b0b0] mb-2">Clip Video</label>
                          {selectedClip.videoUrl ? (
                            <div className="relative group rounded overflow-hidden border border-[#303030]">
                              <video src={selectedClip.videoUrl} className="w-full aspect-video object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-white text-black px-3 py-1 rounded text-xs font-medium">
                                  Change Video
                                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-[#303030] rounded-lg cursor-pointer hover:bg-[#252525] transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Film className="w-8 h-8 text-[#505050] mb-2" />
                                <p className="text-xs text-[#b0b0b0]">Click to upload video</p>
                              </div>
                              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                            </label>
                          )}
                        </div>
                      )}

                      {(selectedClip.type === 'voice' || selectedClip.type === 'music' || selectedClip.type === 'sfx') && (
                        <div className="pt-2 border-t border-[#303030]">
                          <label className="block text-xs text-[#b0b0b0] mb-2">Clip Audio</label>
                          {selectedClip.audioUrl ? (
                            <div className="bg-[#0a0a0a] border border-[#303030] rounded p-3">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#1a1a1a] rounded">
                                  {selectedClip.type === 'voice' ? <Mic className="w-4 h-4 text-blue-400" /> : 
                                   selectedClip.type === 'music' ? <Music className="w-4 h-4 text-green-400" /> : 
                                   <Volume2 className="w-4 h-4 text-yellow-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white truncate">{selectedClip.name || 'Audio File'}</p>
                                  <p className="text-[10px] text-[#b0b0b0]">{(selectedClip.durationFrames / 30).toFixed(2)}s</p>
                                </div>
                              </div>
                              <label className="block w-full text-center cursor-pointer bg-[#303030] hover:bg-[#404040] text-white py-1.5 rounded text-xs font-medium transition-colors">
                                Change Audio
                                <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-[#303030] rounded-lg cursor-pointer hover:bg-[#252525] transition-colors">
                              <div className="flex flex-col items-center justify-center">
                                <Music className="w-6 h-6 text-[#505050] mb-2" />
                                <p className="text-xs text-[#b0b0b0]">Click to upload audio</p>
                              </div>
                              <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                            </label>
                          )}
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
                  className="flex-1 overflow-hidden relative h-8 cursor-text" 
                  onClick={handleRulerClick}
                  ref={rulerRef}
                >
                  <div className="absolute inset-0 flex" style={{ width: 3000 * zoom }}>
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="shrink-0 border-l border-[#303030] relative" style={{ width: 30 * zoom }}>
                        <span className="absolute left-1 top-0.5 text-[10px] text-[#b0b0b0] font-mono pointer-events-none">
                          {Math.floor(i / 60).toString().padStart(2, '0')}:{(i % 60).toString().padStart(2, '0')}
                        </span>
                        {/* Sub-ticks */}
                        <div className="absolute left-1/2 top-4 bottom-0 w-px bg-[#303030]/50" />
                        <div className="absolute left-1/4 top-5 bottom-0 w-px bg-[#303030]/30" />
                        <div className="absolute left-3/4 top-5 bottom-0 w-px bg-[#303030]/30" />
                      </div>
                    ))}
                    
                    {/* Playhead in Ruler */}
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
                      style={{ left: currentTime * zoom }}
                    >
                      <div className="w-3 h-4 bg-red-500 absolute top-0 -left-1.5 rounded-b-sm" />
                    </div>
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
                          {track.type === 'audio' && (track.subType === 'music' || track.subType === 'sfx') && (
                            <button 
                              onClick={() => addAudioClip(track.id)}
                              className="p-1 hover:bg-[#303030] rounded text-[#b0b0b0] transition-colors"
                              title="Add Audio Clip"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => setTracks(prev => prev.map(t => t.id === track.id ? { ...t, muted: !t.muted } : t))}
                            className={`p-1 hover:bg-[#303030] rounded ${track.muted ? 'text-red-500' : 'text-[#b0b0b0]'}`}
                            title={track.muted ? "Unmute" : "Mute"}
                          >
                            {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </button>
                          <button 
                            onClick={() => toggleTrackVisibility(track.id)}
                            className="p-1 hover:bg-[#303030] rounded text-[#b0b0b0]"
                          >
                            {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      {track.type === 'audio' && (
                        <audio 
                          ref={el => { audioRefs.current[track.id] = el; }}
                          src={activeAudioClips[track.id]?.audioUrl}
                          className="hidden"
                        />
                      )}
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
                              {clip.name || (clip.data?.speaker ? `${clip.data.speaker}: ${clip.data.content}` : 'Action')}
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

                    {/* Playhead Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                      style={{ left: currentTime * zoom }}
                    />
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
