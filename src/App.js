import "./App.css";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

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

import { io } from "socket.io-client";

console.log("process.env", process.env);

let backendUrl =
  process.env.REACT_APP_ENV === "production"
    ? "https://olmstead-ball-backend.herokuapp.com/"
    : "http://localhost:3001/";

console.log("🚀 ~ file: App.js ~ line 51 ~ backendUrl", backendUrl);

const socket = io(backendUrl);

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function OlmsteadBall() {
  const [deck, setDeck] = useState([]);
  console.log("🚀 ~ file: App.js ~ line 69 ~ OlmsteadBall ~ deck", deck);
  const [enteredUsername, setEnteredUsername] = useState(null);
  const [playersUsername, setPlayersUsername] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [player1Username, setPlayer1Username] = useState(null);
  console.log(
    "🚀 ~ file: App.js ~ line 73 ~ OlmsteadBall ~ player1Username",
    player1Username
  );
  const [player2Username, setPlayer2Username] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [player1Cards, setPlayer1Cards] = useState([]);
  console.log(
    "🚀 ~ file: App.js ~ line 80 ~ OlmsteadBall ~ player1Cards",
    player1Cards
  );
  const [player2Cards, setPlayer2Cards] = useState([]);
  console.log(
    "🚀 ~ file: App.js ~ line 82 ~ OlmsteadBall ~ player2Cards",
    player2Cards
  );
  const [selectedCard, setSelectedCard] = useState(null);
  const [playersTurn, setPlayersTurn] = useState(1);
  const [player1HandsSolved, setPlayer1HandsSolved] = useState([]);
  const [player2HandsSolved, setPlayer2HandsSolved] = useState([]);
  const [winners, setWinners] = useState([]);

  const [winner, setWinner] = useState(null);
  const [userLeftAlert, setUserLeftAlert] = useState(false);
  const [userThatWantsRematch, setUserThatWantsRematch] = useState(null);

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
    socket.on("other_player_joined", (data) => {
      startGame(data.username, data.roomName);
    });

    socket.on("rematch requested", (data) => {
      console.log("rematch requested!!!", data);

      if (data.requestedBy === userThatWantsRematch) {
        return;
      } else {
        startGame(player2Username, roomName);
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
      setDeck(deck);
      setPlayer1Cards(player1Cards);
      setPlayer2Cards(player2Cards);
      setSelectedCard(selectedCard);
      setPlayersTurn(playersTurn);
      setPlayer1Username(player1Username);
      setPlayer2Username(player2Username);
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

  function submitUsernameAndFindGame() {
    if (!enteredUsername) {
      return;
    }
    if (enteredUsername.length <= 3) {
      return;
    }
    setModalVisible(false);
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

  function startGame(p2Username, rmName) {
    console.log("rmName", rmName);

    setPlayer1HandsSolved([]);
    setPlayer2HandsSolved([]);
    setWinners([]);
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

  function rematch() {
    if (!userThatWantsRematch) {
      setUserThatWantsRematch(playersUsername);
      socket.emit("rematch requested", {
        roomName: roomName,
        requestedBy: playersUsername,
      });
    } else if (userThatWantsRematch === playersUsername) {
      return;
    } else {
      socket.emit("rematch requested", {
        roomName: roomName,
        requestedBy: playersUsername,
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
        <Modal open={true}>
          <Box sx={modalStyle}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                User left game. You win!
              </Typography>
            </div>
            <Button
              style={{ width: "100%" }}
              onClick={() => window.location.reload(false)}
            >
              Play Again?
            </Button>
          </Box>
        </Modal>
        {(!player1Username || !player2Username) && enteredUsername ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress disableShrink style={{ marginBottom: "10px" }} />
            <Typography variant="h5" component="h5" style={{ color: "white" }}>
              Waiting for an opponent...
            </Typography>
          </div>
        ) : null}
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
        <Modal open={modalVisible}>
          <Box sx={modalStyle}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Username?
              </Typography>
            </div>
            <TextField
              id="username"
              type="username"
              style={{ width: "100%" }}
              onChange={(e) => setEnteredUsername(e.target.value)}
            />{" "}
            <Button
              style={{ width: "100%" }}
              disabled={!enteredUsername}
              onClick={submitUsernameAndFindGame}
            >
              Find Game
            </Button>
          </Box>
        </Modal>
        {(!player1Username || !player2Username) && enteredUsername ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress disableShrink style={{ marginBottom: "10px" }} />
            <Typography variant="h5" component="h5" style={{ color: "white" }}>
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
              <Grid item xs={2}>
                {player2HandsSolved[0] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[0] === 2
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 0)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>
              <Grid item xs={2}>
                {player2HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 2
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 1)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>{" "}
              <Grid item xs={2}>
                {player2HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 2
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 2)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>{" "}
              <Grid item xs={2}>
                {player2HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 2
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 3)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>{" "}
              <Grid item xs={2}>
                {player2HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 2
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 4)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
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
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 0)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>
              <Grid item xs={2}>
                {player1HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 1
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 1)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>{" "}
              <Grid item xs={2}>
                {player1HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 1
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 2)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>{" "}
              <Grid item xs={2}>
                {player1HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 1
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 3)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
              </Grid>{" "}
              <Grid item xs={2}>
                {player1HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 1
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 4)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
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
              <Grid item xs={2}>
                {player2Cards[0].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 0)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player2HandsSolved[0] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[0] === 2
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player2Cards[1].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 1)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player2HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 2
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player2Cards[2].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 2)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player2HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 2
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player2Cards[3].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 3)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player2HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 2
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player2Cards[4].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 2, 4)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player2HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 2
                          ? "#56A053"
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
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 0)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player1HandsSolved[0] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[0] === 1
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player1Cards[1].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 1)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player1HandsSolved[1] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[1] === 1
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player1Cards[2].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 2)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player1HandsSolved[2] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[2] === 1
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player1Cards[3].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 3)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player1HandsSolved[3] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[3] === 1
                          ? "#56A053"
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
              <Grid item xs={2}>
                {player1Cards[4].map((card) => (
                  <Paper
                    variant="outlined"
                    onClick={() => placeCard(card, 1, 4)}
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: "lightgray",
                      height: "50px",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card}
                  </Paper>
                ))}
                {player1HandsSolved[4] ? (
                  <Paper
                    variant="outlined"
                    style={{
                      display: "flex",
                      margin: "5px",
                      backgroundColor: winners[0]
                        ? winners[4] === 1
                          ? "#56A053"
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
      {deck.length > 0 && selectedCard && !winner ? (
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            margin: "5px",
            backgroundColor: "lightgray",
            height: "50px",
            width: "150px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedCard}
        </Paper>
      ) : null}
      {winner ? (
        <Button
          style={{
            minWidth: "150px",
            backgroundColor: "lightgray",
            color: "black",
            marginTop: "50px",
          }}
          onClick={() => rematch()}
        >
          Rematch?
        </Button>
      ) : null}
      {userThatWantsRematch && (
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            margin: "5px",
            backgroundColor: "green",
            height: "50px",
            width: "150px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {userThatWantsRematch} wants a rematch!!!
        </Paper>
      )}{" "}
      <Button onClick={() => completeGameShortcut()}>Complete Game</Button>
    </Container>
  );
}

export default OlmsteadBall;
