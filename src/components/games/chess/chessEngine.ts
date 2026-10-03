export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (ChessPiece | null)[][];

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  piece: ChessPiece;
  captured?: ChessPiece | null;
  promotion?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
  notation?: string;
}

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  const backRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  // Black pieces (row 0 & 1)
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: 'b' };
    board[1][c] = { type: 'p', color: 'b' };
  }

  // White pieces (row 6 & 7)
  for (let c = 0; c < 8; c++) {
    board[6][c] = { type: 'p', color: 'w' };
    board[7][c] = { type: backRank[c], color: 'w' };
  }

  return board;
}

export function isInside(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function findKing(board: Board, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

export function isSquareAttacked(board: Board, targetRow: number, targetCol: number, byColor: PieceColor): boolean {
  // Check knight attacks
  const knightDeltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightDeltas) {
    const nr = targetRow + dr;
    const nc = targetCol + dc;
    if (isInside(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'n') return true;
    }
  }

  // Check pawn attacks
  const pawnDir = byColor === 'w' ? 1 : -1; // row delta from attacker's perspective towards target
  for (const dc of [-1, 1]) {
    const pr = targetRow + pawnDir;
    const pc = targetCol + dc;
    if (isInside(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.color === byColor && p.type === 'p') return true;
    }
  }

  // Check king adjacency
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const kr = targetRow + dr;
      const kc = targetCol + dc;
      if (isInside(kr, kc)) {
        const p = board[kr][kc];
        if (p && p.color === byColor && p.type === 'k') return true;
      }
    }
  }

  // Check straight lines (Rook / Queen)
  const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of straights) {
    let nr = targetRow + dr;
    let nc = targetCol + dc;
    while (isInside(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // Check diagonals (Bishop / Queen)
  const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagonals) {
    let nr = targetRow + dr;
    let nc = targetCol + dc;
    while (isInside(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return false;
}

export function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, kingPos[0], kingPos[1], oppColor);
}

// Generate pseudo-legal moves for a piece
export function getPseudoLegalMoves(
  board: Board,
  r: number,
  c: number,
  castling: CastlingRights,
  enPassant: [number, number] | null
): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Move[] = [];
  const color = piece.color;
  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';

  if (piece.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;

    // 1 step forward
    const nextR = r + dir;
    if (isInside(nextR, c) && !board[nextR][c]) {
      const isPromo = nextR === 0 || nextR === 7;
      if (isPromo) {
        (['q', 'r', 'b', 'n'] as PieceType[]).forEach(promo => {
          moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: c, piece, promotion: promo });
        });
      } else {
        moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: c, piece });
      }

      // 2 steps forward from start
      const doubleR = r + 2 * dir;
      if (r === startRow && isInside(doubleR, c) && !board[doubleR][c]) {
        moves.push({ fromRow: r, fromCol: c, toRow: doubleR, toCol: c, piece });
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const targetC = c + dc;
      if (isInside(nextR, targetC)) {
        const targetPiece = board[nextR][targetC];
        if (targetPiece && targetPiece.color === oppColor) {
          const isPromo = nextR === 0 || nextR === 7;
          if (isPromo) {
            (['q', 'r', 'b', 'n'] as PieceType[]).forEach(promo => {
              moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: targetC, piece, captured: targetPiece, promotion: promo });
            });
          } else {
            moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: targetC, piece, captured: targetPiece });
          }
        } else if (enPassant && enPassant[0] === nextR && enPassant[1] === targetC) {
          // En passant capture
          const capturedPawn = board[r][targetC];
          moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: targetC, piece, captured: capturedPawn, isEnPassant: true });
        }
      }
    }
  } else if (piece.type === 'n') {
    const deltas = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of deltas) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInside(nr, nc)) {
        const dest = board[nr][nc];
        if (!dest || dest.color === oppColor) {
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, piece, captured: dest });
        }
      }
    }
  } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
    const directions: [number, number][] = [];
    if (piece.type === 'b' || piece.type === 'q') {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }
    if (piece.type === 'r' || piece.type === 'q') {
      directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }

    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;
      while (isInside(nr, nc)) {
        const dest = board[nr][nc];
        if (!dest) {
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, piece });
        } else {
          if (dest.color === oppColor) {
            moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, piece, captured: dest });
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  } else if (piece.type === 'k') {
    // Normal 1-square moves
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (isInside(nr, nc)) {
          const dest = board[nr][nc];
          if (!dest || dest.color === oppColor) {
            moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, piece, captured: dest });
          }
        }
      }
    }

    // Castling
    const inCheck = isKingInCheck(board, color);
    if (!inCheck) {
      if (color === 'w' && r === 7 && c === 4) {
        // Kingside
        if (castling.wK && !board[7][5] && !board[7][6] &&
            !isSquareAttacked(board, 7, 5, 'b') && !isSquareAttacked(board, 7, 6, 'b')) {
          moves.push({ fromRow: 7, fromCol: 4, toRow: 7, toCol: 6, piece, isCastling: true });
        }
        // Queenside
        if (castling.wQ && !board[7][3] && !board[7][2] && !board[7][1] &&
            !isSquareAttacked(board, 7, 3, 'b') && !isSquareAttacked(board, 7, 2, 'b')) {
          moves.push({ fromRow: 7, fromCol: 4, toRow: 7, toCol: 2, piece, isCastling: true });
        }
      } else if (color === 'b' && r === 0 && c === 4) {
        // Kingside
        if (castling.bK && !board[0][5] && !board[0][6] &&
            !isSquareAttacked(board, 0, 5, 'w') && !isSquareAttacked(board, 0, 6, 'w')) {
          moves.push({ fromRow: 0, fromCol: 4, toRow: 0, toCol: 6, piece, isCastling: true });
        }
        // Queenside
        if (castling.bQ && !board[0][3] && !board[0][2] && !board[0][1] &&
            !isSquareAttacked(board, 0, 3, 'w') && !isSquareAttacked(board, 0, 2, 'w')) {
          moves.push({ fromRow: 0, fromCol: 4, toRow: 0, toCol: 2, piece, isCastling: true });
        }
      }
    }
  }

  return moves;
}

