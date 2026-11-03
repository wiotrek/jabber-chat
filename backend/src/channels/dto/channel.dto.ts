import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChannelDto {

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(512)
  password: string;
}
