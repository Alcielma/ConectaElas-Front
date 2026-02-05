import React, { useEffect, useState } from "react";
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
import "./CacaPalavras.css";
import { useParams } from "react-router-dom";

interface CacaPalavrasData {
  id?: number;
  documentId?: string;
  titulo: string;
  palavras: string[];
  grade: {
    linhas: number;
    colunas: number;
    grade: string[][];
  };
}

const CacaPalavras: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CacaPalavrasData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/caca-palavras?filters[id][$eq]=${id}`
        );
        if (!res.ok) throw new Error("Erro ao buscar caça-palavras");
        const json = await res.json();
        const arr = Array.isArray(json?.data) ? json.data : [];
        setData(arr[0] ?? null);
      } catch (err) {
        console.error("Erro ao carregar caça-palavras", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const selectCell = (row: number, col: number, letter: string) => {
    const key = `${row}-${col}`;

    if (selectedCells.includes(key) || foundCells.includes(key)) return;

    setSelectedCells((prev) => [...prev, key]);
    setCurrentWord((prev) => prev + letter);
  };

  const finalizeSelection = () => {
    if (!data || selectedCells.length === 0) {
      setIsSelecting(false);
      return;
    }

    const word = currentWord.toUpperCase();

    if (data.palavras.includes(word) && !foundWords.includes(word)) {
      setFoundWords((prev) => [...prev, word]);
      setFoundCells((prev) => [...prev, ...selectedCells]);
    }

    setSelectedCells([]);
    setCurrentWord("");
    setIsSelecting(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || !el.classList.contains("caca-cell")) return;

    const row = el.getAttribute("data-row");
    const col = el.getAttribute("data-col");
    const letter = el.getAttribute("data-letter");

    if (row && col && letter) {
      selectCell(Number(row), Number(col), letter);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting) return;

    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el || !el.classList.contains("caca-cell")) return;

    const row = el.getAttribute("data-row");
    const col = el.getAttribute("data-col");
    const letter = el.getAttribute("data-letter");

    if (row && col && letter) {
      selectCell(Number(row), Number(col), letter);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header-gradient">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/games" />
            </IonButtons>
            <IonTitle>Carregando</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="caca-content ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Carregando caça-palavras...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!data) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header-gradient">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/games/caca-palavras" />
            </IonButtons>
            <IonTitle>Erro</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="caca-content ion-padding">
          <p>Não foi possível carregar o jogo.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/games/caca-palavras" />
          </IonButtons>
          <IonTitle>{data.titulo}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="caca-content">
        <div className="caca-container">
          <div
            className="caca-grid"
            style={{
              gridTemplateColumns: `repeat(${data.grade.colunas}, 1fr)`,
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={finalizeSelection}
            onMouseLeave={finalizeSelection}
            onTouchMove={handleTouchMove}
            onTouchEnd={finalizeSelection}
          >
            {data.grade.grade.map((linha, i) =>
              linha.map((letra, j) => {
                const key = `${i}-${j}`;
                const isSelected = selectedCells.includes(key);
                const isFound = foundCells.includes(key);

                return (
                  <div
                    key={key}
                    className={`caca-cell ${
                      isSelected ? "selected" : ""
                    } ${isFound ? "found" : ""}`}
                    data-row={i}
                    data-col={j}
                    data-letter={letra}
                    onMouseDown={() => {
                      setIsSelecting(true);
                      selectCell(i, j, letra);
                    }}
                    onTouchStart={() => {
                      setIsSelecting(true);
                      selectCell(i, j, letra);
                    }}
                  >
                    {letra}
                  </div>
                );
              })
            )}
          </div>

          <div className="palavras">
            <h3>Palavras</h3>
            <ul>
                {data.palavras.map((p) => (
                <li
                  key={p}
                  className={foundWords.includes(p) ? "found" : ""}
                >
                  {p}
                </li>
                ))}
            </ul>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CacaPalavras;
