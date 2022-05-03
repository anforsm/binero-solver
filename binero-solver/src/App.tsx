import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

let game_template: number[] = []
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    game_template.push(-1);
  }
}

const getRow = (gameState: number[], index: number): [number[], number] => {
  let gameSize = Math.sqrt(gameState.length);
  let curRow = Math.floor(index / gameSize);
  return [gameState.slice(curRow * gameSize, (curRow + 1) * gameSize), index % gameSize];
}

const getCol = (gameState: number[], index: number): [number[], number] => {
  let gameSize = Math.sqrt(gameState.length);
  let curCol = index % gameSize
  let retRow = [];
  for (let i = 0; i < gameSize; i++) {
    retRow.push(gameState[i * gameSize + curCol])
  }
  return [retRow, Math.floor(index / gameSize)];
}

const okSeq = (seq: number[]) => {
  let sameNumCombo = 1;
  let prevNum = seq[0];
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] === prevNum && seq[i] !== -1) {
      sameNumCombo++;

      if (sameNumCombo > 2)
        return false;

    } else {
      sameNumCombo = 1;
    }
    prevNum = seq[i];
  }
  return true;
}

const valid = (gameState: number[]) => {
  let gameSize = Math.sqrt(gameState.length);
  for (let i = 0; i < gameSize; i++) {
    // check all rows
    if (!okSeq(getRow(gameState, i * gameSize)[0])) {
      return false;
    }

    if (!okSeq(getCol(gameState, i)[0])) {
      return false;
    }
  }
  return true;
}

const set = (gameState: number[], row: number, col: number, val: number) => {
  gameState[get(gameState, row, col)] = val

}

const get = (gameState: number[], row: number, col: number): number => {
  let gameSize = Math.sqrt(gameState.length);
  return row * gameSize + col;
}

const tryToFillThreeConsecutive = (gameState: number[], pos: number[][]) => {
  let nonEmptyCells = pos.filter(cpos => get(gameState, cpos[0], cpos[1]) !== -1)
  let emptyCells = pos.filter(cpos => get(gameState, cpos[0], cpos[1]) === -1)
  if (emptyCells.length !== 1)
    return;

  let cell1 = nonEmptyCells[0];
  let cell2 = nonEmptyCells[1];

  if (get(gameState, cell1[0], cell1[1]) !== get(gameState, cell2[0], cell2[1]))
    return;

  let emptyCell = emptyCells[0];
  set(gameState, emptyCell[0], emptyCell[1], get(gameState, cell1[0], cell1[1]) === 1 ? 0 : 1);
}

const tryToFillRow = (gameState: number[], row: number) => {
  tryToFillSeq(gameState, row, true)
}

const tryToFillCol = (gameState: number[], col: number) => {
  tryToFillSeq(gameState, col, false)
}

const tryToFillSeq = (gameState: number[], i: number, row: boolean) => {
  let gameSize = Math.sqrt(gameState.length);

  let emptyCells: number[][] = []
  let zeroes = 0;
  let ones = 0;


  for (let j = 0; j < gameSize; j++) {
    if (get(gameState, row ? i : j, row ? j : i) === 0)
      zeroes++;
    if (get(gameState, row ? i : j, row ? j : i) === 1)
      ones++;
    if (get(gameState, row ? i : j, row ? j : i) === -1)
      emptyCells.push([row ? i : j, row ? j : i]);
  }

  if (zeroes / 2 === gameSize)
    emptyCells.forEach(cell => set(gameState, cell[0], cell[1], 1))

  if (ones / 2 === gameSize)
    emptyCells.forEach(cell => set(gameState, cell[0], cell[1], 1))
}

const getEmptyCell = (gameState: number[]): [number, number] => {
  let gameSize = Math.sqrt(gameState.length);
  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === -1) {
      let curRow = Math.floor(i / gameSize);
      let curCol = i % gameSize
      return [curRow, curCol];
    }
  }
  return [-1, -1];
}

const hasEmptyCell = (gameState: number[]) => {
  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === -1)
      return true
  }
  return false;
}

const solved = (gameState: number[]) => {
  return valid(gameState) && !hasEmptyCell(gameState);
}

