"use client";
import * as React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const NavBar = () => {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <nav className="navbar">
      <a href="/" className="flex gap-2 items-center">
        <div className="text-2xl font-bold">Tested</div>
        <img src="/logo.png" alt="logo" className="logo" />
      </a>
      <div className="menu items-center flex flex-row justify-center h-full">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/create">Create</a>
        <button
          onClick={() =>
            account.status == "connected"
              ? disconnect()
              : connect({ chainId: 11155111, connector: connectors[0] })
          }
          className="connect-btn"
        >
          {account.address ?? "Connect"}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