export function makeSimulatedMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const { fromRow, fromCol, toRow, toCol, piece, promotion, isCastling, isEnPassant } = move;

  newBoard[toRow][toCol] = promotion ? { type: promotion, color: piece.color } : { ...piece };
  newBoard[fromRow][fromCol] = null;

  if (isCastling) {
    if (toCol === 6) {
      // Kingside
      newBoard[toRow][5] = newBoard[toRow][7];
      newBoard[toRow][7] = null;
    } else if (toCol === 2) {
      // Queenside
      newBoard[toRow][3] = newBoard[toRow][0];
      newBoard[toRow][0] = null;
    }
  }

  if (isEnPassant) {
    newBoard[fromRow][toCol] = null;
  }

  return newBoard;
}

export function getLegalMoves(
  board: Board,
  r: number,
  c: number,
  castling: CastlingRights,
  enPassant: [number, number] | null
): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const pseudoMoves = getPseudoLegalMoves(board, r, c, castling, enPassant);

  return pseudoMoves.filter(move => {
    const after = makeSimulatedMove(board, move);
    return !isKingInCheck(after, piece.color);
  });
}

export function getAllLegalMoves(
  board: Board,
  color: PieceColor,
  castling: CastlingRights,
  enPassant: [number, number] | null
): Move[] {
  const allMoves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        allMoves.push(...getLegalMoves(board, r, c, castling, enPassant));
      }
    }
  }
  return allMoves;
}

export function getAlgebraicNotation(move: Move, isCheck: boolean, isMate: boolean): string {
  if (move.isCastling) {
    const base = move.toCol === 6 ? 'O-O' : 'O-O-O';
    return isMate ? base + '#' : isCheck ? base + '+' : base;
  }

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rank = 8 - move.toRow;
  const file = files[move.toCol];

  let notation = '';
  if (move.piece.type !== 'p') {
    notation += move.piece.type.toUpperCase();
  }

  if (move.captured) {
    if (move.piece.type === 'p') {
      notation += files[move.fromCol];
    }
    notation += 'x';
  }

  notation += `${file}${rank}`;

  if (move.promotion) {
    notation += `=${move.promotion.toUpperCase()}`;
  }

  if (isMate) notation += '#';
  else if (isCheck) notation += '+';

  return notation;
}

export function evaluateBoardMaterial(board: Board): { white: number; black: number; diff: number } {
  const values: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let white = 0;
  let black = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.color === 'w') white += values[p.type];
        else black += values[p.type];
      }
    }
  }

  return { white, black, diff: white - black };
}

// Bot AI algorithm
export function pickBotMove(
  board: Board,
  color: PieceColor,
  difficulty: 'NOVICE' | 'CLUB' | 'MASTER',
  castling: CastlingRights,
  enPassant: [number, number] | null
): Move | null {
  const legalMoves = getAllLegalMoves(board, color, castling, enPassant);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'NOVICE') {
    // 70% random, 30% capture if available
    const captures = legalMoves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.3) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Club & Master: Minimax with material + center control
  const values: Record<PieceType, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

  function scorePosition(b: Board): number {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p) {
          const val = values[p.type];
          // center bonus
          const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
          const posBonus = (7 - centerDist) * 5;
          const totalVal = val + posBonus;
          score += p.color === 'w' ? totalVal : -totalVal;
        }
      }
    }
    return score;
  }

  let bestMove: Move = legalMoves[0];
  let bestScore = color === 'w' ? -Infinity : Infinity;

  // Shuffle moves first for variety
  const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);

  for (const move of shuffled) {
    const nextBoard = makeSimulatedMove(board, move);
    let moveScore = scorePosition(nextBoard);

    if (difficulty === 'MASTER') {
      // 1-ply lookahead of opponent best reply
      const oppColor: PieceColor = color === 'w' ? 'b' : 'w';
      const oppReplies = getAllLegalMoves(nextBoard, oppColor, castling, null);
      if (oppReplies.length > 0) {
        let worstForUs = color === 'w' ? Infinity : -Infinity;
        for (const reply of oppReplies.slice(0, 8)) {
          const deepBoard = makeSimulatedMove(nextBoard, reply);
          const deepScore = scorePosition(deepBoard);
          if (color === 'w') {
            if (deepScore < worstForUs) worstForUs = deepScore;
          } else {
            if (deepScore > worstForUs) worstForUs = deepScore;
          }
        }
        moveScore = worstForUs;
      }
    }

    if (color === 'w') {
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    } else {
      if (moveScore < bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    }
  }

  return bestMove;
}
