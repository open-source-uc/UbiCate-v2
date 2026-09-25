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
      <div className="flex min-w-0 items-center gap-3">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 rounded-full object-cover object-top tablet:h-12 tablet:w-12"
          />
        ) : null}
        <p className="min-w-0 text-base font-medium break-words hyphens-auto text-background tablet:text-lg">{name}</p>
      </div>
      <p className="text-sm break-words text-muted">{career}</p>
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
          className="block p-4 tablet:p-6"
        >
          {content}
        </a>
      ) : (
        <div className="p-4 tablet:p-6">{content}</div>
      )}
    </li>
  );
}

export default Contribuir;
