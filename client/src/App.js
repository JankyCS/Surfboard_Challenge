import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home"
import Meeting from "./components/Meeting"

const App = () => {
  return (
    // <p>cum</p>
    <BrowserRouter>
      <div className="App">
          <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route exact path="/:roomid" element={<Meeting/>} />
          </Routes>
      </div>
    </BrowserRouter>
  )
};

export default App;