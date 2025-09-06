import React from "react";

import { Github, Linkedin } from "lucide-react";

interface ContributorProps {
  firstName: string;
  lastName: string;
  githubUsername: string;
  githubUrl: string;
  linkedinUrl?: string;
  avatarUrl: string;
  role: string;
  variant?: "osuc" | "uc";
}

function EnhancedContributor({
  firstName,
  lastName,
  githubUsername,
  githubUrl,
  linkedinUrl,
  avatarUrl,
  role,
  variant = "osuc",
}: ContributorProps) {
  const variantStyles = {
    osuc: {
      card: "bg-gradient-to-br from-secondary to-secondary/80 border-muted/20",
      accent: "text-primary",
      border: "border-primary/30",
    },
    uc: {
      card: "bg-gradient-to-br from-tertiary/90 to-tertiary/70 border-tertiary/30",
      accent: "text-tertiary-foreground",
      border: "border-tertiary-foreground/30",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`
      ${styles.card} 
      rounded-xl p-6 shadow-lg hover:shadow-xl 
      transition-all duration-300 hover:scale-105 
      border ${styles.border} backdrop-blur-sm
    `}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={avatarUrl}
            alt={`${firstName} ${lastName}`}
            className="w-20 h-20 rounded-full object-cover border-4 border-muted/30 shadow-lg"
          />
          <div
            className={`
            absolute -bottom-1 -right-1 w-6 h-6 rounded-full 
            ${styles.accent === "text-primary" ? "bg-primary" : "bg-tertiary-foreground"} 
            flex items-center justify-center
          `}
          >
            <Github className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Name and Role */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            {firstName} {lastName}
          </h3>
          <p className={`text-sm font-medium ${styles.accent}`}>{role}</p>
          <p className="text-xs text-muted-foreground">@{githubUsername}</p>
        </div>

        {/* Social Links */}
        <div className="flex space-x-3 pt-2">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              p-2 rounded-lg transition-all duration-200 
              hover:scale-110 bg-background/50 hover:bg-background/80
              border ${styles.border}
            `}
            title={`Ver perfil de GitHub de ${firstName}`}
          >
            <Github className="w-4 h-4 text-foreground" />
          </a>

          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                p-2 rounded-lg transition-all duration-200 
                hover:scale-110 bg-background/50 hover:bg-background/80
                border ${styles.border}
              `}
              title={`Ver perfil de LinkedIn de ${firstName}`}
            >
              <Linkedin className="w-4 h-4 text-foreground" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default EnhancedContributor;
