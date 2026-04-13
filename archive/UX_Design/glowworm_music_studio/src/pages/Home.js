import React from 'react';

// We renamed the component to 'Home' to match the filename
const Home = ({ onStart }) => (
  <div style={homeStyle}>
    <div style={heroContent}>
      <h1 style={titleStyle}>Glowworm 🐛</h1>
      <p style={subtitleStyle}>Compose. Record. Layer.</p>
      <p style={descStyle}>
        Transform your QWERTY keyboard into a professional workstation. 
        Create symphonies with acoustic guitar, piano, violin, and trumpet.
      </p>
      <button onClick={onStart} style={primaryBtn}>Start Making Music</button>
    </div>
    <div style={footerStyle}>
      Developed by Team Glowworm: Gregory, Allan, Hennysa, & Laurelle
    </div>
  </div>
);

// --- STYLING ---
const homeStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  color: 'white',
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
};

const heroContent = { textAlign: 'center', maxWidth: '600px', padding: '20px' };
const titleStyle = { fontSize: '4rem', margin: '0', color: '#4cc9f0' };
const subtitleStyle = { fontSize: '1.5rem', fontWeight: '300', marginBottom: '20px' };
const descStyle = { lineHeight: '1.6', marginBottom: '40px', color: '#cbd5e0' };
const primaryBtn = {
  padding: '15px 40px', fontSize: '1.2rem', backgroundColor: '#4cc9f0',
  color: '#1a1a2e', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
};
const footerStyle = { position: 'absolute', bottom: '20px', fontSize: '0.8rem', color: '#94a3b8' };

export default Home;