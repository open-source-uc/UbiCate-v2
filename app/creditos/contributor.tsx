import React from "react";

interface ContributorProps {
  login: string;
  avatar_url: string;
  html_url: string;
}

function Contribuir({ login, avatar_url, html_url }: ContributorProps) {
  return (
    <li className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      <a href={html_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center">
        <img
          src={avatar_url}
          alt={login}
          className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-gray-300 dark:border-gray-700 shadow-lg"
        />
        <p className="text-lg font-medium text-gray-800 dark:text-blue-400">{login}</p>{" "}
      </a>
    </li>
  );
}

export default Contribuir;
