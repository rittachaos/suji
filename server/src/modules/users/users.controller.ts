import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  upsertProfile(@CurrentUser() user: { id: string }, @Body() dto: UpsertProfileDto) {
    return this.usersService.upsertProfile(user.id, dto);
  }

  @Get('goal')
  getGoal(@CurrentUser() user: { id: string }) {
    return this.usersService.getGoal(user.id);
  }

  @Put('goal')
  upsertGoal(@CurrentUser() user: { id: string }, @Body() dto: UpsertGoalDto) {
    return this.usersService.upsertGoal(user.id, dto);
  }
}
