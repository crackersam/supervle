import { auth } from "@/auth";
import React from "react";

const Home = async () => {
  const session = await auth();
  console.log("Home session", session);
  return <div>Hello</div>;
};

export default Home;
