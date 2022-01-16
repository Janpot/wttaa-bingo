import {
  Button,
  ButtonBase,
  Container,
  darken,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import * as React from "react";
import seedRandom from "seed-random";
import confetti from "canvas-confetti";
import { NextLinkComposed } from "../src/Link";
import clsx from "clsx";
import CloseIcon from "@mui/icons-material/Close";
import GitHubIcon from "@mui/icons-material/GitHub";
import { getRandomBoardUrl } from "../src/bingo";

interface BingoTile {
  value: string;
}

const BINGO_TILES: BingoTile[] = [
  {
    value: "Wa ne schone vent is ...",
  },
  {
    value: "..., of zo.",
  },
  {
    value: "Andries heeft een docu gezien",
  },
  {
    value: 'Alex wint "het Leids"',
  },
  {
    value: "de WC onder de trap",
  },
  {
    value: "Mijne papa is nen Engelsman",
  },
  {
    value: "Alex is geïrriteerd door woke",
  },
  {
    value: "Gunther Lamoot imitatie",
  },
  {
    value: "Bill Burr imitatie",
  },
  {
    value: "Sportpaleis uitverkocht",
  },
  {
    value: "Andries heeft niet opgelet",
  },
  {
    value: "Bro Science",
  },
  {
    value: "Alex en Andries krijgen drank",
  },
  {
    value: "Ik heb nog karate gedaan",
  },
  {
    value: '"Als ge van slechte wil zijt"',
  },
  {
    value: "Moeder is grootste fan",
  },
  {
    value: "Bazart komt aan bod",
  },
  {
    value: '"Da\'s kei schattig"',
  },
  {
    value: "Alex en Andries bromance",
  },
  {
    value: "Alex houdt van Davy Gillis",
  },
  {
    value: "Mekanik strip wordt vermeld",
  },
  {
    value: "Fokke van der Meulen",
  },
  {
    value: '"Een gigantisch pak rammel"',
  },
  {
    value: "Bij Vlaamse Opera gewerkt",
  },
];

// https://stackoverflow.com/a/2450976/419436
function shuffle<T>(array: readonly T[], seed: string): T[] {
  const result = [...array];
  let currentIndex = result.length,
    randomIndex;
  const random = seedRandom(seed);

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [result[currentIndex], result[randomIndex]] = [
      result[randomIndex],
      result[currentIndex],
    ];
  }

  return result;
}

const BingoBoard = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 5,
  fontWeight: "bold",
});

const BingoTile = styled(ButtonBase)(({ theme }) => ({
  aspectRatio: "1",
  padding: 10,
  display: "flex",
  alignItems: "center",
  textAlign: "center",
  overflow: "hidden",
  color: theme.palette.getContrastText(
    darken(theme.palette.action.active, 0.35)
  ),
  background: darken(theme.palette.action.active, 0.35),
  fontSize: 20,
  [theme.breakpoints.down("sm")]: {
    padding: 3,
    fontSize: 14,
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: 5,
  },
  "&:hover": {
    color: theme.palette.getContrastText(
      darken(theme.palette.action.active, 0.25)
    ),
    background: darken(theme.palette.action.active, 0.25),
  },
  "&.active": {
    color: theme.palette.getContrastText(theme.palette.action.active),
    background: theme.palette.action.active,
    ["& .circle"]: {
      display: "block",
    },
  },
}));

function asArray<T>(maybeArray: T[] | T | undefined | null): T[] {
  return Array.isArray(maybeArray)
    ? maybeArray
    : typeof maybeArray === "string"
    ? [maybeArray]
    : [];
}

type State = boolean[];

function hex2ToBin16(hex: string): string {
  return (parseInt(hex, 16) || 0).toString(2).padStart(16, "0");
}

function bin16ToHex2(bin: string): string {
  return (parseInt(bin, 2) || 0).toString(16).padStart(4, "0");
}

function parseState(input: string | string[] | undefined): State {
  const asString = asArray(input)[0] ?? "";
  const stateParam = hex2ToBin16(asString);
  const state = stateParam.split("");
  return state.map((x) => !!Number(x));
}

function toggleState(state: State, index: number): State {
  return state.map((x, i) => (i === index ? !x : x));
}

