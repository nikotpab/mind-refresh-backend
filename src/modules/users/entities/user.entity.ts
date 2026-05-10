import { Role } from '../../../common/enums/role.enum';

export class User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
