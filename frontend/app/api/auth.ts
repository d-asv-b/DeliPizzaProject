import type { AuthRequestData, AuthResponseData, RefreshTokenResponseData, RegRequestData, RegResponseData } from "~/models/auth";
import api from ".";

export async function refreshTokenPair(): Promise<string> {
    const response = await api.post<null, RefreshTokenResponseData>(
        "/account/refresh_token",
    );

    return response.accessToken;
}

export async function authenticateUser(data: AuthRequestData): Promise<AuthResponseData> {
    const response = await api.post<AuthRequestData, AuthResponseData>(
        "/account/sign_in",
        data
    );

    return response;
}

export async function registerUser(data: RegRequestData): Promise<RegResponseData> {
    const response = await api.post<RegRequestData, RegResponseData>(
        "/account/sign_up",
        data
    );

    return response;
}