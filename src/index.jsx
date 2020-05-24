import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props){
  return(
    <button
      className={`square ${props.clsname}`}
      onClick={() => props.onClick()}>
      {props.value}
    </button>
  )
};

function OrderButton(props){
  return(
    <button onClick={() => props.onClick()}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i, clsname) {
    return (
      <Square 
        clsname={clsname}
        key={i} 
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render(){
    const rowCount = 3, colCount = 3;
      return (
        <div>
          {[ ...new Array(rowCount)].map((x, rowIndex) => {
            return (
              <div className="board-row" key={rowIndex}>
                {[ ...new Array(colCount)].map((y, colIndex) => {
                  const keyValue = rowIndex * colCount + colIndex;
                  const winnerPos = this.props.winnerPos;
                  let clsname = '';
                  if(winnerPos)
                    clsname = winnerPos.includes(keyValue) ? 'square-winner' : '' ;
                  return this.renderSquare(keyValue, clsname);
                })}
              </div>
            )
          })
          }
        </div>
      );
    }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        xIsNext: true,
        position: null, // Know where is the click to calcute the square
        moveNumber: 0,  // Ordering
        winnerPos: new Array(3).fill(null), // Detect winner 
      }],
      stepNumber: 0,
      xIsNext: true,
      orderIsAsc: true, // Ordering
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber +1);
    const current = history[history.length -1];
    const squares = current.squares.slice();
    if(calculateWinner(squares) || squares[i])
      return;
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{ //concat doesn´t mutate the original history as push() does.
        squares: squares,
        xIsNext: !this.state.xIsNext,
        position: i,
        moveNumber: history.length,
        winnerPos: calculateWinner(squares, true),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleOrder(){
    this.setState({
      orderIsAsc: !this.state.orderIsAsc,
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const isAsc = this.state.orderIsAsc;

    let moves = history.map((step, move) => {
      const desc = step.moveNumber ?
      `Go to Move #${step.moveNumber} : ${step.xIsNext ? 'O' : 'X'} in (${calculatePosition(step.position)})` :
      'Go to start';
      return (
        <li key={step.moveNumber}>
          <button onClick={() => this.jumpTo(step.moveNumber)}>
           {this.state.stepNumber === step.moveNumber ? <b>{desc}</b> : desc}
          </button>
        </li>
      )
    });

    if(!isAsc)
      moves = [ ...moves].reverse();

    let status;
    if(winner)
      status = `Winner: ${winner}`;
    else {
      if(history.length == 10)
        status = 'Draw!';
      else
        status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    let order = !this.state.orderIsAsc ? 'Order Ascending' : 'Order Descending';

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winnerPos={current.winnerPos}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <OrderButton 
              onClick={() => this.handleOrder()}
              value={order}
            />
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares, returnWinner = false) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a,b,c];
    }
  }
  return null;
}

function calculatePosition(pos) {
  const col = 1 + pos % 3;
  const row = 1 + Math.floor(pos / 3);
  return [col, row];
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
