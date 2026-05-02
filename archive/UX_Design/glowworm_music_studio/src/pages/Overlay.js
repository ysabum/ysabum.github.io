import React, { useState, useEffect } from 'react';
import { Mp3Encoder } from '@breezystack/lamejs';
import "../css/Overlay.css";
import overlayImg from "../images/overlay.png";
import WaveformEditor from "../components/WaveformEditor";
import Timeline from "../components/Timeline";

export default function Overlay({ onBack }) {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openPanels, setOpenPanels] = useState([]);
  const [progress, setProgress] = useState("");
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [mixUrl, setMixUrl] = useState(null);
  const audioRef = React.useRef(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  /* Track Model: Handle file uploads and create track objects */
  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);

    selected.forEach((file) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);

      // Unique ID for each track
      const trackId = crypto.randomUUID();

      // Initial track metadata
      const newTrack = {
        id: trackId,
        file,
        url,
        volume: 0,
        startTime: 0,
        trimStart: 0,
        trimEnd: null,
        duration: 0, // updated when metadata loads
      };
      
      // Load duration asynchronously
      audio.addEventListener("loadedmetadata", () => {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === trackId
              ? { ...t, duration: audio.duration }
              : t
          )
        );
      });
      setTracks((prev) => [...prev, newTrack]);
    });
  };

  /* Update a track's properties (volume, trims, start time, etc.) */
  const updateTrack = (id, patch) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  /* Remove a track from the list */
  const removeTrack = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  /* Begin dragging a track */
  const onDragStart = (e, id) => {
    e.dataTransfer.setData("trackId", id);
  };

  /* Drop a track into a new position */
  const onDrop = (e, targetId) => {
    const draggedId = e.dataTransfer.getData("trackId");
    if (!draggedId) return;

    const reordered = [...tracks];
    const draggedIndex = reordered.findIndex((t) => t.id === draggedId);
    const targetIndex = reordered.findIndex((t) => t.id === targetId);

    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    setTracks(reordered);
  };

