"use client";
import Image from "next/image";
import Link from "next/link";

import { TypeAnimation } from "react-type-animation";

import LandingSearch from "./components/landingSearch";

export default function Home() {
  const phrases = ["Salas", 800, "Bibliotecas", 800, "Laboratorios", 800];

  return (
    <section className="flex max-h-screen flex-col items-center justify-between p-10">
      <div className="relative flex place-items-center">
        <Image className="relative invert" src="/logo-white.svg" alt="ubicate uc" width={180} height={37} priority />
      </div>
      <span className="text-6xl font-bold text-center text-white mt-10 pb-10">
        <TypeAnimation
          className="text-black dark:text-white select-none"
          style={{
            width: "10rem",
          }}
          sequence={phrases}
          repeat={Infinity}
          speed={3}
        />
      </span>
      <section className="justify-center w-full align-middle items-center">
        <LandingSearch />
      </section>
      <footer className="absolute inset-x-0 bottom-3 justify-center flex flex-row">
        <h3 className="dark:text-white">
          Proyecto de{" "}
          <Link className="text-blue-600 hover:underline dark:text-blue-300" href={"https://osuc.dev"}>
            Open Source UC
          </Link>
        </h3>
        <a href="https://osuc.dev" className="gap-3 font-display font-semibold text-xl">
          <svg
            viewBox="0 0 42 56"
            className="ml-1 h-4 mt-1 fill-current dark:fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16 8C16 10.9611 14.3912 13.5465 12 14.9297V33.6642C14.4498 32.5938 17.1556 32 20 32C24.4183 32 28 28.4183 28 24V22.9297C25.6088 21.5465 24 18.9611 24 16C24 11.5817 27.5817 8 32 8C36.4183 8 40 11.5817 40 16C40 18.9611 38.3912 21.5465 36 22.9297V24C36 32.8366 28.8366 40 20 40C17.5286 40 15.2318 40.7471 13.3229 42.0277C14.9656 43.4929 16 45.6256 16 48C16 52.4183 12.4183 56 8 56C3.58172 56 0 52.4183 0 48C0 45.0389 1.60879 42.4535 4 41.0703V14.9297C1.60879 13.5465 0 10.9611 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4 48C4 45.7909 5.79086 44 8 44C10.2091 44 12 45.7909 12 48C12 50.2091 10.2091 52 8 52C5.79086 52 4 50.2091 4 48ZM12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8ZM36 16C36 18.2091 34.2091 20 32 20C29.7909 20 28 18.2091 28 16C28 13.7909 29.7909 12 32 12C34.2091 12 36 13.7909 36 16Z"
            />
            <circle cx="33" cy="49" r="7" fill="#0073DE" />
          </svg>
        </a>
      </footer>
    </section>
  );
}
