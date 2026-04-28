import React from "react";
import "../css/InstrumentSelect.css";
import tromboneImage from "../images/trombone.png"
import guitarImage from "../images/guitar.png"
import xylophoneImage from "../images/xylophone.png"
import electricBassImage from "../images/electric-bass.png"
import clarinetImage from "../images/clarinet.png"
import synthImage from "../images/synthesizer.png"

export default function InstrumentSelect({ onSelect, onBack }) {
  const instruments = [
    { name: "Guitar", icon: guitarImage, type: "image" },
    { name: "Electric Guitar", icon: "🎸", type: "emoji" },
    { name: "Electric Bass", icon: electricBassImage, type: "image" },
    { name: "Synthesizer", icon: synthImage, type: "image" },
    { name: "Piano", icon: "🎹", type: "emoji" },
    { name: "Violin", icon: "🎻", type: "emoji" },
    { name: "Trumpet", icon: "🎺", type: "emoji" },
    { name: "Trombone", icon: tromboneImage, type: "image" },
    { name: "Drums", icon: "🥁", type: "emoji" },
    { name: "Xylophone", icon: xylophoneImage, type: "image" },
    { name: "Saxophone", icon: "🎷", type: "emoji" },
    { name: "Clarinet", icon: clarinetImage, type: "image" },
    { name: "Flute", icon: "🪈", type: "emoji" }
  ];

  return (
    <div className="instrument-page">
      <h2 className="instrument-title">Select Your Sound</h2>

      <div className="instrument-card">
      <div className="instrument-grid" data-tutorial="instrument-grid">
        {instruments.map((inst) => (
          <button
            key={inst.name}
            className="instrument-btn"
            onClick={() => onSelect(inst.name)}
          >
            {inst.type === "image" ? (
              <img
                className="instrument-icon instrument-image"
                src={inst.icon}
                alt={inst.name}
              />
            ) : (
              <span className="instrument-icon">{inst.icon}</span>
            )}
            {inst.name}
          </button>
        ))}
      </div>
      </div>

      <button className="inst-back-btn" onClick={onBack}>
        ← Back to Home
      </button>
    </div>
  );
}