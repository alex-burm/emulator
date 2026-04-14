import { IsString, MinLength, MaxLength } from 'class-validator';

export class RenameProjectDto {
    @IsString()
    @MinLength(1)
    @MaxLength(128)
    name: string;
}
