import { Invoke } from './invoke';
import path from 'path';

const ins = new Invoke({
  dir: path.resolve(process.cwd(), 'packages/invoke/demo/views'),
  alias: path.resolve(process.cwd(), 'packages/invoke/demo/views'),
});

ins.test();
