import React from "react";

interface ContributorProps {
  name: string;
  career: string;
}

function Contribuir({ name, career }: ContributorProps) {
  return (
    <li className="rounded-sm border border-border/20 bg-primary p-6">
      <div className="space-y-2 text-left">
        <p className="text-lg font-medium text-background">{name}</p>
        <p className="text-sm text-muted">{career}</p>
      </div>
    </li>
  );
}

export default Contribuir;
