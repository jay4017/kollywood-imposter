import { useMemo, useState } from "react";
import rawCsv from "./kollywoodData.csv?raw";

const defaultSettings = {
  playerCount: 6,
  imposterCount: 1,
  category: "Movie",
  difficulty: "Easy",
};

const parseCsv = (csvText) => {
  const [headerLine, ...rows] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((item) => item.trim().toLowerCase());

  return rows
    .map((row) => {
      const columns = row.split(",");
      return headers.reduce((entry, header, index) => {
        entry[header] = (columns[index] || "").trim();
        return entry;
      }, {});
    })
    .filter((entry) => entry.category && entry.difficulty && entry.name);
};

const normalizeCategoryLabel = (category) =>
  category === "Artist" ? "Artists" : "Movies";

const createRange = (count) => Array.from({ length: count }, (_, index) => index + 1);

const shuffleArray = (items) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

const pickUniqueWord = (dataset, settings, usedWords) => {
  const candidates = dataset.filter(
    (entry) =>
      entry.category === settings.category &&
      entry.difficulty === settings.difficulty &&
      !usedWords.has(`${entry.category}:${entry.difficulty}:${entry.name}`),
  );

  if (!candidates.length) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
};

const getRoleCard = (isImposter, word) =>
  isImposter
    ? {
        title: "You are the IMPOSTER",
        body: "Blend in. Listen carefully, speak vaguely, and avoid being exposed.",
      }
    : {
        title: word,
        body: "Memorize the secret and pass the phone before anyone else sees it.",
      };

const StatChip = ({ label, value }) => (
  <div className="rounded-full border border-gold/20 bg-white/5 px-4 py-2 text-center shadow-glow">
    <div className="text-[11px] uppercase tracking-[0.3em] text-amber/70">{label}</div>
    <div className="mt-1 text-sm font-semibold text-amber">{value}</div>
  </div>
);

const SelectInput = ({ label, value, options, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-amber">{label}</span>
    <select
      className="w-full rounded-2xl border border-gold/20 bg-black/40 px-4 py-4 text-lg text-white outline-none transition focus:border-gold"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-neutral-900">
          {option}
        </option>
      ))}
    </select>
  </label>
);