/* Playback */
  /* Play the full mix (all tracks rendered together) */
  const playAll = async () => {
    stopAll(); // stop any existing playback
    setShouldAutoPlay(true);

    const url = await renderMix(tracks); // render full mix
    setActiveTrackId(null);
    setMixUrl(url);
  };

  /* Play a single track by rendering only that track */
  const playTrack = async (track) => {
    stopAll();
    setShouldAutoPlay(true);
    const singleTrack = [{ ...track, startTime: 0 }];
    const url = await renderMix(singleTrack);
    setActiveTrackId(track.id);
    setMixUrl(url);
  };

  /* Stop playback and reset UI state */
  const stopAll = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setActiveTrackId(null);
  };

  /* Render a mix (full or single track) into an MP3 blob URL */
  const renderMix = React.useCallback(async (customTracks = tracks) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = [];

    for (let i = 0; i < customTracks.length; i++) {
      const buffer = await decodeFile(customTracks[i].file, audioCtx);
      decoded.push(buffer);
    }

    // Compute total mix duration
    let maxEnd = 0;

    customTracks.forEach((t, i) => {
      const fullDur = decoded[i].duration;

      const effective =
        t.trimEnd != null && t.trimEnd > t.trimStart
          ? t.trimEnd - t.trimStart
          : Math.max(0, fullDur - t.trimStart);

      maxEnd = Math.max(maxEnd, t.startTime + effective);
    });

    // Create offline renderer
    const sampleRate = 44100;
    const offline = new OfflineAudioContext(
      2,
      Math.ceil(maxEnd * sampleRate),
      sampleRate
    );

    // Place each track into the offline mix
    customTracks.forEach((t, i) => {
      const src = offline.createBufferSource();
      src.buffer = decoded[i];

      const gain = offline.createGain();
      gain.gain.value = Math.pow(10, t.volume / 20);
      src.connect(gain).connect(offline.destination);

      const fullDur = decoded[i].duration;
      const effective =
        t.trimEnd != null && t.trimEnd > t.trimStart
          ? t.trimEnd - t.trimStart
          : Math.max(0, fullDur - t.trimStart);

      src.start(t.startTime, t.trimStart, effective);
    });

    // Render to audio buffer → encode to MP3 → return URL
    const rendered = await offline.startRendering();
    const blob = encodeMp3(rendered);

    return URL.createObjectURL(blob);
  }, [tracks]);

  /* Re-render preview mix whenever tracks change */
  useEffect(() => {
    if (tracks.length === 0) return;

    const timeout = setTimeout(async () => {
      const url = await renderMix(tracks);
      setMixUrl(url);
    }, 300);

    return () => clearTimeout(timeout);
  }, [tracks, renderMix]);

  useEffect(() => {
    if (!mixUrl) return;
    const audio = audioRef.current;

    if (!audio) return;
    if (!shouldAutoPlay) return; // prevent unwanted autoplay

    audio.pause();
    audio.currentTime = 0;

    const playAfterLoad = () => {
      audio.play().catch(() => {});
      setShouldAutoPlay(false); // reset after one use
    };

    audio.addEventListener("loadeddata", playAfterLoad, { once: true });

    return () => {
      audio.removeEventListener("loadeddata", playAfterLoad);
    };
  }, [mixUrl, shouldAutoPlay]);


  /* Decode a File object into an AudioBuffer */
  async function decodeFile(file, audioCtx) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        audioCtx.decodeAudioData(reader.result, resolve, reject);
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /* Download Mix */
  const downloadMix = async () => {
    if (tracks.length === 0) return;
    setProgress("Decoding audio...");

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = [];
    for (let i = 0; i < tracks.length; i++) {
      setProgress(`Decoding track ${i + 1}/${tracks.length}...`);
      const buffer = await decodeFile(tracks[i].file, audioCtx);
      decoded.push(buffer);
    }

    let maxEnd = 0;

    tracks.forEach((t, i) => {
      const fullDur = decoded[i].duration;
      const effective =
        t.trimEnd !== "" && t.trimEnd > t.trimStart
          ? t.trimEnd - t.trimStart
          : Math.max(0, fullDur - t.trimStart);

      maxEnd = Math.max(maxEnd, t.startTime + effective);
    });

    if (maxEnd > 300) {
      alert("Mix too long. Please keep under 5 minutes.");
      return;
    }

    const sampleRate = 44100;
    const offline = new OfflineAudioContext(
      2,
      Math.ceil(maxEnd * sampleRate),
      sampleRate
    );

    tracks.forEach((t, i) => {
      const src = offline.createBufferSource();
      src.buffer = decoded[i];

      const gain = offline.createGain();
      gain.gain.value = Math.pow(10, t.volume / 20);

      src.connect(gain).connect(offline.destination);

      const fullDur = decoded[i].duration;

      const effective =
        t.trimEnd !== "" && t.trimEnd > t.trimStart
          ? t.trimEnd - t.trimStart
          : Math.max(0, fullDur - t.trimStart);

      src.start(t.startTime, t.trimStart, effective);
    });

    await new Promise((r) => setTimeout(r, 50));

    setProgress("Rendering mix...");
    const rendered = await offline.startRendering();

    setProgress("Encoding...");
    const blob = encodeMp3(rendered);
    const url = URL.createObjectURL(blob);

    setMixUrl(url); // allow playback

    const a = document.createElement("a");
    a.href = url;
    a.download = "mix.mp3";
    a.click();

    setProgress("Done!");
  };

  /* Convert rendered audio buffer into MP3 Blob */
  function encodeMp3(buffer) {
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels > 1
      ? buffer.getChannelData(1)
      : left;

    const samples16 = new Int16Array(left.length);

    // Convert stereo → mono → 16‑bit PCM
    for (let i = 0; i < left.length; i++) {
      const mono = (left[i] + right[i]) / 2;
      samples16[i] = Math.max(-1, Math.min(1, mono)) * 32767;
    }

    const mp3encoder = new Mp3Encoder(1, buffer.sampleRate, 128);
    const blockSize = 1152;
    let mp3Data = [];

    for (let i = 0; i < samples16.length; i += blockSize) {
      const chunk = samples16.subarray(i, i + blockSize);
      const mp3buf = mp3encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }

    const end = mp3encoder.flush();
    if (end && end.length > 0) mp3Data.push(end);

    return new Blob(mp3Data, { type: "audio/mp3" });
  }
  
