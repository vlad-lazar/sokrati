export interface Note {
  id: string;
  authorId: string;
  message: string;
  timestamp: string;
  attachements?: string[];
  updatedAt?: string;
  isFavourite: boolean;
}
