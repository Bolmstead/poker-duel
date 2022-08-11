import "./App.css";
import React, { useState, useEffect } from "react";
import PlokerGame from "./PlokerGame";

import Container from "@mui/material/Container";
import NavBar from "./NavBar";

import { io } from "socket.io-client";

function App() {
  return (
    <div>
      <NavBar></NavBar>
      <PlokerGame />
    </div>
  );
}

export default App;
