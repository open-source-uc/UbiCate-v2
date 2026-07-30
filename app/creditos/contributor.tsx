import Image from "next/image";

import React from "react";

interface ContributorProps {
  name: string;
  career: string;
  photo?: string;
  github?: string;
}

function Contribuir({ name, career, photo, github }: ContributorProps) {
  const content = (
    <div className="space-y-3 text-left">
      <div className="flex items-center gap-3">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover object-top"
          />
        ) : null}
        <p className="min-w-0 text-lg font-medium text-background">{name}</p>
      </div>
      <p className="text-sm text-muted">{career}</p>
    </div>
  );

  return (
    <li
      className={`rounded-sm border border-border/20 bg-primary transition ${
        github ? "hover:border-border/50 hover:bg-background/5" : ""
      }`}
    >
      {github ? (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Perfil de GitHub de ${name}`}
          className="block p-6"
        >
          {content}
        </a>
      ) : (
        <div className="p-6">{content}</div>
      )}
    </li>
  );
}

export default Contribuir;