const NumericSelect = ({ label, value, options, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-amber">{label}</span>
    <select
      className="w-full rounded-2xl border border-gold/20 bg-black/40 px-4 py-4 text-lg text-white outline-none transition focus:border-gold"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-neutral-900">
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default function App() {
  const dataset = useMemo(() => parseCsv(rawCsv), []);
  const [settings, setSettings] = useState(defaultSettings);
  const [screen, setScreen] = useState("menu");
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isRoleVisible, setIsRoleVisible] = useState(false);
  const [usedWords, setUsedWords] = useState(() => new Set());
  const [roundWord, setRoundWord] = useState(null);
  const [imposterPlayers, setImposterPlayers] = useState([]);
  const [menuError, setMenuError] = useState("");

  const filteredPool = useMemo(
    () =>
      dataset.filter(
        (entry) =>
          entry.category === settings.category && entry.difficulty === settings.difficulty,
      ),
    [dataset, settings.category, settings.difficulty],
  );

  const usedCountForSelection = filteredPool.filter((entry) =>
    usedWords.has(`${entry.category}:${entry.difficulty}:${entry.name}`),
  ).length;

  const currentRole = getRoleCard(imposterPlayers.includes(currentPlayer), roundWord?.name);

  const startRound = (nextSettings = settings) => {
    if (nextSettings.imposterCount >= nextSettings.playerCount) {
      setMenuError("Imposters must be fewer than the total number of players.");
      return;
    }

    const chosenWord = pickUniqueWord(dataset, nextSettings, usedWords);

    if (!chosenWord) {
      setMenuError(
        `No unused ${nextSettings.difficulty.toLowerCase()} ${normalizeCategoryLabel(
          nextSettings.category,
        ).toLowerCase()} remain in this session.`,
      );
      return;
    }

    const playerNumbers = createRange(nextSettings.playerCount);
    const shuffledPlayers = shuffleArray(playerNumbers);
    const selectedImposters = shuffledPlayers.slice(0, nextSettings.imposterCount).sort(
      (left, right) => left - right,
    );

    setMenuError("");
    setRoundWord(chosenWord);
    setImposterPlayers(selectedImposters);
    setCurrentPlayer(1);
    setIsRoleVisible(false);
    setScreen("reveal");
    setUsedWords((previous) => {
      const next = new Set(previous);
      next.add(`${chosenWord.category}:${chosenWord.difficulty}:${chosenWord.name}`);
      return next;
    });
  };

  const handleHideAndPass = () => {
    if (currentPlayer < settings.playerCount) {
      setCurrentPlayer((player) => player + 1);
      setIsRoleVisible(false);
      return;
    }

    setIsRoleVisible(false);
    setScreen("game");
  };

  const returnToMenu = () => {
    setScreen("menu");
    setCurrentPlayer(1);
    setIsRoleVisible(false);
    setRoundWord(null);
    setImposterPlayers([]);
    setMenuError("");
  };

  const resetWordHistory = () => {
    setUsedWords(new Set());
    setMenuError("");
  };

  const maxImposters = Math.min(3, settings.playerCount - 1);
  const playerOptions = createRange(13).map((offset) => offset + 2);
  const imposterOptions = createRange(maxImposters);

  return (
    <main className="min-h-screen bg-spotlight px-4 py-6 pt-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <section className="cinema-frame relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-b from-velvet/95 via-black to-black p-5 shadow-glow">
          <div className="relative z-10">
            <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex shrink-0 items-center justify-center">
                <img
                  src="/logo-silhouette.png"
                  alt="Kollywood Imposter logo"
                  className="h-20 w-20 object-contain"
                />
              </div>
              <div className="ticket-title relative min-w-0 flex-1 rounded-full border border-dashed border-amber-500/50 bg-black/40 px-5 py-4 text-center backdrop-blur-sm sm:text-left">
                <span className="ticket-hole left-0 -translate-x-1/2" />
                <span className="ticket-hole right-0 translate-x-1/2" />
                <p className="text-xs uppercase tracking-[0.5em] text-amber/60">Pass-and-Play</p>
                <h1 className="ticket-text mt-2 text-3xl font-black uppercase leading-none text-amber-500 sm:text-4xl">
                  Kollywood Imposter
                </h1>
              </div>
            </div>

            {screen === "menu" && (
              <div className="space-y-5">
                <p className="rounded-2xl border border-gold/15 bg-white/5 px-4 py-4 text-sm leading-6 text-stone-200">
                  Pass the phone, reveal one secret at a time, and find the imposters before they
                  blend into the conversation.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <NumericSelect
                    label="Players"
                    value={settings.playerCount}
                    options={playerOptions}
                    onChange={(value) =>
                      setSettings((previous) => {
                        const playerCount = value;
                        const imposterCount = Math.min(previous.imposterCount, playerCount - 1);
                        return { ...previous, playerCount, imposterCount };
                      })
                    }
                  />
                  <NumericSelect
                    label="Imposters"
                    value={settings.imposterCount}
                    options={imposterOptions}
                    onChange={(value) =>
                      setSettings((previous) => ({
                        ...previous,
                        imposterCount: value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SelectInput
                    label="Mode"
                    value={settings.category}
                    options={["Movie", "Artist"]}
                    onChange={(value) =>
                      setSettings((previous) => ({ ...previous, category: value }))
                    }
                  />
                  <SelectInput
                    label="Difficulty"
                    value={settings.difficulty}
                    options={["Easy", "Medium", "Hard"]}
                    onChange={(value) =>
                      setSettings((previous) => ({ ...previous, difficulty: value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatChip label="Pool Size" value={filteredPool.length} />
                  <StatChip label="Used" value={usedCountForSelection} />
                  <StatChip
                    label="Left"
                    value={Math.max(filteredPool.length - usedCountForSelection, 0)}
                  />
                </div>

                {menuError ? (
                  <div className="rounded-2xl border border-red-400/25 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                    {menuError}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => startRound()}
                  className="w-full rounded-2xl bg-gold px-5 py-4 text-lg font-black uppercase tracking-[0.2em] text-black transition hover:brightness-105 active:scale-[0.99]"
                >
                  Start Round
                </button>

                <button
                  type="button"
                  onClick={resetWordHistory}
                  className="w-full rounded-2xl border border-gold/25 bg-white/5 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-amber transition hover:bg-white/10"
                >
                  Reset Used Words
                </button>
              </div>
            )}

            {screen === "reveal" && (
              <div className="space-y-5 text-center">
                <div className="rounded-[1.75rem] border border-gold/20 bg-black/45 px-5 py-6">
                  <p className="text-xs uppercase tracking-[0.5em] text-amber/60">
                    Secret Reveal
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-white">Player {currentPlayer}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-300">
                    {isRoleVisible
                      ? "Memorize this, hide it, then pass the phone."
                      : "Make sure only you can see the screen, then tap below."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRoleVisible((visible) => !visible)}
                  className={`min-h-[18rem] w-full rounded-[2rem] border px-6 py-8 text-center transition ${
                    isRoleVisible
                      ? "border-gold/40 bg-gradient-to-b from-gold/20 to-ember text-white"
                      : "border-dashed border-gold/25 bg-white/5 text-amber"
                  }`}
                >
                  {!isRoleVisible ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.45em] text-amber/70">
                        Hidden Role
                      </p>
                      <h3 className="mt-4 text-3xl font-black uppercase tracking-[0.15em]">
                        Tap To See Secret
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-stone-300">
                        Everyone else: look away.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs uppercase tracking-[0.45em] text-amber/70">
                        Your Role
                      </p>
                      <h3 className="mt-4 text-3xl font-black leading-tight text-amber">
                        {currentRole.title}
                      </h3>
                      <p className="mt-4 text-base leading-7 text-stone-100">{currentRole.body}</p>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleHideAndPass}
                  disabled={!isRoleVisible}
                  className="w-full rounded-2xl border border-gold/25 bg-white/5 px-5 py-4 text-base font-bold uppercase tracking-[0.18em] text-amber transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {currentPlayer === settings.playerCount
                    ? "Hide And Start Game"
                    : "Hide And Pass To Next Player"}
                </button>
              </div>
            )}

            {screen === "game" && (
              <div className="space-y-5 text-center">
                <div className="rounded-[1.75rem] border border-gold/20 bg-black/45 px-5 py-6">
                  <p className="text-xs uppercase tracking-[0.5em] text-amber/60">Round Ready</p>
                  <h2 className="mt-3 text-4xl font-black text-amber">Game In Progress</h2>
                  <p className="mt-4 text-sm leading-6 text-stone-300">
                    Discuss carefully. Civilians want to find the imposters. Imposters want to
                    survive without knowing the secret word.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatChip label="Mode" value={normalizeCategoryLabel(settings.category)} />
                  <StatChip label="Difficulty" value={settings.difficulty} />
                  <StatChip label="Imposters" value={imposterPlayers.length} />
                </div>

                <details className="rounded-2xl border border-gold/20 bg-white/5 px-4 py-4 text-left">
                  <summary className="cursor-pointer list-none text-center text-base font-bold uppercase tracking-[0.18em] text-amber">
                    Reveal Imposters
                  </summary>
                  <div className="mt-4 rounded-2xl border border-gold/15 bg-black/35 px-4 py-4">
                    <p className="text-sm text-stone-200">
                      Imposters were Player {imposterPlayers.join(", Player ")}.
                    </p>
                  </div>
                </details>

                <button
                  type="button"
                  onClick={() => startRound(settings)}
                  className="w-full rounded-2xl bg-gold px-5 py-4 text-lg font-black uppercase tracking-[0.18em] text-black transition hover:brightness-105 active:scale-[0.99]"
                >
                  Start Next Round
                </button>

                <button
                  type="button"
                  onClick={returnToMenu}
                  className="w-full rounded-2xl border border-gold/25 bg-white/5 px-5 py-4 text-base font-bold uppercase tracking-[0.18em] text-amber transition hover:bg-white/10"
                >
                  Return To Menu
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
