export interface JwtPayload {
    username: string;
    password: string;
    permissions: string[];
}