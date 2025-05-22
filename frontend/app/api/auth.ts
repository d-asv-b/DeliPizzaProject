import type { AuthRequestData, AuthResponseData, RefreshTokenResponseData, RegRequestData, RegResponseData } from "~/models/auth";
import api from ".";

export async function refreshTokenPair(): Promise<string> {
    const response = await api.post<RefreshTokenResponseData>(
        "/account/refresh_token",
    );

    return response.data.accessToken;
}

export async function authenticateUser(data: AuthRequestData): Promise<AuthResponseData> {
    const response = await api.post<AuthResponseData>(
        "/account/sign_in",
        data
    );

    return response.data;
}

export async function registerUser(data: RegRequestData): Promise<RegResponseData> {
    const response = await api.post<RegResponseData>(
        "/account/sign_up",
        data
    );

    return response.data;
}