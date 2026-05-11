export class User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  department?: string;
  photoUrl?: string;
  savedEvents?: string[];
  createdAt: Date;
  updatedAt: Date;
}
