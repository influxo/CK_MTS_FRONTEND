export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: Role[];
    status?: string;
    twoFactorEnabled?: boolean;
    lastLogin?: Date;
}


export interface Role {
    id: number;
    name: string;
    description?: string;
}