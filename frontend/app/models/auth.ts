export interface UserPublicInfo {
    name: string;
    email: string;
    phoneNumber: string;
    birthdayDate: Date | null;
};

export interface AuthRequestData {
    email: string;
    pwdHash: string;
};

export interface RegRequestData {
    name: string;
    email: string;
    phoneNumber: string;
    pwdHash: string;
};

export type RegResponseData = AuthResponseData;

export interface AuthResponseData {
    user: UserPublicInfo;
    accessToken: string;
};

export interface RefreshTokenResponseData {
    accessToken: string;
};