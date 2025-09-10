export interface Contributor {
  id: string;
  firstName: string;
  lastName: string;
  githubUsername: string;
  githubUrl: string;
  linkedinUrl?: string;
  avatarUrl: string;
  role: string;
}

export interface ContributorsData {
  osuc_contributors: Contributor[];
  uc_contributors: Contributor[];
}
