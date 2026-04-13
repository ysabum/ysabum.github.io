import React, { useEffect } from 'react';
import * as Tone from 'tone';

const Studio = ({ instrumentName, onBack }) => {
  
  useEffect(() => {
    const noteMap = {
      'q': 'C2', 'w': 'D2', 'e': 'E2', 'r': 'F2', 't': 'G2',
      'a': 'A2', 's': 'B2', 'd': 'C3', 'f': 'D3', 'g': 'E3',
      'z': 'F3', 'x': 'G3', 'c': 'A3', 'v': 'B3', 'b': 'C4',
      'y': 'D4', 'u': 'E4', 'i': 'F4', 'o': 'G4', 'p': 'A4',
      'h': 'B4', 'j': 'C5', 'k': 'D5', 'l': 'E5', ';': 'F5',
      'n': 'G5', 'm': 'A5', ',': 'B5', '.': 'C6', '/': 'D6'
    };

    const sampler = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const note = noteMap[e.key.toLowerCase()];
      if (note && sampler.loaded) {
        sampler.triggerAttack(note);
      }
    };

    const handleKeyUp = (e) => {
      const note = noteMap[e.key.toLowerCase()];
      if (note) {
        sampler.triggerRelease(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      sampler.dispose();
    };
  }, [instrumentName]);

  const visualMap = {
    'q': 'C2', 'w': 'D2', 'e': 'E2', 'r': 'F2', 't': 'G2',
    'a': 'A2', 's': 'B2', 'd': 'C3', 'f': 'D3', 'g': 'E3',
    'z': 'F3', 'x': 'G3', 'c': 'A3', 'v': 'B3', 'b': 'C4',
    'y': 'D4', 'u': 'E4', 'i': 'F4', 'o': 'G4', 'p': 'A4',
    'h': 'B4', 'j': 'C5', 'k': 'D5', 'l': 'E5', ';': 'F5',
    'n': 'G5', 'm': 'A5', ',': 'B5', '.': 'C6', '/': 'D6'
  };

  return (
    <div style={studioContainer}>
      <header style={studioHeader}>
        <h2 style={titleStyle}>{instrumentName} Studio</h2>
        <div style={controls}>
          <button style={recordBtn}>● Record (Enter)</button>
        </div>
      </header>

      <div style={scoreSheetArea}>
        <p style={{color: '#666'}}>Musical Score Sheet (Read-Only)</p>
        <div id="vexflow-staff" style={staffStyle}></div>
      </div>

      <div style={keyboardArea}>
        <p style={instructionText}>
          Use the keyboard to make piano sounds (Range: C2 - D6)
        </p>
        
        <div style={keyRow}>
          {Object.keys(visualMap).map(key => (
            <div key={key} style={keyStyle}>
              <span style={keyLabel}>{key.toUpperCase()}</span>
              <div style={noteLabel}>{visualMap[key]}</div>
            </div>
          ))}
        </div>
        
        <button onClick={onBack} style={studioChangeBtn}>
          Change Instrument
        </button>
      </div>
    </div>
  );
};

// --- STYLING ---

const studioContainer = { 
  paddingTop: '120px', 
  paddingBottom: '60px', 
  maxWidth: '100%', 
  minHeight: '100vh',
  margin: '0 auto', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  backgroundColor: '#1B4D3E', // Forest Green
  fontFamily: 'Segoe UI, sans-serif', 
  boxSizing: 'border-box'
};

const studioHeader = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  width: '90%', 
  borderBottom: '2px solid rgba(255,255,255,0.2)', // Lightened for visibility on dark green
  paddingBottom: '20px', 
  marginBottom: '20px' 
};

const titleStyle = { margin: 0, fontSize: '1.8rem', color: '#FFFFFF' }; // White text for header
const controls = { display: 'flex', gap: '10px' };
const recordBtn = { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const scoreSheetArea = { width: '90%', height: '180px', background: 'white', margin: '10px 0', borderRadius: '10px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const staffStyle = { width: '100%', height: '100px' };

const keyboardArea = { marginTop: '30px', textAlign: 'center', width: '95%' };

const instructionText = { 
  marginBottom: '25px', 
  fontWeight: 'bold', 
  fontSize: '1.2rem', 
  color: '#FF6B6B' // Softer Red for dark background
};

const keyRow = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '40px' };
const keyStyle = { width: '55px', height: '90px', border: '1px solid #1a1a2e', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const keyLabel = { fontSize: '0.7rem', color: '#888', fontWeight: 'normal' };
const noteLabel = { marginTop: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#1a1a2e' };
const studioChangeBtn = { padding: '12px 24px', cursor: 'pointer', backgroundColor: '#4cc9f0', color: '#1a1a2e', border: 'none', borderRadius: '5px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };

export default Studio;