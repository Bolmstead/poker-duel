import "./App.css";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Popover from "@mui/material/Popover";
import Snackbar from "@mui/material/Snackbar";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { v4 as uuid } from "uuid";
import API from "./api/index";

import {
  values,
  Card as PokerCard,
  Hand,
  StraightFlush,
  RoyalFlush,
  WildRoyalFlush,
  FiveOfAKind,
  FourOfAKindPairPlus,
  FourOfAKind,
  FourWilds,
  ThreeOfAKindTwoPair,
  FullHouse,
  Flush,
  Straight,
  TwoThreeOfAKind,
  ThreeOfAKind,
  ThreePair,
  TwoPair,
  OnePair,
  HighCard,
  gameRules,
  Game,
} from "./pokerSolver";

import Container from "@mui/material/Container";
import NavBar from "./NavBar";

import { io } from "socket.io-client";

console.log("process.env", process.env);

let backendUrl =
  process.env.REACT_APP_ENV === "production"
    ? "https://olmstead-ball-backend.herokuapp.com/"
    : "http://localhost:3000/";

console.log("🚀 ~ file: App.js ~ line 51 ~ backendUrl", backendUrl);

const socket = io(backendUrl);

const usernameBox = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  border: "2px solid #000",
  backgroundColor: "transparent",
  boxShadow: "none",
  p: 4,
  display: "flex",
  justifyContent: "center",
};

