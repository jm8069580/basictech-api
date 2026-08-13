import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('ADMIN')
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Roles('ADMIN')
  @Get('orders')
  getOrders(@Query() query: AdminOrdersQueryDto) {
    return this.adminService.getOrders(query);
  }
}
