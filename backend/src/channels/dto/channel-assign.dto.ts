import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChannelAssignDto {
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  password: string;
}
