import type { UserPublicInfo } from "./auth";

export interface UserProfileInfoResponse {
    userData: UserPublicInfo;
}

export interface UpdateUserDataRequest {
    name?: string;
    phoneNumber?: string;
    email?: string;
    birthdayDate?: Date;
    fieldName: "name" | "phoneNumber" | "email" | "birthdayDate";
}

export interface UpdateUserPwdRequest {
    oldPassword: string;
    newPassword: string;
}