const fillKnown = (gameState: number[]) => {
  let gameSize = Math.sqrt(gameState.length);
  for (let i = 0; i < gameSize - 2; i++) {
    for (let j = 0; j < gameSize - 2; j++) {
      tryToFillThreeConsecutive(gameState, [[i, j], [i, j + 1], [i, j + 2]])
      tryToFillThreeConsecutive(gameState, [[i, j], [i + 1, j], [i + 2, j]])
    }
  }

  for (let i = 0; i < gameSize; i++) {
    tryToFillRow(gameState, i)
  }

  for (let i = 0; i < gameSize; i++) {
    tryToFillCol(gameState, i)
  }


  return gameState
}

const solveGameR = (gameState: number[], row: number, col: number, val: number): [boolean, number[]] => {
  set(gameState, row, col, val);
  let knownState = fillKnown([...gameState]);

  if (!valid(knownState))
    return [false, knownState]

  if (!hasEmptyCell(knownState))
    return [true, knownState]

  let nextCell = getEmptyCell(gameState)
  let try0 = solveGameR(knownState, ...nextCell, 0)
  if (try0[0])
    return try0;

  let try1 = solveGameR(knownState, ...nextCell, 1)
  return try1;
}

// based on Putranto H. Utamo & Rusydi H. Makarim "Solving a Binary Puzzle" (2017)
const solveGame = (gameState: number[]): [boolean, number[]] => {
  let currGameState = [...gameState];

  let start = getEmptyCell(currGameState);
  let sol = solveGameR(currGameState, start[0], start[1], 0);
  if (sol[0])
    return sol
  return solveGameR(currGameState, start[0], start[1], 1);
}

let localState = localStorage.getItem("state")
let parsedLocalState: number[] = localState ? JSON.parse(localState) : game_template;

function App() {
  const [gameState, setGameState] = useState(parsedLocalState);
  const [solvedGame, setSolvedGame] = useState(gameState);
  const [solvedStatus, setSolvedStatus] = useState("unsolved");

  useEffect(() => {
    setSolvedGame(gameState);
    localStorage.setItem("state", JSON.stringify(gameState))
    setSolvedStatus("unsolved");
  }, [gameState])

  const solve = () => {
    let sol = solveGame([...gameState])
    if (sol[0]) {
      setSolvedStatus("solved");
      setSolvedGame(sol[1])
    } else {
      setSolvedStatus("impossible");
    }
  }
  const showState = (state: number) => state === -1 ? "" : state === 0 ? "0" : "1";
  const getNextState = (prevState: number) => prevState === -1 ? 0 : prevState === 0 ? 1 : -1
  const toggleCell = (index: number) => setGameState(prevState => {
    let newState = [...prevState];
    newState[index] = getNextState(prevState[index]);
    return newState;
  })

  return <div className="relative">
    <div className="z-10 absolute top-0 left-0 w-screen flex flex-col justify-center items-center">
      <h1 className="w-full text-center text-5xl my-10">Takuzo Solver</h1>
      <p>See the <a className=" text-blue-600 underline" href="https://en.wikipedia.org/wiki/Takuzu" target="_blank">Wikipedia page</a> on Takuzo</p>
    </div>
    <div className="w-screen h-screen flex items-center justify-center flex-col absolute top-0 left-0">
      <div>
        <button className="bg-red-600 text-white py-2 px-4 rounded-sm mx-2" onClick={() => setGameState(game_template)}>Reset</button>
        <button className="bg-green-600 text-white py-2 px-4 rounded-sm mx-2" onClick={() => solve()}>Solve</button>
      </div>
      <span>{solvedStatus === "unsolved" ? "Press 'Solve' to solve the game" : solvedStatus === "solved" ? "Solved the game" : "The game is impossible to solve"}</span>
      <div className={`game grid grid-cols-10 grid-rows-10 aspect-square w-96 ${solved(solvedGame) ? "bg-green-400" : ""}`}>
        {solvedGame.map((state, index) => <button key={index} className="border aspect-square"
          onClick={() => toggleCell(index)}
        >

          <span className={`${gameState[index] !== -1 && "font-extrabold"}`}>{showState(state)}</span>
        </button>)}
      </div>
      <span>Click a cell to change its value</span>
      <span>Fill in the current state of your game</span>
    </div>
  </div>;
}

export default App;
