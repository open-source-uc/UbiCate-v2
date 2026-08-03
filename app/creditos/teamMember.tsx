import Image from "next/image";

import React from "react";

export interface TeamMemberProps {
  name: string;
  area: string;
  role: string;
  photo: string;
}

function TeamMember({ name, area, role, photo, isLead = false }: TeamMemberProps & { isLead?: boolean }) {
  return (
    <li
      className={`flex items-center gap-4 rounded-sm border bg-primary p-5 ${
        isLead ? "border-border/40 tablet:col-span-2 desktop:col-span-3" : "border-border/20"
      }`}
    >
      <Image
        src={photo}
        alt={name}
        width={isLead ? 80 : 64}
        height={isLead ? 80 : 64}
        className={`shrink-0 rounded-full object-cover object-top ${isLead ? "h-20 w-20" : "h-16 w-16"}`}
      />
      <div className="min-w-0 space-y-1 text-left">
        <p className={`font-medium text-background ${isLead ? "text-xl" : "text-lg"}`}>{name}</p>
        <p className="text-sm text-muted">{area}</p>
        <p className="text-xs uppercase tracking-widest text-muted/70">{role}</p>
      </div>
    </li>
  );
}

export default TeamMember;
