import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    name!: string;

    @IsInt()
    @Min(1)
    providerId!: number;
}
