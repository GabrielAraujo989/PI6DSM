import { Module } from '@nestjs/common';
import { StreamComponentController } from './stream-component.controller';

@Module({
  controllers: [StreamComponentController],
})
export class StreamComponentModule {}