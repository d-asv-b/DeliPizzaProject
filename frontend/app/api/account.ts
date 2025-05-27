import type { UpdateUserDataRequest, UpdateUserPwdRequest, UserProfileInfoResponse } from "~/models/account";
import api from ".";
import type { UserPublicInfo } from "~/models/auth";

export async function getUserProfileInfo(): Promise<UserPublicInfo> {
    const response = await api.get<UserProfileInfoResponse>(
        "/account/profile"
    );

    return response.data.userData;
}

export async function updateUserData(
    data: UpdateUserDataRequest
): Promise<UserPublicInfo> {
    const response = await api.patch<UserProfileInfoResponse>(
        "/account/update_data",
        data
    );

    return response.data.userData;
}

export async function updateUserPassword(
    data: UpdateUserPwdRequest
): Promise<UserPublicInfo> {
    const response = await api.patch<UserProfileInfoResponse>(
        "/account/update_password",
        data
    );

    return response.data.userData;
}

export async function logOut() {
    const response = await api.post(
        "/account/log_out"
    );
}