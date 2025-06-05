import { Controller, Post, Req, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { spawn } from 'child_process';

@Controller('stream')
export class StreamComponentController {
  @UseGuards(JwtAuthGuard)
  @Post('scan')
  async scanNetwork(@Req() req) {
    return new Promise((resolve, reject) => {
      const py = spawn('python3', [
        'src/streamComponent/api_scan.py'
      ]);
      let data = '';
      let error = '';
      py.stdout.on('data', (chunk) => { data += chunk; });
      py.stderr.on('data', (chunk) => { error += chunk; });
      py.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data });
          }
        } else {
          reject(error || 'Erro ao executar scan');
        }
      });
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async startStream(@Body('cameraIps') cameraIps: string[], @Req() req) {
    const userToken = req.headers.authorization;
    const detectFaceUrl = 'https://b957-177-95-144-130.ngrok-free.app/start_camera/';
    const results = [];
    for (const ip of cameraIps) {
      const response = await fetch(detectFaceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userToken,
        },
        body: JSON.stringify({ url: ip })
      });
      if (!response.ok) {
        throw new Error('Erro ao iniciar stream na DetectFace');
      }
      const data = await response.json();
      results.push(data);
    }
    return { cameras: results };
  }
}