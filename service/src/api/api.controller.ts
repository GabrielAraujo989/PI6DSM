import { Controller, Post, Get, Patch, Delete, Body, Param, Logger, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { ApiDataDto } from './dto/api-data.dto';

@Controller('api')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(private readonly apiService: ApiService) {
    this.logger.log('ApiController inicializado');
  }

  @Post('data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_USER, UserRole.ADMIN)
  async receiveData(@Body() apiDataDto: ApiDataDto) {
    this.logger.log(`Dados recebidos: ${JSON.stringify(apiDataDto)}`);
    try {
      const result = await this.apiService.sendData(apiDataDto);
      this.logger.log(`Dados processados com sucesso: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao processar dados: ${error.message}`);
      throw error;
    }
  }

  @Get('data/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_USER, UserRole.ADMIN)
  async getData(@Param('id') id: string) {
    this.logger.log(`Buscando dados para ID: ${id}`);
    try {
      const result = await this.apiService.getData(id);
      this.logger.log(`Dados encontrados: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao buscar dados: ${error.message}`);
      throw error;
    }
  }

  @Patch('data/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_USER, UserRole.ADMIN)
  async updateData(@Param('id') id: string, @Body() apiDataDto: ApiDataDto) {
    this.logger.log(`Atualizando dados para ID: ${id}`);
    this.logger.log(`Novos dados: ${JSON.stringify(apiDataDto)}`);
    try {
      const result = await this.apiService.updateData(id, apiDataDto);
      this.logger.log(`Dados atualizados com sucesso: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao atualizar dados: ${error.message}`);
      throw error;
    }
  }

  @Delete('data/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_USER, UserRole.ADMIN)
  async deleteData(@Param('id') id: string) {
    this.logger.log(`Deletando dados para ID: ${id}`);
    try {
      await this.apiService.deleteData(id);
      this.logger.log(`Dados deletados com sucesso`);
      return { message: 'Dados deletados com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao deletar dados: ${error.message}`);
      throw error;
    }
  }
} 