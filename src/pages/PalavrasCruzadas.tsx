import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
} from "@ionic/react";
import "./PalavrasCruzadas.css";

interface CruzadaData {
  titulo: string;
  palavras: string[];
  dicas: string[];
  grade: {
    linhas: number;
    colunas: number;
    grade: (string | null)[][];
  };
}

interface Pista {
  number: number;
  direction: "H" | "V";
  row: number;
  col: number;
  answer: string;
  dica: string;
}

const PalavrasCruzadas: React.FC = () => {
  const [data, setData] = useState<CruzadaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userGrid, setUserGrid] = useState<(string | null)[][]>([]);
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [active, setActive] = useState<Pista | null>(null);
  const [status, setStatus] = useState<Record<number, "ok" | "err">>({});
  const [solvedCells, setSolvedCells] = useState<Set<string>>(new Set());

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/palavras-cruzadas`
        );
        const json = await res.json();
        
        const cruzada = json.data && json.data[0] ? json.data[0] : null;

        if (cruzada) {
          setData(cruzada);

          const newGrid = cruzada.grade.grade.map((row: (string | null)[]) =>
            row.map((cell: string | null) => (cell ? "" : null))
          );
          setUserGrid(newGrid);

          const pistasDetectadas = detectPistas(
            cruzada.grade.grade,
            cruzada.palavras,
            cruzada.dicas
          );
          setPistas(pistasDetectadas);
        }
      } catch (e) {
        console.error("Erro ao carregar cruzada", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const detectPistas = (
    grid: (string | null)[][],
    words: string[],
    dicas: string[]
  ): Pista[] => {
    let tempPistas: Omit<Pista, "number">[] = [];
    const R = grid.length;
    const C = grid[0].length;

    for (let w = 0; w < words.length; w++) {
      const word = words[w].toUpperCase();

      for (let r = 0; r < R; r++) {
        for (let c = 0; c <= C - word.length; c++) {
          let match = true;
          for (let i = 0; i < word.length; i++) {
            if (grid[r][c + i] !== word[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            const prevChar = c > 0 ? grid[r][c - 1] : null;
            const nextChar = c + word.length < C ? grid[r][c + word.length] : null;
            
            if (!prevChar && !nextChar) {
               tempPistas.push({
                direction: "H",
                row: r,
                col: c,
                answer: word,
                dica: dicas[w],
              });
            }
          }
        }
      }

      for (let c = 0; c < C; c++) {
        for (let r = 0; r <= R - word.length; r++) {
          let match = true;
          for (let i = 0; i < word.length; i++) {
            if (grid[r + i][c] !== word[i]) {
              match = false;
              break;
            }
          }
          if (match) {
             const prevChar = r > 0 ? grid[r - 1][c] : null;
             const nextChar = r + word.length < R ? grid[r + word.length][c] : null;

             if (!prevChar && !nextChar) {
              tempPistas.push({
                direction: "V",
                row: r,
                col: c,
                answer: word,
                dica: dicas[w],
              });
            }
          }
        }
      }
    }

    tempPistas.sort((a, b) => {
      if (a.row === b.row) return a.col - b.col;
      return a.row - b.row;
    });

    return tempPistas.map((p, index) => ({
      ...p,
      number: index + 1,
    }));
  };

  const handleType = (r: number, c: number, val: string) => {
    if (!active) return;

    const newVal = val.toUpperCase().slice(-1);
    
    const copy = userGrid.map((row) => [...row]);
    copy[r][c] = newVal;
    setUserGrid(copy);

    pistas.forEach((p) => {
      let intersects = false;
      if (p.direction === "H") {
        if (p.row === r && c >= p.col && c < p.col + p.answer.length) intersects = true;
      } else {
        if (p.col === c && r >= p.row && r < p.row + p.answer.length) intersects = true;
      }

      if (intersects) {
        checkSpecificWord(copy, p);
      }
    });

    if (newVal !== "") {
      const nr = active.direction === "H" ? r : r + 1;
      const nc = active.direction === "H" ? c + 1 : c;
      const nextInput = inputRefs.current[`cell-${nr}-${nc}`];
      if (nextInput) nextInput.focus();
    }
  };

  const checkSpecificWord = (currentGrid: (string | null)[][], word: Pista) => {
    let formed = "";
    const coords: string[] = [];

    for (let i = 0; i < word.answer.length; i++) {
      const r = word.direction === "H" ? word.row : word.row + i;
      const c = word.direction === "H" ? word.col + i : word.col;
      formed += currentGrid[r][c] || "";
      coords.push(`${r}-${c}`);
    }

    if (formed === word.answer) {
      setSolvedCells((prev) => {
        const next = new Set(prev);
        coords.forEach((coord) => next.add(coord));
        return next;
      });
      setStatus((s) => ({ ...s, [word.number]: "ok" }));
    } else {
      if (formed.length === word.answer.length) {
         setStatus((s) => ({ ...s, [word.number]: "err" }));
      }
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="loading-container">
          <IonSpinner />
          <p>Carregando Cruzadinha...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!data) {
    return (
      <IonPage>
        <IonContent>
          <p>Não foi possível carregar os dados.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/games" />
          </IonButtons>
          <IonTitle>{data.titulo}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="cruzada-container">
          <div
            className="cruzada-grid"
            style={{
              gridTemplateColumns: `repeat(${data.grade.colunas}, 1fr)`,
            }}
          >
            {data.grade.grade.map((row, r) =>
              row.map((cell, c) => {
                if (!cell) return <div key={`${r}-${c}`} className="cruzada-empty" />;

                const isSolved = solvedCells.has(`${r}-${c}`);
              
                const startsHere = pistas.filter(p => p.row === r && p.col === c);

                return (
                  <div key={`${r}-${c}`} className="cell-wrapper">
                    {startsHere.map((p) => (
                      <span
                        key={p.number}
                        className={`cell-number ${
                          p.direction === "H" ? "num-h" : "num-v"
                        }`}
                      >
                        {p.number}
                      </span>
                    ))}

                    <input
                      ref={(el) => (inputRefs.current[`cell-${r}-${c}`] = el)}
                      maxLength={1}
                      disabled={isSolved}
                      className={`cruzada-cell ${isSolved ? "cell-ok" : ""}`}
                      value={userGrid[r][c] || ""}
                      onFocus={() => {
                        const pistasAqui = pistas.filter((p) => {
                            if (p.direction === "H") {
                                return r === p.row && c >= p.col && c < p.col + p.answer.length;
                            } else {
                                return c === p.col && r >= p.row && r < p.row + p.answer.length;
                            }
                        });
                        if (pistasAqui.length > 0) {
                            if (!active || !pistasAqui.find(p => p.number === active.number)) {
                                setActive(pistasAqui[0]);
                            }
                        }
                      }}
                      onChange={(e) => handleType(r, c, e.target.value)}
                      onKeyDown={(e) => {
                         const isLetter = /^[a-zA-Z]$/.test(e.key);
                         if (!isLetter && e.key !== "Backspace" && e.key !== "Tab") {
                             e.preventDefault();
                         }
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>

          <div className="dicas">
            <h3>Dicas</h3>
            <ul>
              {pistas.map((pista) => (
                <li
                  key={pista.number}
                  className={status[pista.number] === "ok" ? "found" : ""}
                  style={{ 
                      cursor: "pointer", 
                      fontWeight: active?.number === pista.number ? "bold" : "normal",
                      color: active?.number === pista.number ? "var(--ion-color-primary)" : "inherit"
                  }}
                  onClick={() => {
                    setActive(pista);
                    const input = inputRefs.current[`cell-${pista.row}-${pista.col}`];
                    input?.focus();
                  }}
                >
                  <strong>{pista.number}.</strong> {pista.dica}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PalavrasCruzadas;