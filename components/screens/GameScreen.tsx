import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Chess } from 'chess.js';
import type { Game as GameType } from '../../types';
import { ChessBoardWrapper } from '../game/ChessBoardWrapper';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Crown, Swords, Handshake, CheckCircle, X } from 'lucide-react';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';

const PlayerInfo: React.FC<{ player: any; isWinner: boolean; time: number | null; isTurn: boolean }> = ({ player, isWinner, time, isTurn }) => {
    const formatTime = (seconds: number | null) => {
        if (seconds === null || seconds < 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    const isLowTime = time !== null && time < 30;
    const isVeryLowTime = time !== null && time < 10;
    const timeColor = isVeryLowTime ? 'text-accent' : isLowTime ? 'text-highlight-amber' : 'text-text-charcoal';

    return (
        <div className={`p-3 bg-white rounded-lg shadow flex items-center gap-3 border-2 ${isTurn ? 'border-soft-emerald' : 'border-transparent'}`}>
            <Avatar src={player.avatarUrl} alt={player.name} />
            <div className="flex-grow">
                <p className="font-bold text-lg">{player.name}</p>
            </div>
            {isWinner && <Crown size={24} className="text-highlight-amber" />}
            <div className={`px-3 py-2 rounded-md ${isTurn ? 'bg-gray-200' : 'bg-gray-100'}`}>
                <span className={`text-2xl font-bold font-mono ${timeColor}`}>{formatTime(time)}</span>
            </div>
        </div>
    );
};


export const GameScreen: React.FC = () => {
    const { gameId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const game = useMemo(() => new Chess(), []);
    const [dbGame, setDbGame] = useState<GameType | null>(null);
    const [fen, setFen] = useState(game.fen());
    const [status, setStatus] = useState("Loading game...");
    const [isProcessing, setIsProcessing] = useState(false);

    const [whiteTime, setWhiteTime] = useState<number | null>(null);
    const [blackTime, setBlackTime] = useState<number | null>(null);

    const playerColor = useMemo<'white' | 'black'>(() => {
        if (!dbGame || !currentUser) return 'white';
        return dbGame.whitePlayer.id === currentUser.id ? 'white' : 'black';
    }, [dbGame, currentUser]);

    const isPlayer = useMemo(() => {
        if (!dbGame || !currentUser) return false;
        return dbGame.whitePlayer.id === currentUser.id || dbGame.blackPlayer?.id === currentUser.id;
    }, [dbGame, currentUser]);

    const isMyTurn = useMemo(() => {
        if (!dbGame || !isPlayer) return false;
        return dbGame.status === 'active' && playerColor[0] === game.turn();
    }, [dbGame, isPlayer, playerColor, game]);


    useEffect(() => {
        if (!gameId) return;
        const unsub = onSnapshot(doc(db, "games", gameId), (doc) => {
            if (doc.exists()) {
                const gameData = { id: doc.id, ...doc.data() } as GameType;
                setDbGame(gameData);
                try {
                    game.loadPgn(gameData.pgn);
                    setFen(game.fen());
                } catch (e) {
                    console.error("Failed to load PGN from database:", e);
                    setStatus("Error: Corrupted game data.");
                    return;
                }

                if (gameData.status === 'waiting' && gameData.whitePlayer.id !== currentUser?.id && currentUser) {
                    updateDoc(doc.ref, {
                        blackPlayer: { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl },
                        status: 'active',
                        updatedAt: serverTimestamp(),
                        lastMoveTimestamp: serverTimestamp(), // Start the clock
                    });
                }
            } else {
                navigate('/play/online');
            }
        });
        return () => unsub();
    }, [gameId, navigate, currentUser, game]);
    
    useEffect(() => {
        if (dbGame?.status === 'completed') {
            setStatus(`Game over: ${dbGame.endReason}`);
            return;
        }

        if (game.isGameOver()) {
            let endStatus = "Game Over";
            if (game.isCheckmate()) endStatus = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
            else if (game.isDraw()) endStatus = "Draw!";
            else if (game.isStalemate()) endStatus = "Stalemate!";
            else if (game.isThreefoldRepetition()) endStatus = "Draw by repetition!";
            
            setStatus(endStatus);

            if (dbGame?.status === 'active') {
                 const winner = game.isDraw() ? 'draw' : (game.turn() === 'w' ? 'black' : 'white');
                 updateDoc(doc(db, "games", gameId!), {
                    status: 'completed',
                    winner: winner,
                    endReason: endStatus,
                    updatedAt: serverTimestamp(),
                });
            }
        } else if (dbGame?.status === 'waiting') {
            setStatus("Waiting for an opponent to join...");
        } else if (dbGame?.status === 'active') {
            setStatus(game.turn() === 'w' ? "White's turn" : "Black's turn");
        }
    }, [fen, dbGame, game, gameId]);
    
     // This effect is for the visual countdown timer.
    useEffect(() => {
        if (!dbGame?.timeControl || dbGame.status !== 'active') {
            setWhiteTime(dbGame?.whiteTime ?? null);
            setBlackTime(dbGame?.blackTime ?? null);
            return;
        }
        
        const turn = game.turn();
        
        const calculateRemainingTime = () => {
            const lastMoveTime = dbGame.lastMoveTimestamp?.toDate().getTime() || dbGame.createdAt.toDate().getTime();
            const elapsed = (Date.now() - lastMoveTime) / 1000;
            
            let wTime = dbGame.whiteTime!;
            let bTime = dbGame.blackTime!;
            
            if (turn === 'w') wTime -= elapsed;
            else bTime -= elapsed;

            return { wTime, bTime };
        };

        const { wTime, bTime } = calculateRemainingTime();
        setWhiteTime(wTime);
        setBlackTime(bTime);

        const interval = setInterval(() => {
            if (game.turn() === 'w') {
                setWhiteTime(t => (t !== null ? t - 1 : null));
            } else {
                setBlackTime(t => (t !== null ? t - 1 : null));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dbGame, fen, game]);

    // Timeout logic
    useEffect(() => {
        if (dbGame?.status !== 'active' || !gameId || isProcessing) return;

        const handleTimeout = async (winner: 'white' | 'black') => {
            setIsProcessing(true);
            const loser = winner === 'white' ? 'Black' : 'White';
            await updateDoc(doc(db, "games", gameId), {
                status: 'completed',
                winner: winner,
                endReason: `${loser} forfeits on time.`,
                updatedAt: serverTimestamp(),
            });
            setIsProcessing(false);
        };
        
        if (whiteTime !== null && whiteTime <= 0) {
            handleTimeout('black');
        } else if (blackTime !== null && blackTime <= 0) {
            handleTimeout('white');
        }
    }, [whiteTime, blackTime, dbGame, gameId, isProcessing]);


    const onMove = (sourceSquare: Square, targetSquare: Square, piece: Piece): boolean => {
        if (!isPlayer || !isMyTurn || isProcessing) return false;

        try {
            const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
            if (move) {
                setFen(game.fen());
                
                const updateData: { [key: string]: any } = {
                    pgn: game.pgn(),
                    fen: game.fen(),
                    updatedAt: serverTimestamp(),
                    lastMoveTimestamp: serverTimestamp(),
                };
                
                const timeControl = dbGame?.timeControl;
                if (timeControl && dbGame) {
                    const lastMoveTime = dbGame.lastMoveTimestamp?.toDate().getTime() || dbGame.createdAt.toDate().getTime();
                    const now = Date.now();
                    const elapsed = (now - lastMoveTime) / 1000;
        
                    if (playerColor === 'white') {
                        updateData.whiteTime = (dbGame.whiteTime || 0) - elapsed + timeControl.increment;
                        updateData.blackTime = dbGame.blackTime;
                    } else {
                        updateData.blackTime = (dbGame.blackTime || 0) - elapsed + timeControl.increment;
                        updateData.whiteTime = dbGame.whiteTime;
                    }
                }
                
                if (dbGame?.drawOffer) {
                    updateData.drawOffer = null;
                }

                updateDoc(doc(db, "games", gameId!), updateData);
                return true;
            }
            return false;
        } catch (e) {
            console.log("Invalid move", e);
            return false;
        }
    };
    
    const handleOfferDraw = async () => {
        if (!isMyTurn || !gameId || !currentUser || dbGame?.drawOffer) return;
        setIsProcessing(true);
        try {
            await updateDoc(doc(db, "games", gameId), {
                drawOffer: currentUser.id,
            });
        } catch (error) {
            console.error("Error offering draw:", error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleAcceptDraw = async () => {
        if (!isMyTurn || !gameId || !currentUser || dbGame?.drawOffer === currentUser.id) return;
        setIsProcessing(true);
        try {
            game.header('Result', '1/2-1/2');
            await updateDoc(doc(db, "games", gameId), {
                pgn: game.pgn(),
                status: 'completed',
                winner: 'draw',
                endReason: 'Draw by agreement',
                drawOffer: null,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error accepting draw:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeclineDraw = async () => {
        if (!isMyTurn || !gameId || !currentUser || dbGame?.drawOffer === currentUser.id) return;
        setIsProcessing(true);
        try {
            await updateDoc(doc(db, "games", gameId), {
                drawOffer: null,
            });
        } catch (error) {
            console.error("Error declining draw:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!dbGame) return <div className="text-center p-8">Loading...</div>;

    const whitePlayer = dbGame.whitePlayer;
    const blackPlayer = dbGame.blackPlayer;
    const opponent = playerColor === 'white' ? blackPlayer : whitePlayer;
    const drawOfferedBy = dbGame?.drawOffer;
    
    const history = game.history({ verbose: true });
    const lastMove = history.length > 0 ? history[history.length - 1] : null;

    return (
        <div className="p-4">
             <h1 className="text-3xl font-bold text-text-charcoal mb-4 flex items-center gap-3">
                <Swords /> Live Match
            </h1>
            <Card className="p-4 mb-4 text-center">
                 <p className="font-semibold text-lg">{status}</p>
                 {drawOfferedBy === opponent?.id && isMyTurn && dbGame?.status === 'active' && (
                    <div className="mt-2 p-3 bg-highlight-amber/20 rounded-lg">
                        <p className="font-semibold">{opponent?.name} has offered a draw.</p>
                        <div className="flex justify-center gap-4 mt-2">
                            <button 
                                onClick={handleAcceptDraw} 
                                disabled={isProcessing}
                                className="flex items-center gap-2 bg-soft-emerald text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
                            >
                                <CheckCircle size={20} /> Accept
                            </button>
                            <button 
                                onClick={handleDeclineDraw} 
                                disabled={isProcessing}
                                className="flex items-center gap-2 bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
                            >
                                <X size={20} /> Decline
                            </button>
                        </div>
                    </div>
                )}
                {drawOfferedBy === currentUser?.id && dbGame?.status === 'active' && (
                    <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600">Draw offer sent. Waiting for opponent...</p>
                    </div>
                )}
            </Card>

            <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                    {blackPlayer && <PlayerInfo player={blackPlayer} isWinner={dbGame.winner === 'black'} time={blackTime} isTurn={game.turn() === 'b' && dbGame.status === 'active'} />}
                    <div className="my-2">
                        <ChessBoardWrapper 
                            position={fen} 
                            onMove={onMove}
                            boardOrientation={playerColor}
                            isMyTurn={isMyTurn}
                            lastMove={lastMove ? { from: lastMove.from, to: lastMove.to } : null}
                        />
                    </div>
                    {whitePlayer && <PlayerInfo player={whitePlayer} isWinner={dbGame.winner === 'white'} time={whiteTime} isTurn={game.turn() === 'w' && dbGame.status === 'active'} />}
                </div>

                <div className="w-full md:w-72 space-y-4">
                    <Card className="p-4">
                        <h3 className="font-bold text-lg mb-3">Game Actions</h3>
                        <button
                            onClick={handleOfferDraw}
                            disabled={!isMyTurn || !!drawOfferedBy || isProcessing || dbGame?.status !== 'active'}
                            className="w-full flex items-center justify-center gap-2 bg-highlight-slate text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Handshake size={20} /> Offer Draw
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};