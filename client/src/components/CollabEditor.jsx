import React from "react";

const CollabEditor = () => {
  return (
    <div style={{maxWidth:1000,margin:'6rem auto 3rem auto',padding:24,background:'#18181b',borderRadius:12,color:'#f3f4f6'}}>
      <h1 style={{color:'#a5b4fc',marginBottom:24}}>Collaborative Code Editor</h1>
      <p>This is a placeholder for the real-time collaborative code editor. Here you will be able to edit code with others, see live cursors, chat, and more.</p>
      <div style={{marginTop:32,padding:24,background:'#232336',borderRadius:8}}>
        <p>Coming soon: Monaco/CodeMirror editor, live sync, chat, and versioning UI.</p>
      </div>
    </div>
  );
};

export default CollabEditor;
