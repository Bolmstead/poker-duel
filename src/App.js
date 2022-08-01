import "./App.css";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
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
// import io from "socket.io-client";
// const socket = io("http://localhost:3001");

function OlmsteadBall() {
  const [board, setboard] = useState([]);
  const [player1Cards, setplayer1Cards] = useState([]);
  const [player2Cards, setplayer2Cards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [playersTurn, setplayersTurn] = useState(1);
  const [player1HandsSolved, setPlayer1HandsSolved] = useState([]);
  const [player2HandsSolved, setPlayer2HandsSolved] = useState([]);
  const [winners, setWinners] = useState([]);
  console.log("🚀 ~ file: App.js ~ line 46 ~ OlmsteadBall ~ winners", winners);

  const [winner, setWinner] = useState(null);
  console.log("🚀 ~ file: App.js ~ line 49 ~ OlmsteadBall ~ winner", winner);

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

  const [deck, setDeck] = useState([]);

  useEffect(() => {
    // socket.emit("game start", () => {
    //   console.log("🥳 connection emitted");
    // });
  }, []);

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

  function startGame() {
    setplayersTurn(1);
    setPlayer1HandsSolved([]);
    setPlayer2HandsSolved([]);
    setWinners([]);
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
    setplayer1Cards(tempPlayer1Hand);
    setplayer2Cards(tempPlayer2Hand);
    setSelectedCard(newCard);
  }

  function placeCard(card, playerSide, handNumber) {
    if (playersTurn !== playerSide) {
      return;
    }

    let playersCards = playersTurn === 1 ? player1Cards : player2Cards;

    if (playersCards[handNumber].length === 5) {
      return;
    }

    playersCards[handNumber].push(selectedCard);

    if (playersTurn === 1) {
      setplayer1Cards(playersCards);
    } else if (playersTurn === 2) {
      setplayer2Cards(playersCards);
    }

    const tempDeck = deck;

    setDeck(tempDeck);

    if (tempDeck.length <= 2) {
      finishGame();
    }

    // if (player1Cards.length > 4 || player2Cards.length > 4) {
    //   finishGame();
    // }
    if (playersTurn === 1) {
      setplayersTurn(2);
    } else if (playersTurn === 2) {
      setplayersTurn(1);
    }
    const newCard = tempDeck.pop();
    setSelectedCard(newCard);
    // socket.emit("placed card", () => {
    //   console.log("🎉 placedCard");
    // });
  }

  function finishGame() {
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

    setPlayer1HandsSolved(tempP1HandsSolved);
    setPlayer2HandsSolved(tempP2HandsSolved);

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
    if (p1Wins > p2Wins) {
      setWinner(1);
    } else if (p2Wins > p1Wins) {
      setWinner(2);
    }

    setWinners(tempWinners);
  }

  let testing = true;
  if (testing) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginTop: "10px",
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
          <Button
            variant="contained"
            onClick={startGame}
            style={{
              width: "150px",
              marginBottom: "10px",
              backgroundColor: "#64BBFA",
              color: "#1b1b1b",
            }}
          >
            Deal
          </Button>

          {winner ? (
            <span>Player {winner} Wins!</span>
          ) : (
            <span>Player {playersTurn}'s turn</span>
          )}
        </div>

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

        {deck.length > 0 && selectedCard ? (
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
      }}
    >
      <div>
        <Button
          variant="contained"
          onClick={startGame}
          style={{
            width: "150px",
            backgroundColor: "#64BBFA",
            color: "#1b1b1b",
          }}
        >
          Deal
        </Button>
        <span>Player {playersTurn}'s turn</span>
      </div>

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
              {player1Cards[0].map((card) => (
                <div
                  onClick={() => placeCard(card, 1, 0)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>
            <Grid item xs={2}>
              {player1Cards[1].map((card) => (
                <div
                  onClick={() => placeCard(card, 1, 1)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>{" "}
            <Grid item xs={2}>
              {player1Cards[2].map((card) => (
                <div
                  onClick={() => placeCard(card, 1, 2)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>{" "}
            <Grid item xs={2}>
              {player1Cards[3].map((card) => (
                <div
                  onClick={() => placeCard(card, 1, 3)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>{" "}
            <Grid item xs={2}>
              {player1Cards[4].map((card) => (
                <div
                  onClick={() => placeCard(card, 1, 4)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>
          </Grid>
        ) : null}
      </Box>
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
                <div
                  onClick={() => placeCard(card, 2, 0)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>
            <Grid item xs={2}>
              {player2Cards[1].map((card) => (
                <div
                  onClick={() => placeCard(card, 2, 1)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>{" "}
            <Grid item xs={2}>
              {player2Cards[2].map((card) => (
                <div
                  onClick={() => placeCard(card, 2, 2)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>{" "}
            <Grid item xs={2}>
              {player2Cards[3].map((card) => (
                <div
                  onClick={() => placeCard(card, 2, 3)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>{" "}
            <Grid item xs={2}>
              {player2Cards[4].map((card) => (
                <div
                  onClick={() => placeCard(card, 2, 4)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {card}
                </div>
              ))}
            </Grid>
          </Grid>
        ) : null}
      </Box>
      {deck.length > 0 && selectedCard ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedCard}
        </div>
      ) : null}
    </Container>
  );
}

export default OlmsteadBall;