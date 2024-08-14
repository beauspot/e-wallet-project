import { gender_enum, userRole } from "@/enum/user.enum";

export interface userInterface {
  fullName: string;
  gender: gender_enum;
  email: string;
  password: string;
  bvn: string;
  role: userRole;
  date_of_birth: Date;
}
