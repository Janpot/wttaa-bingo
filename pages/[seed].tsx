import {
  Box,
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

interface BingoTile {
  value: string;
}

const BINGO_TILES: BingoTile[] = [
  {
    value: "Wa ne schone vent is ...",
  },
  {
    value: "Mijne papa was nen Engelsman",
  },
  {
    value: "Stopwoord: ..., of zo.",
  },
  {
    value: "Andries heeft een docu gezien",
  },
  {
    value: 'Alex wint "het Leids"',
  },
  {
    value: "Iemand moet naar de WC onder de trap",
  },
  {
    value: "Alex is geirriteerd door woke",
  },
  {
    value: "Alex imiteert Gunther Lamoot",
  },
  {
    value: "Alex imiteert Bill Burr",
  },
  {
    value: "Sportpaleis uitverkocht",
  },
  {
    value: "Andries heeft niet opgelet",
  },
  {
    value: "Joe Rogan Bro Science",
  },
  {
    value: "Alex en Andries krijgen een geschenk",
  },
  {
    value: "Ik heb gevechtsport gedaan",
  },
  {
    value: "Als ge van slechte wil zijt",
  },
  {
    value: "Bazart",
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
  return (
    [0, 1, 2, 3].some(
      (i) =>
        [0, 1, 2, 3].every((j) => getTile(state, i, j)) ||
        [0, 1, 2, 3].every((j) => getTile(state, j, i))
    ) ||
    [0, 1, 2, 3].every((i) => getTile(state, i, i)) ||
    [0, 1, 2, 3].every((i) => getTile(state, 3 - i, i))
  );
}

const Home: NextPage = () => {
  const router = useRouter();
  const [board, setBoard] = React.useState<BingoTile[] | null>(null);
  const { state: rawState } = router.query;
  const state = parseState(rawState);
  const win = isBingo(state);
  const seed = router.query.seed as string;
  const [instructionsOpen, setInstructionsOpen] = React.useState(false);

  React.useEffect(() => {
    if (router.isReady) {
      setBoard(shuffle(BINGO_TILES, seed).slice(0, 16));
    }
  }, [router.isReady, seed]);

  const handleClick = (i: number) => () => {
    const state = parseState(router.query.state);
    const newState = toggleState(state, i);
    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        state: serializeState(newState),
      },
    });
  };

  React.useEffect(() => {
    if (win) {
      confetti({
        particleCount: 150,
        spread: 180,
      });
    }
  }, [win]);

  return (
    <Container maxWidth="sm">
      <Box>
        <Stack my={3} direction="row-reverse" spacing={2}>
          <Button
            onClick={() => setInstructionsOpen(true)}
            color="inherit"
            variant="outlined"
          >
            ?
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
            component={NextLinkComposed}
            to="/"
            color="inherit"
            variant="outlined"
          >
            Nieuwe kaart
          </Button>
        </Stack>
        {board ? (
          <BingoBoard>
            {board.map((tile, i) => (
              <BingoTile
                onClick={handleClick(i)}
                className={clsx({ active: state[i] })}
                key={i}
              >
                {tile.value}
                <div className="circle" />
              </BingoTile>
            ))}
          </BingoBoard>
        ) : null}
      </Box>
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
            eenvoudig:
          </Typography>

          <Typography>
            Wanneer een van de items op de bingokaart aan bod komt, vink je het
            vakje af en drink je. Wie het eerst 3 vakjes naast elkaar afvinkt,
            wint!
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Home;
