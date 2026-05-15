import { AUTH_STORAGE_KEYS } from "@/features/auth/constants/storage";

type PersistAuthSessionParams = {
    accessToken: string;
    userUuid: string;
    userEmail: string;
    remember: boolean;
    expiresIn?: number;
};

function setAuthCookie(
    accessToken: string,
    expiresIn?: number
) {
    const maxAge =
        typeof expiresIn === "number" &&
        expiresIn > 0
            ? `; max-age=${expiresIn}`
            : "";

    document.cookie =
        `${AUTH_STORAGE_KEYS.accessToken}=` +
        `${encodeURIComponent(accessToken)}` +
        `; path=/; samesite=lax${maxAge}`;
}

export function syncAuthCookie(
    accessToken: string,
    expiresIn?: number
) {
    setAuthCookie(
        accessToken,
        expiresIn
    );
}

export function persistAuthSession({
    accessToken,
    userUuid,
    userEmail,
    remember,
    expiresIn,
}: PersistAuthSessionParams) {
    localStorage.setItem(
        AUTH_STORAGE_KEYS.accessToken,
        accessToken
    );

    localStorage.setItem(
        AUTH_STORAGE_KEYS.userUuid,
        userUuid
    );

    localStorage.setItem(
        AUTH_STORAGE_KEYS.userEmail,
        userEmail
    );

    if (remember) {
        localStorage.setItem(
            AUTH_STORAGE_KEYS.rememberLogin,
            "true"
        );
    } else {
        localStorage.removeItem(
            AUTH_STORAGE_KEYS.rememberLogin
        );
    }

    syncAuthCookie(
        accessToken,
        expiresIn
    );
}

export function clearAuthSession() {
    localStorage.removeItem(
        AUTH_STORAGE_KEYS.accessToken
    );

    localStorage.removeItem(
        AUTH_STORAGE_KEYS.userUuid
    );

    localStorage.removeItem(
        AUTH_STORAGE_KEYS.userEmail
    );

    localStorage.removeItem(
        AUTH_STORAGE_KEYS.rememberLogin
    );

    document.cookie =
        `${AUTH_STORAGE_KEYS.accessToken}=` +
        "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
}