function PlokerGame() {
  const [deck, setDeck] = useState([]);
  console.log("🚀 ~ file: App.js ~ line 69 ~ Game ~ deck", deck);
  const [enteredUsername, setEnteredUsername] = useState(null);
  console.log(
    "🚀 ~ file: PlokerGame.js ~ line 78 ~ PlokerGame ~ enteredUsername",
    enteredUsername
  );
  const [enteredPassword, setEnteredPassword] = useState(null);
  console.log(
    "🚀 ~ file: PlokerGame.js ~ line 80 ~ PlokerGame ~ enteredPassword",
    enteredPassword
  );

  const [lookingForGame, setLookingForGame] = useState(false);

  const [playersUsername, setPlayersUsername] = useState(null);
  const [otherPlayersUsername, setOtherPlayersUsername] = useState(null);

  const [roomName, setRoomName] = useState(null);
  const [player1Username, setPlayer1Username] = useState(null);

  const [player2Username, setPlayer2Username] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [player1Cards, setPlayer1Cards] = useState([]);

  const [player2Cards, setPlayer2Cards] = useState([]);

  const [selectedCard, setSelectedCard] = useState(null);
  const [playersTurn, setPlayersTurn] = useState(1);
  const [player1HandsSolved, setPlayer1HandsSolved] = useState([]);
  const [player2HandsSolved, setPlayer2HandsSolved] = useState([]);
  const [winners, setWinners] = useState([]);

  const [winner, setWinner] = useState(null);
  const [userLeftAlert, setUserLeftAlert] = useState(false);
  const [userThatWantsRematch, setUserThatWantsRematch] = useState(null);
  const [snackBarMessage, setSnackBarMessage] = useState(null);
  const [showSnackbarMessage, setShowSnackbarMessage] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const unshuffledDeck = [
    "Ad",
    "2d",
    "3d",
    "4d",
    "5d",
    "6d",
    "7d",
    "8d",
    "9d",
    "10d",
    "Jd",
    "Qd",
    "Kd",
    "Ac",
    "2c",
    "3c",
    "4c",
    "5c",
    "6c",
    "7c",
    "8c",
    "9c",
    "10c",
    "Jc",
    "Qc",
    "Kc",
    "Ah",
    "2h",
    "3h",
    "4h",
    "5h",
    "6h",
    "7h",
    "8h",
    "9h",
    "10h",
    "Jh",
    "Qh",
    "Kh",
    "As",
    "2s",
    "3s",
    "4s",
    "5s",
    "6s",
    "7s",
    "8s",
    "9s",
    "10s",
    "Js",
    "Qs",
    "Ks",
  ];

  useEffect(() => {
    async function testAPICall() {
      try {
        let result = await API.testCall();
        console.log("result", result);
      } catch (err) {
        console.log(err);
      }
    }

    testAPICall();

    socket.on("other_player_joined", (data) => {
      startGame(data.username, data.roomName);
    });

    socket.on("rematch requested", (data) => {
      console.log("rematch requested!!!", data);
      console.log(
        "🚀 ~ file: App.js ~ line 99 ~ Game ~ userThatWantsRematch",
        userThatWantsRematch
      );
      if (!userThatWantsRematch) {
        setUserThatWantsRematch(data.requestedBy);
      }
    });

    socket.on("game started", (data) => {
      let {
        deck,
        player1Cards,
        player2Cards,
        selectedCard,
        playersTurn,
        player1Username,
        player2Username,
      } = data;

      let tempOtherPlayerUsername;

      if (player1Username === playersUsername) {
        tempOtherPlayerUsername = player2Username;
      } else {
        tempOtherPlayerUsername = player1Username;
      }
      setOtherPlayersUsername(tempOtherPlayerUsername);
      setDeck(deck);
      setWinner(null);
      setSnackBarMessage(`New game started with ${tempOtherPlayerUsername}!`);
      setWinners([]);
      setPlayer1HandsSolved([]);
      setPlayer2HandsSolved([]);
      setPlayer1Cards(player1Cards);
      setPlayer2Cards(player2Cards);
      setSelectedCard(selectedCard);
      setPlayersTurn(playersTurn);
      setPlayer1Username(player1Username);
      setPlayer2Username(player2Username);
      setUserThatWantsRematch(null);
      setShowSnackbarMessage(true);
    });

    socket.on("user card played", (data) => {
      console.log("card played!!!");
      let { deck, player1Cards, player2Cards, selectedCard, playersTurn } =
        data;
      setDeck(deck);
      setPlayer1Cards(player1Cards);
      setPlayer2Cards(player2Cards);
      setSelectedCard(selectedCard);
      setPlayersTurn(playersTurn);
    });

    socket.on("game finished", (data) => {
      console.log(data);
      let {
        deck,
        player1Cards,
        player2Cards,
        player1HandsSolved,
        player2HandsSolved,
        winners,
        winner,
      } = data;
      setDeck(deck);
      console.log(deck);
      setPlayer1Cards(player1Cards);
      console.log(player1Cards);

      setPlayer2Cards(player2Cards);
      console.log(player2Cards);

      setSelectedCard(null);
      setPlayersTurn(null);
      setPlayer1HandsSolved(player1HandsSolved);
      setPlayer2HandsSolved(player2HandsSolved);
      setWinner(winner);
      setWinners(winners);
    });
    socket.on("user has left", (data) => {
      console.log("user has left!");
      console.log(data);
      setDeck([]);
      setPlayer1Cards([]);
      setPlayer2Cards([]);
      setSelectedCard(null);
      setPlayersTurn(null);
      setPlayer1HandsSolved([]);
      setPlayer2HandsSolved([]);
      setWinner(null);
      setWinners([]);
      setSelectedCard(null);
      setUserLeftAlert(true);
    });
  }, [socket]);

  function joinPrivateGame() {}

  function findRandomGame() {
    let randomCharacters = uuid();
    let randomUsername = randomCharacters.substring(0, 10);
    setLookingForGame(true);
    setPlayersUsername(randomUsername);
    socket.emit("join room", randomUsername);
  }

  function submitUsernameAndFindGame() {
    if (!enteredUsername) {
      return;
    }
    if (enteredUsername.length <= 3) {
      return;
    }
    setLookingForGame(true);
    setPlayersUsername(enteredUsername);
    socket.emit("join room", enteredUsername);
  }

  function shuffle(array) {
    const copy = [];
    let n = array.length;
    let i;
    // While there remain elements to shuffle…
    while (n) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * array.length);

      // If not already shuffled, move it to the new array.
      if (i in array) {
        copy.push(array[i]);
        delete array[i];
        n--;
      }
    }

    return copy;
  }
  function handleSnackbarClose() {
    setShowSnackbarMessage(false);
    setTimeout(() => {
      setSnackBarMessage(null);
    }, 2000);
  }
  async function registerOrLoginUser() {
    if (showLoginForm) {
    }
  }
  async function goBackToMainMenu() {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setPlayer1Username(null);
    setPlayer2Username(null);
  }

  function startGame(p2Username, rmName) {
    console.log("rmName", rmName);

    setPlayer1HandsSolved([]);
    setPlayer2HandsSolved([]);
    setWinners([]);
    setWinner(null);
    setUserThatWantsRematch(null);
    let tempPlayersTurn = Math.random() < 0.5 ? 1 : 2;
    setPlayersTurn(tempPlayersTurn);
    let newDeck = unshuffledDeck;
    let tempPlayer1Hand = [];
    let tempPlayer2Hand = [];

    newDeck = shuffle(newDeck);

    tempPlayer1Hand.push(
      [newDeck[0]],
      [newDeck[1]],
      [newDeck[2]],
      [newDeck[3]],
      [newDeck[4]]
    );

    tempPlayer2Hand.push(
      [newDeck[5]],
      [newDeck[6]],
      [newDeck[7]],
      [newDeck[8]],
      [newDeck[9]]
    );

    newDeck.splice(0, 10);

    const newCard = newDeck.pop();

    setDeck(newDeck);
    setPlayer1Cards(tempPlayer1Hand);
    setPlayer2Cards(tempPlayer2Hand);
    setSelectedCard(newCard);
    if (!player1Username) {
      setPlayer1Username(playersUsername);
    }
    if (!player2Username) {
      setPlayer2Username(p2Username);
    }
    if (!roomName) {
      setRoomName(rmName);
    }

    let ar = rmName.split("");
    ar.splice(0, 6);
    ar.splice(-4, 4);

    let p1Username = ar.join("");

    socket.emit("game start", {
      deck: newDeck,
      player1Cards: tempPlayer1Hand,
      player2Cards: tempPlayer2Hand,
      selectedCard: newCard,
      playersTurn: tempPlayersTurn,
      player1Username: p1Username,
      player2Username: p2Username,
      roomName: rmName,
    });
  }

  async function testAPICall() {
    try {
      let result = await API.testCall();
      console.log("result", result);
    } catch (err) {
      console.log(err);
    }
  }

  function showForm(str) {
    if (str === "login") {
      setShowLoginForm(true);
    } else if (str === "register") {
      setShowRegisterForm(true);
    }
  }

  function rematch() {
    if (userThatWantsRematch) {
      if (userThatWantsRematch !== playersUsername) {
        startGame(player2Username, roomName);
      }
    } else {
      setUserThatWantsRematch(playersUsername);
      socket.emit("rematch requested", {
        roomName: roomName,
        requestedBy: playersUsername,
        bothPlayersReady: true,
      });
    }
  }

  function completeGameShortcut() {
    console.log("complete game");
    let p1CardsFinal = [
      ["Jc", "Qc", "10s", "4s", "9d"],
      ["Kd", "5d", "6c", "9s", "3h"],
      ["4h", "Jh", "5s", "Ad", "10d"],
      ["3d", "3s", "7d", "3c", "2d"],
      ["10c", "5h", "10h", "Kh", "8h"],
    ];
    let p2CardsFinal = [
      ["5c", "6h", "4c", "8s", "6d"],
      ["7c", "6s", "Jd", "4d", "Qs"],
      ["9h", "As", "Kc", "Ah", "Qh"],
      ["8d", "7s", "7h", "2c", "9c"],
      ["8c", "Ac", "Js", "2h"],
    ];
    let deckFinal = ["Ks"];
    let selCardFinal = "2s";

    setDeck(deckFinal);
    setPlayer1Cards(p1CardsFinal);
    setPlayer2Cards(p2CardsFinal);
    setSelectedCard(selCardFinal);
    setPlayersTurn(2);
  }

  function placeCard(card, playerSide, handNumber) {
    let result = testAPICall();
    console.log(
      "🚀 ~ file: PlokerGame.js ~ line 474 ~ placeCard ~ result",
      result
    );
    console.log(
      "🚀 ~ file: App.js ~ line 307 ~ placeCard ~ handNumber",
      handNumber
    );

    let playerThatPlayed = playersUsername === player1Username ? 1 : 2;

    if (playersTurn !== playerThatPlayed) {
      return;
    }

    if (playersTurn !== playerSide) {
      return;
    }

    let playersCards = playersTurn === 1 ? player1Cards : player2Cards;

    if (playersCards[handNumber].length === 5) {
      return;
    }

    let largestDeckLength = playersCards[0].length;

    let allDecksSameLength = true;
    for (let pHand of playersCards) {
      if (pHand.length !== largestDeckLength) {
        allDecksSameLength = false;
      }
      if (pHand.length > largestDeckLength) {
        largestDeckLength = pHand.length;
      }
    }

    console.log("largestDeckLength", largestDeckLength);
    console.log("allDecksSameLength", allDecksSameLength);

    console.log(playersCards[handNumber]);

    if (playersCards[handNumber].length > largestDeckLength) {
      return;
    } else if (
      playersCards[handNumber].length === largestDeckLength &&
      !allDecksSameLength
    ) {
      return;
    }

    playersCards[handNumber].push(selectedCard);

    let tempPlayer1Cards, tempPlayer2Cards;
    if (playersTurn === 1) {
      tempPlayer1Cards = playersCards;
      tempPlayer2Cards = player2Cards;
      setPlayer1Cards(playersCards);
    } else if (playersTurn === 2) {
      tempPlayer1Cards = player1Cards;
      tempPlayer2Cards = playersCards;
      setPlayer2Cards(playersCards);
    }

    const tempDeck = deck;

    setDeck(tempDeck);

    if (tempDeck.length <= 2) {
      finishGame(tempDeck, tempPlayer1Cards, tempPlayer2Cards);
    }

    // if (player1Cards.length > 4 || player2Cards.length > 4) {
    //   finishGame();
    // }

    let nextPlayersTurn;
    if (playersTurn === 1) {
      nextPlayersTurn = 2;
      setPlayersTurn(nextPlayersTurn);
    } else if (playersTurn === 2) {
      nextPlayersTurn = 1;
      setPlayersTurn(nextPlayersTurn);
    }
    const newCard = tempDeck.pop();
    setSelectedCard(newCard);

    console.log("roomName", roomName);

    socket.emit("card played", {
      deck: tempDeck,
      player1Cards: tempPlayer1Cards,
      player2Cards: tempPlayer2Cards,
      selectedCard: newCard,
      playersTurn: nextPlayersTurn,
      room: roomName,
    });
  }

  function finishGame(theDeck, theP1Cards, theP2Cards) {
    let p1h1Solved = Hand.solve(player1Cards[0], "standard", false);

    let p1h2Solved = Hand.solve(player1Cards[1], "standard", false);
    let p1h3Solved = Hand.solve(player1Cards[2], "standard", false);
    let p1h4Solved = Hand.solve(player1Cards[3], "standard", false);
    let p1h5Solved = Hand.solve(player1Cards[4], "standard", false);

    let p2h1Solved = Hand.solve(player2Cards[0], "standard", false);

    let p2h2Solved = Hand.solve(player2Cards[1], "standard", false);
    let p2h3Solved = Hand.solve(player2Cards[2], "standard", false);
    let p2h4Solved = Hand.solve(player2Cards[3], "standard", false);
    let p2h5Solved = Hand.solve(player2Cards[4], "standard", false);

    let tempP1HandsSolved = [
      p1h1Solved,
      p1h2Solved,
      p1h3Solved,
      p1h4Solved,
      p1h5Solved,
    ];

    let tempP2HandsSolved = [
      p2h1Solved,
      p2h2Solved,
      p2h3Solved,
      p2h4Solved,
      p2h5Solved,
    ];

    const winners1 = Hand.winners([p1h1Solved, p2h1Solved]);

    const winners2 = Hand.winners([p1h2Solved, p2h2Solved]);

    const winners3 = Hand.winners([p1h3Solved, p2h3Solved]);
    const winners4 = Hand.winners([p1h4Solved, p2h4Solved]);
    const winners5 = Hand.winners([p1h5Solved, p2h5Solved]);

    let theWinningHands = [winners1, winners2, winners3, winners4, winners5];
    let tempWinners = [];
    let p1Wins = 0;
    let p2Wins = 0;

    for (let winHand of theWinningHands) {
      let index = theWinningHands.indexOf(winHand);

      if (winHand[0].descr === tempP1HandsSolved[index].descr) {
        tempWinners.push(1);
        p1Wins++;
      } else if (winHand[0].descr === tempP2HandsSolved[index].descr) {
        tempWinners.push(2);
        p2Wins++;
      } else {
        tempWinners.push("no one?");
      }
    }
    let tempWinner;
    if (p1Wins > p2Wins) {
      tempWinner = 1;
    } else if (p2Wins > p1Wins) {
      tempWinner = 2;
    }

    setSelectedCard(null);

    socket.emit("finish game", {
      deck: theDeck,
      player1Cards: theP1Cards,
      player2Cards: theP2Cards,
      player1HandsSolved: tempP1HandsSolved,
      player2HandsSolved: tempP2HandsSolved,
      winners: tempWinners,
      winner: tempWinner,
      roomName: roomName,
    });
  }

  if (userLeftAlert) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginTop: "10px",
          height: "92vh",
        }}
      >
        <Grid container sx={usernameBox}>
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography
              id="modal-modal-title"
              style={{ color: "white", marginBottom: "20px" }}
              variant="h6"
              component="h2"
            >
              {"User left the game :("}
            </Typography>
          </Grid>
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              style={{
                width: "50%",
                backgroundColor: "#59Ae57",
                color: "black",
              }}
              onClick={() => window.location.reload(false)}
            >
              Find a new game?
            </Button>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!player1Username || !player2Username) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginTop: "10px",
          height: "92vh",
        }}
      >
        {showLoginForm || showRegisterForm ? (
          <Card>
            <Grid container sx={usernameBox}>
              <Grid
                item
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <TextField
                  id="username"
                  type="username"
                  style={{
                    width: "66%",
                    backgroundColor: "white",
                    marginBottom: "20px",
                  }}
                  placeholder="Username"
                  size="small"
                  onChange={(e) => setEnteredUsername(e.target.value)}
                />
              </Grid>
              <Grid
                item
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <TextField
                  id="password"
                  type="password"
                  style={{
                    width: "66%",
                    backgroundColor: "white",
                    marginBottom: "20px",
                  }}
                  placeholder="Password"
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid
                item
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {" "}
                <Button
                  style={{
                    width: "70%",
                    backgroundColor: "#59Ae57",
                    color: "black",
                    marginBottom: "20px",
                  }}
                  onClick={registerOrLoginUser}
                >
                  {showLoginForm && !showRegisterForm ? "Login" : null}
                  {!showLoginForm && showRegisterForm ? "Register" : null}
                </Button>
              </Grid>
              <Grid
                item
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <span
                  onClick={goBackToMainMenu}
                  style={{ cursor: "pointer" }}
                  disabled
                >
                  Go Back{" "}
                </span>
              </Grid>
            </Grid>
          </Card>
        ) : (
          !lookingForGame && (
            <Card>
              <Grid container sx={usernameBox}>
                {/* <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography
                id="modal-modal-title"
                style={{ color: "white" }}
                variant="h6"
                component="h2"
              >
                Username?
              </Typography>
            </div> */}
                <Grid
                  item
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    style={{
                      width: "70%",
                      backgroundColor: "#59Ae57",
                      color: "black",
                      marginBottom: "20px",
                    }}
                    onClick={joinPrivateGame}
                  >
                    Join Private Game
                  </Button>
                </Grid>
                <Grid
                  item
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    style={{
                      width: "70%",
                      backgroundColor: "#59Ae57",
                      color: "black",
                      marginBottom: "20px",
                    }}
                    onClick={findRandomGame}
                  >
                    Find Random Game
                  </Button>
                </Grid>
                <Grid
                  item
                  style={{
                    width: "70%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "50%",
                      color: "white",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      onClick={() => showForm("login")}
                      style={{ cursor: "pointer" }}
                      disabled
                    >
                      Login{" "}
                    </span>
                    <span>/</span>
                    <span
                      onClick={() => showForm("register")}
                      style={{ cursor: "pointer" }}
                      disabled
                    >
                      {" "}
                      Register
                    </span>
                  </div>
                </Grid>
              </Grid>
            </Card>
          )
        )}
        {lookingForGame ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress
              disableShrink
              style={{ marginBottom: "10px", color: "#59Ae57" }}
            />
            <Typography variant="h6" comh6onent="p" style={{ color: "white" }}>
              Waiting for an opponent...
            </Typography>
          </div>
        ) : null}
      </Container>
    );
  }

  return (
    <Container
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: "10px",
        backgroundColor: "black",
      }}
    >
      {playersUsername === player1Username ? (
        <Box
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          {" "}
          {player2Cards.length > 0 ? (
            <Grid
              container
              rowSpacing={1}
              spacing={5}
              justifyContent="center"
              alignItems="center"

              // style={{ backgroundColor: "purple" }}
            >
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2HandsSolved[0] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[0] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[0].descr}
                  </Paper>
                ) : null}
                {player2Cards[0].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 0)}
                  ></img>
                ))}
              </Grid>
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[1].descr}
                  </Paper>
                ) : null}
                {player2Cards[1].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 1)}
                  ></img>
                ))}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[2].descr}
                  </Paper>
                ) : null}
                {player2Cards[2].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 2)}
                  ></img>
                ))}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[3].descr}
                  </Paper>
                ) : null}
                {player2Cards[3].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 3)}
                  ></img>
                ))}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[4].descr}
                  </Paper>
                ) : null}
                {player2Cards[4].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 4)}
                  ></img>
                ))}
              </Grid>
            </Grid>
          ) : null}
        </Box>
      ) : (
        <Box
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          {player1Cards.length > 0 ? (
            <Grid
              container
              rowSpacing={1}
              spacing={5}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item xs={2} className="a-player-deck">
                {player1HandsSolved[0] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[0] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[0].descr}
                  </Paper>
                ) : null}
                {player1Cards[0].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 0)}
                  ></img>
                ))}
              </Grid>
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[1].descr}
                  </Paper>
                ) : null}
                {player1Cards[1].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 1)}
                  ></img>
                ))}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[2].descr}
                  </Paper>
                ) : null}
                {player1Cards[2].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 2)}
                  ></img>
                ))}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[3].descr}
                  </Paper>
                ) : null}
                {player1Cards[3].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 2)}
                  ></img>
                ))}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[4].descr}
                  </Paper>
                ) : null}
                {player1Cards[4].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 4)}
                  ></img>
                ))}
              </Grid>
            </Grid>
          ) : null}
        </Box>
      )}
      {playersUsername === player2Username ? (
        <Box sx={{ width: "100%", minHeight: "200px" }}>
          {player2Cards.length > 0 ? (
            <Grid
              container
              rowSpacing={1}
              spacing={5}
              justifyContent="center"
              alignItems="center"

              // style={{ backgroundColor: "purple" }}
            >
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2Cards[0].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 0)}
                  ></img>
                ))}
                {player2HandsSolved[0] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[0] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[0].descr}
                  </Paper>
                ) : null}
              </Grid>
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2Cards[1].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 1)}
                  ></img>
                ))}
                {player2HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[1].descr}
                  </Paper>
                ) : null}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2Cards[2].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 2)}
                  ></img>
                ))}
                {player2HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[2].descr}
                  </Paper>
                ) : null}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2Cards[3].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 3)}
                  ></img>
                ))}
                {player2HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[3].descr}
                  </Paper>
                ) : null}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player2Cards[4].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 2, 4)}
                  ></img>
                ))}
                {player2HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 2
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player2HandsSolved[4].descr}
                  </Paper>
                ) : null}
              </Grid>
            </Grid>
          ) : null}
        </Box>
      ) : (
        <Box sx={{ width: "100%", minHeight: "200px" }}>
          {player1Cards.length > 0 ? (
            <Grid
              container
              rowSpacing={1}
              spacing={5}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item xs={2} className="a-player-deck">
                {player1Cards[0].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 0)}
                  ></img>
                ))}
                {player1HandsSolved[0] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[0] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[0].descr}
                  </Paper>
                ) : null}
              </Grid>
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1Cards[1].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 1)}
                  ></img>
                ))}
                {player1HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[1].descr}
                  </Paper>
                ) : null}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1Cards[2].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 2)}
                  ></img>
                ))}
                {player1HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[2].descr}
                  </Paper>
                ) : null}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1Cards[3].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 3)}
                  ></img>
                ))}
                {player1HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[3].descr}
                  </Paper>
                ) : null}
              </Grid>{" "}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",

                  alignItems: "center",
                }}
              >
                {player1Cards[4].map((card) => (
                  <img
                    style={{ height: "100px" }}
                    src={`/playingCards/${card}.png`}
                    onClick={() => placeCard(card, 1, 4)}
                  ></img>
                ))}
                {player1HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 1
                          ? "#59Ae57"
                          : "#dd5c56"
                        : "white",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {player1HandsSolved[4].descr}
                  </Paper>
                ) : null}
              </Grid>
            </Grid>
          ) : null}
        </Box>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {selectedCard && !winner ? (
          playersTurn === 1 ? (
            <span style={{ color: "white" }}>
              {player1Username === playersUsername
                ? "Your Turn!"
                : `${player1Username}'s Turn!`}
            </span>
          ) : (
            <span style={{ color: "white" }}>
              {player2Username === playersUsername
                ? "Your Turn!"
                : `${player2Username}'s Turn!`}
            </span>
          )
        ) : null}
        {winner ? (
          <span style={{ color: "white" }}>
            {winner === 1 ? `${player1Username}` : `${player2Username}`} won!
          </span>
        ) : null}
      </div>
      {deck.length > 0 && selectedCard && !winner ? (
        <img
          style={{ height: "100px" }}
          src={`/playingCards/${selectedCard}.png`}
        />
      ) : null}
      {userThatWantsRematch ? (
        userThatWantsRematch === playersUsername ? (
          <Typography
            variant="outlined"
            style={{
              display: "flex",
              margin: "5px",
              height: "50px",
              width: "500px",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            Waiting on opponent to accept rematch...
          </Typography>
        ) : (
          <Typography
            variant="outlined"
            style={{
              display: "flex",
              margin: "5px",
              height: "50px",
              width: "500px",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            {userThatWantsRematch} wants a rematch!
          </Typography>
        )
      ) : null}{" "}
      {winner ? (
        <>
          {userThatWantsRematch && userThatWantsRematch !== playersUsername ? (
            <Button
              style={{
                minWidth: "200px",
                backgroundColor: "#59Ae57",
                color: "black",
                marginTop: "10px",
              }}
              onClick={() => rematch()}
            >
              ACCEPT
            </Button>
          ) : null}
          {!userThatWantsRematch ? (
            <Button
              style={{
                minWidth: "200px",
                backgroundColor: "#59Ae57",
                color: "black",
                marginTop: "10px",
              }}
              onClick={() => rematch()}
            >
              Rematch?
            </Button>
          ) : null}
          <Button
            style={{
              minWidth: "200px",
              backgroundColor: "lightgray",
              color: "black",
              marginTop: "10px",
            }}
            onClick={() => window.location.reload(false)}
          >
            New Random Game?
          </Button>
        </>
      ) : null}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        open={showSnackbarMessage}
        onClose={handleSnackbarClose}
        message={"New Game Started!"}
        autoHideDuration={5000}
        key={"snackbar"}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          style={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      {/* <Button onClick={() => completeGameShortcut()}>Complete Game</Button> */}
    </Container>
  );
}

export default PlokerGame;
