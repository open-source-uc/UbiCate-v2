import React from "react";

interface ContributorProps {
  login: string;
  avatar_url: string;
  html_url: string;
}

function Contribuir({ login, avatar_url, html_url }: ContributorProps) {
  return (
    <li className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 hover:bg-accent/50 transition-all duration-200 group">
      <a href={html_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-border group-hover:border-primary transition-colors">
          <img src={avatar_url} alt={login} className="w-full h-full object-cover" />
        </div>
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{login}</p>
      </a>
    </li>
  );
}

export default Contribuir;