function serializeState(state: State): string {
  return bin16ToHex2(state.map((x) => (x ? "1" : "0")).join(""));
}

function getTile(state: State, r: number, c: number): boolean {
  return state[r * 4 + c];
}

function isBingo(state: State): boolean {
  return countBingo(state) > 0;
}

function countBingo(state: State): number {
  const bingoRows = [0, 1, 2, 3].filter((i) =>
    [0, 1, 2, 3].every((j) => getTile(state, i, j))
  );
  const bingoColumns = [0, 1, 2, 3].filter((i) =>
    [0, 1, 2, 3].every((j) => getTile(state, j, i))
  );
  const bingoDiagonal1 = [0, 1, 2, 3].every((i) => getTile(state, i, i))
    ? 1
    : 0;
  const bingoDiagonal2 = [0, 1, 2, 3].every((i) => getTile(state, 3 - i, i))
    ? 1
    : 0;
  return (
    bingoRows.length + bingoColumns.length + bingoDiagonal1 + bingoDiagonal2
  );
}

const EMPTY_BOARD: BingoTile[] = new Array(16).fill({ value: "" });

const Home: NextPage = () => {
  const router = useRouter();
  const [board, setBoard] = React.useState<BingoTile[]>(EMPTY_BOARD);
  const { state: rawState } = router.query;
  const state = parseState(rawState);
  const bingos = countBingo(state);
  const seed: undefined | string = asArray(router.query.seed)[0];
  const [instructionsOpen, setInstructionsOpen] = React.useState(false);

  React.useEffect(() => {
    if (router.isReady) {
      if (seed) {
        setBoard(shuffle(BINGO_TILES, seed).slice(0, 16));
      } else {
        router.replace(getRandomBoardUrl());
      }
    }
  }, [router.isReady, seed]);

  const handleClick = (i: number) => () => {
    const state = parseState(router.query.state);
    const newState = toggleState(state, i);
    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          state: serializeState(newState),
        },
      },
      undefined,
      { scroll: false }
    );
  };

  const prevBingos = React.useRef(bingos);
  React.useEffect(() => {
    if (bingos - prevBingos.current > 0) {
      confetti({
        particleCount: 150,
        spread: 180,
      });
    }
    prevBingos.current = bingos;
  }, [bingos]);

  const handleNewBoard = React.useCallback(() => {
    router.push(getRandomBoardUrl());
  }, [router]);

  return (
    <Container maxWidth="sm">
      <Stack spacing={3} alignItems="stretch" my={2}>
        <Stack my={3} direction="row" spacing={2} justifyContent="center">
          <Button onClick={handleNewBoard} color="inherit" variant="outlined">
            Nieuwe kaart
          </Button>
          <Button
            component={NextLinkComposed}
            to={router.asPath.split("?")[0]}
            color="inherit"
            variant="outlined"
          >
            Reset
          </Button>
          <Button
            onClick={() => setInstructionsOpen(true)}
            color="inherit"
            variant="outlined"
          >
            ?
          </Button>
        </Stack>
        <Typography textAlign="center">
          {bingos > 0 ? "🎉 BINGO! 🎉" : <>&nbsp;</>}
        </Typography>
        <BingoBoard>
          {board.map((tile, i) => (
            <BingoTile
              onClick={handleClick(i)}
              className={clsx({ active: state[i] })}
              key={i}
            >
              {tile.value}
            </BingoTile>
          ))}
        </BingoBoard>
        <Stack direction="row-reverse">
          <IconButton
            aria-label="close"
            component={NextLinkComposed}
            to="https://github.com/Janpot/wttaa-bingo"
            color="inherit"
          >
            <GitHubIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Dialog
        fullWidth
        onClose={() => setInstructionsOpen(false)}
        open={instructionsOpen}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Instructies
          <IconButton
            aria-label="close"
            onClick={() => setInstructionsOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Speel tijdens het beluisteren van de podcast. De regels zijn
            eenvoudig: Wanneer een van de items op de bingokaart aan bod komt,
            vink je het vakje af. Wie het eerst 4 vakjes naast elkaar afvinkt,
            wint!
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Home;
