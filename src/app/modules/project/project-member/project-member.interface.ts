import { ProjectRole } from "../../../../generated/prisma";

export interface IAddProjectMember {
  userId: string;
  role: ProjectRole;
}

export interface IUpdateProjectMember {
  role: ProjectRole;
}
