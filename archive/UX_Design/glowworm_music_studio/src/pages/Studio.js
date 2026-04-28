import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import Notation from '../components/Notation';
import { Renderer, Stave, StaveNote, Accidental } from 'vexflow';
import "../css/Studio.css";

/* =========================
   KEYBOARD → NOTE MAP
========================= */
const visualMap = {
  q: 'C2', w: 'D2', e: 'E2', r: 'F2', t: 'G2',
  a: 'A2', s: 'B2', d: 'C3', f: 'D3', g: 'E3',
  z: 'F3', x: 'G3', c: 'A3', v: 'B3', b: 'C4',
  y: 'D4', u: 'E4', i: 'F4', o: 'G4', p: 'A4',
  h: 'B4', j: 'C5', k: 'D5', l: 'E5', ';': 'F5',
  n: 'G5', m: 'A5', ',': 'B5', '.': 'C6', '/': 'D6'
};

const drumMap = {
  q: "roll", 
  w: "kick",
  e: "snare",
  r: "snare off",

  a: "tom low",
  s: "tom mid",
  d: "tom high",
  f: "stick",

  z: "flams low",
  x: "flams mid",
  c: "flams high",
  v: "rim shot",
  
  i: "hihat", 
  o: "hihat open",
  p: "clap", 
  j: "crash",
  k: "ride",
  l: "bell",
};

/* =========================
   INSTRUMENT CONFIGS
========================= */
const instrumentConfigs = {
  Piano: {
    offset: 12,
    baseUrl: "./sounds/piano/",
    urls: {
      C2: "C2.mp3", C3: "C3.mp3", C4: "C4.mp3", C5: "C5.mp3",
      "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3", "D#5": "Ds5.mp3"
    }
  },

  Guitar: {
    offset: 0,
    baseUrl: "./sounds/guitar/",
    urls: {
      A2: "As2.mp3", B2: "B2.mp3", G2: "G2.mp3", "F#2": "Fs2.mp3",
      A3: "A3.mp3", D3: "D3.mp3", F3: "F3.mp3", G3: "G3.mp3",
      C4: "C4.mp3", E4: "E4.mp3"
    }
  },

  Violin: {
    offset: 12,
    baseUrl: "./sounds/violin/",
    urls: {
      G3: "G3.mp3", A3: "A3.mp3", C4: "C4.mp3", A4: "A4.mp3",
      C5: "C5.mp3", E5: "E5.mp3", G5: "G5.mp3", C6: "C6.mp3"
    }
  },

  Trumpet: {
    offset: 12,
    baseUrl: "./sounds/trumpet/",
    urls: {
      A3: "A3.mp3", C4: "C4.mp3", "A#4": "As4.mp3", "D#4": "Ds4.mp3",
      F3: "F3.mp3", F5: "F5.mp3", G4: "G4.mp3", D5: "D5.mp3"
    }
  },

  Saxophone: {
    offset: 12,
    baseUrl: "./sounds/sax/",
    urls: {
      A4: "A4.mp3", C4: "C4.mp3", "A#4": "As4.mp3", "D#4": "Ds4.mp3",
      F3: "F3.mp3", F5: "F5.mp3", G4: "G4.mp3", D5: "D5.mp3"
    }
  },

  "Electric Guitar": {
    offset: 12,
    baseUrl: "./sounds/guitar-electric/",
    urls: {
      A2: "A2.mp3", "C#2": "Cs2.mp3", "F#3": "Fs3.mp3", A4: "A4.mp3", 
      C4: "C4.mp3", "D#4": "Ds4.mp3", A5: "A5.mp3", "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3", 
    }
  },

  Trombone: {
    offset: 12,
    baseUrl: "./sounds/trombone/",
    urls: {
      "A#2": "As2.mp3", "C#2": "Cs2.mp3", D3: "D3.mp3",
      C4: "C4.mp3", "D#4": "Ds4.mp3", F4: "F4.mp3",
    }
  },

  Xylophone: {
    offset: 12,
    baseUrl: "./sounds/xylophone/",
    urls: {
      G4: "G4.mp3", "C5": "C5.mp3", C6: "C5.mp3",
      "G6": "G6.mp3", C7: "C7.mp3", G7: "G7.mp3",
      C8: "C8.mp3"
    }
  },

  "Electric Bass": {
    offset: 12,
    baseUrl: "./sounds/bass-electric/",
    urls: {
      "C#1": "Cs1.mp3", E1: "E1.mp3", G1: "G1.mp3", "C#2": "Cs2.mp3", 
      E2: "E5.mp3", G2: "G2.mp3", "A#3": "As3.mp3", "C#3": "Cs3.mp3", 
      E3: "E3.mp3", G3: "G3.mp3", E4: "E4.mp3", G4: "G4.mp3",
      "C#5": "Cs5.mp3"
    }
  },

  Clarinet: {
    offset: 12,
    baseUrl: "./sounds/clarinet/",
    urls: {
      "A#3": "As3.mp3", D3: "D3.mp3", F3: "F3.mp3", "A#4": "As4.mp3", 
      "D4": "D4.mp3", F4: "F4.mp3", "A#5": "As5.mp3", D5: "D5.mp3", 
      F5: "F5.mp3", D6: "D6.mp3", "F#6": "Fs6.mp3"
    }
  },

  Flute: {
    offset: 12,
    baseUrl: "./sounds/flute/",
    urls: {
      A4: "A4.mp3", C4: "C4.mp3", E4: "E4.mp3", A5: "A5.mp3",
      C5: "C5.mp3", E5: "E5.mp3", A6: "A6.mp3", C6: "C6.mp3",
      E6: "E5.mp3"
    }
  },

  Synthesizer: {
    offset: 12,
    baseUrl: "./sounds/synth/",
    urls: {
      C2: "file1.mp3", D2: "file2.mp3", E2: "file3.mp3", F2: "file4.mp3",
      G2: "file5.mp3", A2: "file6.mp3", B2: "file7.mp3", C3: "file8.mp3",
      D3: "file9.mp3", E3: "file10.mp3", F3: "file11.mp3", G3: "file12.mp3",
      A3: "file13.mp3", B3: "file14.mp3", C4: "file15.mp3", D4: "file16.mp3",
      E4: "file17.mp3", F4: "file18.mp3", G4: "file19.mp3", A4: "file20.mp3",
      B4: "file21.mp3", C5: "file22.mp3", D5: "file23.mp3", E5: "file24.mp3",
      F5: "file25.mp3"
    }
  },

  Drums: {
    isDrum: true,
    baseUrl: "./sounds/drums/",
    urls: {
      kick: "kick.wav",
      snare: "snare.wav",
      "snare off": "snare_off.wav",
      hihat: "hihat_closed.wav",
      "hihat open": "hihat_open.wav",
      clap: "clap.wav",
      "tom low": "tom_low.wav",
      "tom mid": "tom_mid.wav",
      "tom high": "tom_high.wav",
      crash: "crash.wav",
      ride: "ride.wav",
      roll: "roll.wav",
      "flams low": "flams_low.wav",
      "flams mid": "flams_mid.wav",
      "flams high": "flams_high.wav",
      bell: "bell.wav",
      "rim shot": "rimshot.wav",
      stick: "stick.wav"
    }
  }
};

  /* =========================
  DRUM → NOTATION NOTE MAP
  ========================= */
  const getNotationNote = () => "C5";

