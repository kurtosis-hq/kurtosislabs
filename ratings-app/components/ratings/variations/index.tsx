import { getPosition } from "@/data/ratings";
import { LedgerOverview, LedgerPosition } from "./v1-ledger";
import { DossierOverview, DossierPosition } from "./v2-dossier";
import { BentoOverview, BentoPosition } from "./v3-bento";
import { ConsoleView } from "./v4-console";
import { MatrixOverview, MatrixPosition } from "./v5-matrix";

const onyc = getPosition("onyc")!;

export const variations = [
  {
    id: "1",
    name: "Ledger",
    idea: "The brief as written. Ondo-style scannable table with a summary-card trio, Elfa-style position page with a six-cell status strip and a sticky Related sidebar.",
    overview: <LedgerOverview />,
    position: <LedgerPosition p={onyc} />,
  },
  {
    id: "2",
    name: "Dossier",
    idea: "A research report. One reading column on white, numbered sections and hairline rules instead of cards. Reads like something you would take to an investment committee.",
    overview: <DossierOverview />,
    position: <DossierPosition p={onyc} />,
  },
  {
    id: "3",
    name: "Bento",
    idea: "Everything is a white card on a pale navy Panel. Positions become a 2 × 2 card grid; the position page opens with a grid of grade, bottom line and the three key risks.",
    overview: <BentoOverview />,
    position: <BentoPosition p={onyc} />,
  },
  {
    id: "4",
    name: "Console",
    idea: "Master and detail on one screen. The position list stays on the left; the selected assessment reads on the right. Fastest for moving between positions.",
    overview: <ConsoleView />,
    position: null,
  },
  {
    id: "5",
    name: "Matrix",
    idea: "Built around the four evidence gates. The overview is a positions × gates matrix showing why every grade is withheld; the position page leads with the four gates.",
    overview: <MatrixOverview />,
    position: <MatrixPosition p={onyc} />,
  },
];
