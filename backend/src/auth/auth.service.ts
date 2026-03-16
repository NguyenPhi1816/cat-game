import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { PlayerService } from '../player/player.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly playerService: PlayerService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ email: dto.email, password_hash });
    await this.userRepo.save(user);

    await this.playerService.createProfileWithHouse(user.id, dto.player_name);

    return { access_token: this._sign(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    user.last_login = new Date();
    await this.userRepo.save(user);

    return { access_token: this._sign(user) };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password_hash: _, ...profile } = user;
    return profile;
  }

  private _sign(user: User) {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
