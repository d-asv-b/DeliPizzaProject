import type { UpdateUserDataRequest, UpdateUserPwdRequest, UserProfileInfoResponse } from "~/models/account";
import api from ".";
import type { UserPublicInfo } from "~/models/auth";

export async function getUserProfileInfo(): Promise<UserPublicInfo> {
    const response = await api.get<null, UserProfileInfoResponse>(
        "/account/profile"
    );

    return response.userData;
}

export async function updateUserData(
    data: UpdateUserDataRequest
): Promise<UserPublicInfo> {
    const response = await api.patch<UpdateUserDataRequest, UserProfileInfoResponse>(
        "/account/update_data",
        data
    );

    return response.userData;
}

export async function updateUserPassword(
    data: UpdateUserPwdRequest
): Promise<UserPublicInfo> {
    const response = await api.patch<UpdateUserPwdRequest, UserProfileInfoResponse>(
        "/account/update_password",
        data
    );

    return response.userData;
}