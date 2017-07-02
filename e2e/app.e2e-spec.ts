import { NodeCelebrateAppPage } from './app.po';

describe('node-celebrate-app App', () => {
  let page: NodeCelebrateAppPage;

  beforeEach(() => {
    page = new NodeCelebrateAppPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
