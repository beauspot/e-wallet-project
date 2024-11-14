import { gender_enum, userRole } from "@/enum/user.enum";

interface userInterface {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dob: Date;
  password: string;
  nin: string;
  bvn: string;
  gender: gender_enum;
  role: userRole;
  account_no: string;
  date_of_birth: Date;
}

interface DecodedToken {
  id: string;
  iat: number;
};

export { userInterface, DecodedToken };