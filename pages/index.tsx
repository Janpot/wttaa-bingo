import type { GetServerSideProps, NextPage } from "next";
import * as React from "react";
import { getRandomBoardUrl } from "../src/bingo";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      permanent: false,
      destination: getRandomBoardUrl(),
    },
  };
};

const Home: NextPage = () => {
  return <div />;
};

export default Home;
