import { Feature } from "@/lib/types";

export interface Places {
  type: string;
  features: Feature[];
}

export interface GithubFileResponse {
  url: string;
  fileData: Places;
  file_sha: string;
}
