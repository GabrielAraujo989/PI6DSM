import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { ApiDataDto } from './dto/api-data.dto';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('API_URL', 'http://localhost:8082');
    this.logger.log(`API Service inicializado com URL: ${this.apiUrl}`);
  }

  async sendData(apiDataDto: ApiDataDto): Promise<any> {
    try {
      this.logger.log(`Enviando dados para a API: ${JSON.stringify(apiDataDto)}`);
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/api/data`, apiDataDto, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ) as AxiosResponse;

      this.logger.log(`Resposta da API: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Erro na comunicação com a API: ${error.message}`);
        this.logger.error(`Detalhes do erro: ${JSON.stringify(error.response?.data)}`);
        throw new Error(`Erro na comunicação com a API: ${error.message}`);
      }
      this.logger.error(`Erro desconhecido: ${error.message}`);
      throw error;
    }
  }

  async getData(id: string): Promise<any> {
    try {
      this.logger.log(`Buscando dados da API para ID: ${id}`);
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/data/${id}`),
      ) as AxiosResponse;

      this.logger.log(`Dados recebidos da API: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Erro ao buscar dados da API: ${error.message}`);
        this.logger.error(`Detalhes do erro: ${JSON.stringify(error.response?.data)}`);
        throw new Error(`Erro ao buscar dados da API: ${error.message}`);
      }
      this.logger.error(`Erro desconhecido: ${error.message}`);
      throw error;
    }
  }

  async updateData(id: string, apiDataDto: ApiDataDto): Promise<any> {
    try {
      this.logger.log(`Atualizando dados na API para ID: ${id}`);
      this.logger.log(`Dados a serem atualizados: ${JSON.stringify(apiDataDto)}`);
      
      const response = await firstValueFrom(
        this.httpService.patch(`${this.apiUrl}/api/data/${id}`, apiDataDto, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ) as AxiosResponse;

      this.logger.log(`Resposta da API: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Erro ao atualizar dados na API: ${error.message}`);
        this.logger.error(`Detalhes do erro: ${JSON.stringify(error.response?.data)}`);
        throw new Error(`Erro ao atualizar dados na API: ${error.message}`);
      }
      this.logger.error(`Erro desconhecido: ${error.message}`);
      throw error;
    }
  }

  async deleteData(id: string): Promise<void> {
    try {
      this.logger.log(`Deletando dados da API para ID: ${id}`);
      
      await firstValueFrom(
        this.httpService.delete(`${this.apiUrl}/api/data/${id}`),
      );

      this.logger.log(`Dados deletados com sucesso`);
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Erro ao deletar dados da API: ${error.message}`);
        this.logger.error(`Detalhes do erro: ${JSON.stringify(error.response?.data)}`);
        throw new Error(`Erro ao deletar dados da API: ${error.message}`);
      }
      this.logger.error(`Erro desconhecido: ${error.message}`);
      throw error;
    }
  }
} 