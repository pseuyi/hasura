import React, {useState} from 'react';
import './App.css';

const enum Marker {
  o = 'o',
  x = 'x',
  empty = '',
}

type Board = Marker[];
type Player = Marker;
type Tie = 'tie';
type Pending = 'pending';
type Ended = 'ended';

type Status = Pending | Player | Tie | Ended;

//TODO: move into utils
const initializeBoard = (n = 9) => Array(n).fill(Marker.empty);

const getRow = (idx: number, n: number) => {
  const row = [idx];

  let i = idx;
  let j = idx + 1;

  while (i % n !== 0) {
    i--;
    row.push(i);
  }

  while (j % n !== 0) {
    row.push(j);
    j++;
  }

  return row;
};

const getCol = (idx: number, n: number) => {
  const col = [idx];

  let i = idx - n;
  let j = idx + n;

  while (i >= 0) {
    col.push(i);

    i -= n;
  }

  while (j < n * n) {
    col.push(j);

    j += n;
  }

  return col;
};

const getDiags = (n: number): [number[], number[]] => {
  // left to right
  const ltr = [];
  let i = 0;
  while (i < n * n) {
    ltr.push(i);

    i = i + n + 1;
  }

  // right to left
  const rtl = [];
  let j = n - 1;
  while (j <= n * n - n) {
    rtl.push(j);

    j = j + n - 1;
  }

  return [ltr, rtl];
};

const Outcome = ({outcome}: {outcome: Status}) => {
  if (!outcome) return null;

  const renderText = () => {
    if (outcome === 'ended') {
      return 'game over';
    } else if (outcome === 'tie') {
      return "it's a tie!";
    } else {
      return `the winner is ${outcome}!`;
    }
  };

  return <div className="outcome">{renderText()}</div>;
};

function App() {
  const [n, setN] = useState<number | undefined>();
  const [formN, setFormN] = useState<number | undefined>();
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Marker.empty);
  const [status, setStatus] = useState<Status>(Marker.empty);

  const checkOutcome = (board: Board, move: number): Player | Tie | void => {
    if (!n) return;

    // check if move completes a row
    const row = getRow(move, n);
    if (row.every(idx => board[idx] === currentPlayer)) {
      return currentPlayer;
    }

    // check if move completes a col
    const col = getCol(move, n);
    if (col.every(idx => board[idx] === currentPlayer)) {
      return currentPlayer;
    }

    // check if move completes a diag
    const [ltr, rtl] = getDiags(n);
    if (ltr.includes(move) && ltr.every(idx => board[idx] === currentPlayer)) {
      return currentPlayer;
    }

    if (rtl.includes(move) && rtl.every(idx => board[idx] === currentPlayer)) {
      return currentPlayer;
    }

    // check tie
    if (board.every(cell => cell !== Marker.empty)) {
      return 'tie';
    }
  };

  const handleNewGame = () => {
    if (!formN) return;
    setBoard(initializeBoard(formN * formN));
    setCurrentPlayer(Marker.x);
    setStatus('pending');
    setN(formN);
  };

  const handleEndGame = () => {
    setCurrentPlayer(Marker.empty);
    setStatus('ended');
  };

  const handleClick = (e: React.SyntheticEvent, idx: number) => {
    // update board
    const nextBoard = board.slice();
    nextBoard[idx] = currentPlayer;
    setBoard(nextBoard);

    // check for winner
    const outcome = checkOutcome(nextBoard, idx);
    if (outcome) {
      // end game
      setStatus(outcome === 'tie' ? outcome : currentPlayer);
      setCurrentPlayer(Marker.empty);
      return;
    }

    // update currentPlayer
    const nextPlayer = currentPlayer === Marker.x ? Marker.o : Marker.x;
    setCurrentPlayer(nextPlayer);
  };

  const handleNChange = (e: React.BaseSyntheticEvent) => {
    const maybeInt = parseInt(e.target.value);
    const value = !isNaN(maybeInt) ? maybeInt : undefined;
    setFormN(value);
  };

  const gameStarted = status === 'pending';
  const gameOver = status !== 'pending';
  return (
    <div className="App">
      <header className="header">tic tac toe</header>
      {!n || gameOver ? (
        <div className="dimension">
          <label>choose board dimension:</label>
          <input
            className="dimension-input"
            type="number"
            min={1}
            onChange={handleNChange}
          />
          <button disabled={!formN} onClick={handleNewGame}>
            new game
          </button>
        </div>
      ) : null}
      {currentPlayer ? (
        <div className="turn">{`current player: ${currentPlayer}`}</div>
      ) : null}
      {n ? (
        <div
          className="board"
          style={{
            gridTemplateRows: `repeat(${n}, 1fr)`,
            gridTemplateColumns: `repeat(${n}, 1fr)`,
            width: `calc(2rem * ${n})`,
          }}>
          {board.map((cell, idx) => (
            <div className="cell" key={idx} onClick={e => handleClick(e, idx)}>
              <span className={cell === Marker.x ? 'x' : 'o'}>{cell}</span>
            </div>
          ))}
        </div>
      ) : null}
      {gameStarted ? <button onClick={handleEndGame}>end game</button> : null}
      {gameOver ? <Outcome outcome={status} /> : null}
    </div>
  );
}

export default App;
