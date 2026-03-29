import { UserRepository } from "./user.repository";
import { ConflictError, NotFoundError } from "../../shared/Utils/Errors";

const repo = new UserRepository();

export interface CreateUserDto {
  email: string;
  phone?: string;
}

export class UserService {
  async createUser(dto: CreateUserDto) {
    const existing = await repo.findByEmail(dto.email);
    if (existing) throw new ConflictError("User with this email already exists");

    return repo.create({
      email: dto.email,
      phone: dto.phone,
    });
  }

  async getUser(id: string) {
    const user = await repo.findById(id);
    if (!user) throw new NotFoundError("User");
    return user;
  }
}