/* UI */
  return (
    <div className="overlay">
      <div className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Overlay</h1>
            <p className="hero-subtitle">
              Upload multiple audio files created in Studio 
              and play them together to create layered mixes.
            </p>
          </div>

          <div className="hero-image-container">
            <img src={overlayImg} href="https://www.flaticon.com/free-icons/organized" alt="Overlay visual" className="hero-image" />
          </div>
        </div>
      </div>

      <div className="workspace">
        {/* Upload Audio Files */}
        <label className="upload-button" data-tutorial="upload-btn">
          📄 Add Audio Files
          <input type="file" multiple onChange={handleUpload} hidden />
        </label>

        {progress && <div className="progress">{progress}</div>}
        
        {/* Timeline */}
        <div className="mix-preview full-width-player">
          <p>Timeline:</p>
        <Timeline
          tracks={tracks}
          updateTrack={updateTrack}
        />
        </div>

        {/* mixUrl Playback */}
        {mixUrl && (
        <div className="mix-preview full-width-player">
          <p>Preview Mix:</p>
          <audio
            ref={audioRef} controls src={mixUrl}
            onPlay={() => {
              setIsPlaying(true);
            }} onPause={() => {
              setIsPlaying(false);
            }}
            onEnded={() => stopAll()}
          />
        </div>
        )}
      </div>

      {/* Track List + Items */}
      <div className="card">

        {/* Track List */}
        <div className="track-item-container">
          <p>Track List:</p>
          <div className="track-list" data-tutorial="track-list">
            {tracks.map((t) => (
              <div key={t.id}>
                <div draggable
                  onDragStart={(e) => onDragStart(e, t.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, t.id)}
                  className="track-item"
                >

                  {/* Remove Track Song Button */}
                  <span className="remove-button" onClick={() => removeTrack(t.id)}>✖</span>
                  <span>{t.file.name}</span>

                  {/* Track Buttons */}
                  <div className="track-buttons">
                    
                    {/* Edit Button */}
                    <button className="edit-button" onClick={() =>
                        setOpenPanels((prev) => prev.includes(t.id)
                        ? prev.filter((id) => id !== t.id) // close
                        : [...prev, t.id] // open
                        )}>
                      Edit
                    </button>
                    
                    {/* Play Button */}
                    <button
                      className="play-track-button"
                      onClick={() =>
                        activeTrackId === t.id
                          ? stopAll()      // if this track is active: stop
                          : playTrack(t)   // otherwise: play this track
                      }>
                      {activeTrackId === t.id ? "⏹ Stop" : "▶ Play"}
                    </button>
                  </div>
                </div>

                {openPanels.includes(t.id) && (
                  <div className="edit-panel">
                    <WaveformEditor track={t} updateTrack={updateTrack} />

                    {/* Start Time */}
                    <label className="edit-row">
                      Start Time (s):
                      <div className="slider-row">
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="0.1"
                          value={t.startTime}
                          onChange={(e) =>
                            updateTrack(t.id, { startTime: Number(e.target.value) })
                          }
                          className="slider"
                        />
                        <span className="slider-value">
                          {t.startTime.toFixed(1)}
                        </span>
                      </div>
                    </label>
                    
                    {/* Volume */}
                    <label className="edit-row">
                      Volume (dB):
                      <div className="slider-row">
                        <input
                          type="range"
                          min="-30"
                          max="10"
                          value={t.volume}
                          onChange={(e) =>
                            updateTrack(t.id, { volume: Number(e.target.value) })
                          }
                          className="slider"
                        />

                        <span className="slider-value">
                          {t.volume.toFixed(1)}
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Play All Button */}
        <div className="controls">
          <button
            className="play-button"
            onClick={playAll}
            disabled={tracks.length === 0 || isPlaying}
          >
            ▶ Play All
          </button>

          {/* Stop Button */}
          <button
            className="stop-button"
            onClick={stopAll}
            disabled={!isPlaying}
          >
            ⏹ Stop
          </button>

          {/* MP3 format download */}
          <button data-tutorial="download-btn" className="download-button" onClick={() => downloadMix("mp3")}>
            🡻 Download MP3
          </button>
        </div>
      </div>
    </div>
  );
}