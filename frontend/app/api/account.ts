import type { UpdateUserDataRequest, UpdateUserPwdRequest, UserProfileInfoResponse } from "~/models/account";
import api from ".";
import type { UserPublicInfo } from "~/models/auth";

export async function getUserProfileInfo(): Promise<UserProfileInfoResponse> {
    const { data: payload } = await api.get(
        "/account/profile"
    );

    return payload;
}

export async function updateUserData(
    data: UpdateUserDataRequest
): Promise<UserPublicInfo> {
    const { data: payload } = await api.patch(
        "/account/update_data",
        data
    );

    return payload;
}

export async function updateUserPassword(
    data: UpdateUserPwdRequest
): Promise<UserPublicInfo> {
    const { data: payload } = await api.patch(
        "/account/Update_password",
        data
    );

    return payload;
}