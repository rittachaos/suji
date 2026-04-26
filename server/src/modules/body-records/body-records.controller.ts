import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BodyRecordsService } from './body-records.service';
import { CreateBodyRecordDto } from './dto/create-body-record.dto';

@Controller('body-records')
export class BodyRecordsController {
  constructor(private readonly bodyRecordsService: BodyRecordsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }, @Query() query: PaginationQueryDto) {
    return this.bodyRecordsService.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBodyRecordDto) {
    return this.bodyRecordsService.create(user.id, dto);
  }

  @Get(':id')
  detail(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.bodyRecordsService.detail(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateBodyRecordDto,
  ) {
    return this.bodyRecordsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.bodyRecordsService.remove(user.id, id);
  }
}
