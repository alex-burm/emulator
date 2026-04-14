export class ProjectResponseDto {
    id!: number;
    name!: string;
    hash!: string;
    providerId!: number;
    providerName?: string;
    createdAt!: Date;
}