/* =========================
   STUDIO COMPONENT
========================= */
const Studio = ({ instrumentName, onBack, onHasNotesChange, onRecordingChange }) => {

  /* =========================
     STATE MANAGEMENT
  ========================= */
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState([]);
  const [popup, setPopup] = useState(null); // { key, note, x, y }
  const popupRef = useRef(null);

  useEffect(() => {
    if (onHasNotesChange) {
      onHasNotesChange(recordedData.length > 0);
    }
  }, [recordedData, onHasNotesChange]);

  const [keyMap, setKeyMap] = useState(() => {
    const saved = localStorage.getItem("studio_keymap");
    return saved ? JSON.parse(saved) : visualMap;
  });

  useEffect(() => {
    if (instrumentName === "Drums") {
      setKeyMap(drumMap);
    } else {
      setKeyMap(visualMap);
    }
  }, [instrumentName]);

  const [isEditMode, setIsEditMode] = useState(false);

  /* =========================
     AUDIO / RECORDING REFS
  ========================= */
  const samplerRef = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const startTime = useRef(null);
  const destRef = useRef(null);

  /* =========================
     PERFORMANCE REFS
  ========================= */
  const isRecordingRef = useRef(false);
  const keyMapRef = useRef(keyMap);
  const activeNotesRef = useRef({});
  const configRef = useRef(null);

  /* =========================
     KEYMAP SYNC + PERSISTENCE
  ========================= */
  useEffect(() => {
    keyMapRef.current = keyMap;
    localStorage.setItem("studio_keymap", JSON.stringify(keyMap));
  }, [keyMap]);

  /* =========================
     RECORDING STATE SYNC
  ========================= */
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  /* =========================
     CLOSE POPUP ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopup(null);
      }
    };
    if (popup) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popup]);

  /* =========================
     NOTE TRANSPOSITION HELPER
  ========================= */
  const getFinalNote = (baseNote, config) =>
    Tone.Frequency(baseNote)
      .transpose(config.offset || 0)
      .toNote();


  /* =========================
     KEY CLICK HANDLER (popup)
  ========================= */
  const handleKeyClick = (key, note, e) => {
    if (isEditMode) {
      const newNote = prompt(`Enter new note for ${key.toUpperCase()}`, keyMap[key]);
      if (newNote) setKeyMap(prev => ({ ...prev, [key]: newNote }));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopup(prev =>
      prev && prev.key === key ? null : { key, note, x: rect.left + rect.width / 2, y: rect.top }
    );
  };

  /* =========================
     AUDIO ENGINE + KEYBOARD INPUT
  ========================= */
  useEffect(() => {
    destRef.current = Tone.getContext().createMediaStreamDestination();
    configRef.current = instrumentConfigs[instrumentName] || instrumentConfigs.Piano;

    let instrument;

    if (configRef.current.isDrum) {
      instrument = new Tone.Players({
        urls: configRef.current.urls,
        baseUrl: process.env.PUBLIC_URL + "/sounds/drums/",
        onload: () => {
          console.log("🥁 Drums loaded");
        }
      }).toDestination();

      samplerRef.current = instrument;

    } else {
      instrument = new Tone.Sampler({
        urls: configRef.current.urls,
        baseUrl: configRef.current.baseUrl,
        release: 1,
        onload: () => console.log(`${instrumentName} loaded`)
      }).toDestination();
    }

    instrument.connect(destRef.current);
    samplerRef.current = instrument;

    const handleKeyDown = async (e) => {
      if (e.repeat || isEditMode) return;

      const key = e.key.toLowerCase();
      const baseNote = keyMapRef.current[key];
      if (!baseNote) return;

      if (Tone.getContext().state !== "running") await Tone.start();
      await Tone.loaded();

      // 🥁 DRUM MODE
      if (configRef.current.isDrum) {
        const players = samplerRef.current;
        const player = players.player(baseNote);
        const now = Tone.now();
        player.stop(now);
        player.start(now);

        if (isRecordingRef.current) {
          const t = Tone.now() - startTime.current;
          activeNotesRef.current[key] = {
            note: getNotationNote(),   // always C5
            startTime: t
          };
        }

        return;
      }

      // 🎹 MELODIC MODE
      const finalNote = getFinalNote(baseNote, configRef.current);
      samplerRef.current.triggerAttack(finalNote);

      if (isRecordingRef.current) {
        const t = Tone.now() - startTime.current;
        activeNotesRef.current[key] = {
          note: finalNote,
          startTime: t
        };
      }
    };

    const handleKeyUp = (e) => {
      if (isEditMode) return;

      const key = e.key.toLowerCase();
      const baseNote = keyMapRef.current[key];
      if (!baseNote) return;

      if (configRef.current.isDrum) {
        const active = activeNotesRef.current[key];

        // If no active note exists, bail out safely
        if (!active) return;

        if (isRecordingRef.current) {
          const { startTime: noteStart } = active;
          const duration = Tone.now() - startTime.current - noteStart;

          setRecordedData(prev => [
            ...prev,
            { note: active.note, time: noteStart, duration }
          ]);
        }

        delete activeNotesRef.current[key];
        return;
      }

      const finalNote = getFinalNote(baseNote, configRef.current);

      samplerRef.current.triggerRelease(finalNote);

      if (isRecordingRef.current && activeNotesRef.current[key]) {
        const { startTime: noteStart } = activeNotesRef.current[key];
        const duration = Tone.now() - startTime.current - noteStart;

        setRecordedData(prev => [
          ...prev,
          { note: finalNote, time: noteStart, duration }
        ]);

        window.dispatchEvent(new CustomEvent("note-played"));
        delete activeNotesRef.current[key];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (samplerRef.current) {
        samplerRef.current.dispose();
      }
    };
  }, [instrumentName, isEditMode]);

  /* =========================
     RECORDING TOGGLE
  ========================= */
  const toggleRecording = useCallback(() => {
    if (!isRecording) {
      setRecordedData([]);
      audioChunks.current = [];
      startTime.current = Tone.now();

      mediaRecorder.current = new MediaRecorder(destRef.current.stream);
      mediaRecorder.current.ondataavailable = (e) =>
        audioChunks.current.push(e.data);

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${instrumentName}_Recording.wav`;
        a.click();
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      if (onRecordingChange) onRecordingChange(true);
      window.dispatchEvent(new CustomEvent("recording-start"));
    } else {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (onRecordingChange) onRecordingChange(false);
      window.dispatchEvent(new CustomEvent("recording-stop"));
    }
  }, [isRecording, instrumentName, onRecordingChange]);

  /* =========================
    ENTER KEY → TOGGLE RECORDING
  ========================= */
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.repeat || isEditMode) return;
      if (e.key === "Enter") {
        e.preventDefault();
        toggleRecording();
      }
    };

    window.addEventListener("keydown", handleEnterKey);
    return () => window.removeEventListener("keydown", handleEnterKey);
  }, [toggleRecording, isEditMode]);

  /* =========================
     SCORE EXPORT (VEXFLOW → PNG)
  ========================= */
  const saveScoreAsImage = () => {
    if (!recordedData.length) return alert("No notes recorded!");

    const secondsPerLine = 12;
    const numSystems = Math.ceil(recordedData.at(-1).time / secondsPerLine);

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = numSystems * 150 + 100;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
    const vf = renderer.getContext();

    for (let i = 0; i < numSystems; i++) {
      const stave = new Stave(50, 50 + i * 150, 1100);
      stave.addClef("treble");
      if (i === 0) stave.addTimeSignature("4/4");
      stave.setContext(vf).draw();

      const start = i * secondsPerLine;

      recordedData
        .filter(n => n.time >= start && n.time < start + secondsPerLine)
        .forEach(n => {
          const pitch = n.note; // already a valid note like "C4"
          const keys = pitch.slice(0, -1).toLowerCase() + "/" + pitch.slice(-1);
          let d = "q";
          if (n.duration > 1.5) d = "w";
          else if (n.duration > 0.75) d = "h";
          else if (n.duration < 0.2) d = "8";

          const note = new StaveNote({ clef: "treble", keys: [keys], duration: d });
          if (n.note.includes("#")) note.addModifier(new Accidental("#"), 0);
          note.setContext(vf).setStave(stave).draw();
        });
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "score.png";
    link.click();
  };

  /* =========================
     AUTO SCROLL SCORE VIEW
  ========================= */
  useEffect(() => {
    const score = document.querySelector(".score-area");
    if (!score) return;

    const id = requestAnimationFrame(() => {
      score.scrollTo({ top: score.scrollHeight, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(id);
  }, [recordedData]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="studio-container">

      {/* =====================
          POPUP
      ===================== */}
      {popup && (
        <div
          ref={popupRef}
          className="key-popup"
          style={{ top: popup.y - 110, left: popup.x - 80 }}
        >
          <div className="key-popup-arrow" />
          <div className="key-popup-section-label">keyboard key</div>
          <div className="key-popup-key">{popup.key.toUpperCase()}</div>
          <div className="key-popup-divider" />
          <div className="key-popup-section-label">plays note</div>
          <div className="key-popup-note">{popup.note}</div>
          <div className="key-popup-hint">Press this key on your keyboard to play</div>
          <button className="key-popup-dismiss" onClick={() => setPopup(null)}>
            Got it
          </button>
        </div>
      )}

      <header className="studio-header">
        <h2 className="studio-title">{instrumentName} Studio</h2>

        <div className="studio-controls">
          <button
            className={`edit-toggle-btn ${isEditMode ? "active" : ""}`}
            onClick={() => setIsEditMode(v => !v)}
          >
            {isEditMode ? "✔ Save Keys" : "✎ Edit Keys"}
          </button>

          <button
            data-tutorial="record-btn"
            onClick={toggleRecording}
            className={`record-btn ${isRecording ? "recording" : ""}`}
          >
            {isRecording ? "■ Stop" : "● Record (Enter)"}
          </button>

          {!isRecording && recordedData.length > 0 && (
            <button data-tutorial="save-score-btn" className="save-score-btn" onClick={saveScoreAsImage}>
              💾 Save Score Image
            </button>
          )}
        </div>
      </header>

      <div className="score-area">
        <p className="score-label">Real-time VexFlow Notation</p>
        <Notation notes={recordedData} />
      </div>

      <div className="keyboard-area" data-tutorial="keyboard-area">
        <p className="instruction-text">
          Use the keyboard to make {instrumentName.toLowerCase()} sounds (Range: C2 - D6)
        </p>

        <div className={`key-row ${instrumentName === "Drums" ? "drums" : ""}`}>
          {Object.keys(keyMap).map((key) => (
            <div
              key={key}
              className={`key-box ${isEditMode ? "editable" : ""}`}
              onClick={(e) => handleKeyClick(key, keyMap[key], e)}
            >
              <span className="key-label">{key.toUpperCase()}</span>
              <div className="note-label">{keyMap[key]}</div>
            </div>
          ))}
        </div>

        <button className="change-instrument-btn" onClick={onBack}>
          Change Instrument
        </button>
      </div>
    </div>
  );
};

export default Studio;