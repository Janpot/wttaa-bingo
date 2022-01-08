import type { GetServerSideProps, NextPage } from "next";
import * as React from "react";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      permanent: false,
      destination: `/${String(Math.random()).slice(2, 10)}`,
    },
  };
};

const Home: NextPage = () => {
  return <div />;
};

export default Home;
