import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { CreateStudentRelationDto } from './dto/create-student-relation.dto';
import { ReviewCoachApplicationDto } from './dto/review-coach-application.dto';

@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  users(@Query() query: AdminListQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('coach-applications')
  coachApplications(@Query() query: AdminListQueryDto) {
    return this.adminService.listCoachApplications(query);
  }

  @Patch('coach-applications/:id/review')
  reviewCoachApplication(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ReviewCoachApplicationDto,
  ) {
    return this.adminService.reviewCoachApplication(user.id, id, dto);
  }

  @Get('relations')
  relations(@Query() query: AdminListQueryDto) {
    return this.adminService.listRelations(query);
  }

  @Post('relations')
  createRelation(@Body() dto: CreateStudentRelationDto) {
    return this.adminService.createRelation(dto);
  }
}
