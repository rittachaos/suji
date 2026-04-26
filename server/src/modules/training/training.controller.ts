import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { TrainingService } from './training.service';

@Controller('training/sessions')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  list(@CurrentUser() user: { id: string }, @Query() query: PaginationQueryDto) {
    return this.trainingService.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateTrainingSessionDto) {
    return this.trainingService.create(user.id, dto);
  }

  @Get(':id')
  detail(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.trainingService.detail(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateTrainingSessionDto,
  ) {
    return this.trainingService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.trainingService.remove(user.id, id);
  }
}
