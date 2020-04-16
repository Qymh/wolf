import { Invoke } from './invoke';
import path from 'path';

const ins = new Invoke({
  dir: path.resolve(process.cwd(), 'packages/invoke/demo/views'),
  alias: path.resolve(process.cwd(), 'packages/invoke/demo/views'),
  beforeEach(to, from, next) {
    next();
  },
  afterEach(to, from) {},
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

// ins.test();

export default Invoke;
