import type { UserProfileInfoResponse } from "~/models/account";
import api from ".";

export async function getUserProfileInfo(): Promise<UserProfileInfoResponse> {
    const { data: payload } = await api.get(
        "/account/profile"
    );

    return payload;
}