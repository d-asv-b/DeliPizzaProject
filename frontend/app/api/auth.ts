import type { AuthRequestData, AuthResponseData, RefreshTokenResponseData, RegRequestData, RegResponseData } from "~/models/auth";
import api from ".";

export async function refreshTokenPair(): Promise<RefreshTokenResponseData> {
    const { data: payload } = await api.post<RefreshTokenResponseData>(
        "/account/refreshToken",
    );

    return payload;
}

export async function authenticateUser(data: AuthRequestData): Promise<AuthResponseData> {
    const { data: payload } = await api.post<AuthResponseData>(
        "/account/signIn",
        data
    );

    return payload;
}

export async function registerUser(data: RegRequestData): Promise<RegResponseData> {
    const { data: payload } = await api.post<RegResponseData>(
        "/account/signUp",
        data
    );

    return payload;
}