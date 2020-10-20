const PORT = parseInt(process.env.PORT);

const discourse = require('./discourse');
const utils = require('./utils');

const fastify = require('fastify');
const app = fastify();

const loginfo = utils.loginfo;
const formatResults = utils.formatResults;
const verifySlackSignature = utils.verifySlackSignature;
const emptyResponse = utils.emptyResponse;

app.register(require('fastify-formbody'))
app.register(require('fastify-raw-body'), {
  runFirst: true
})

app.post('/slack/discourse_search', async (req, reply) => {
  loginfo(`Got request, headers: ${JSON.stringify(req.headers)}`);
  if (!verifySlackSignature(req, process.env.SLACK_APP_SIGNINGSECRET)) {
    loginfo('Recieved Bad api call from slack - Signature doesnt match');
    throw { statusCode: 403, message: 'Signature doesnt match' };
  }
  let userid = req.body.user_id;
  let term = req.body.text;
  loginfo('Recieved OK api call from slack');
  try {
    if (term.trim() === "") {
      let response = JSON.stringify({
        "response_type": "in_channel",
        "text": `${emptyResponse(userid)}`
      });
      reply.header('Content-Type','application/json');
      reply.send(response);
    } else {
      let searchResults = await discourse.search(term, false);
      let response = JSON.stringify({
        "response_type": "in_channel",
        "text": `${formatResults(userid, searchResults, term)}`
      });
      loginfo(response);
      reply.header('Content-Type','application/json');
      reply.send(response);
    }
  } catch (error) {
    loginfo('Thrown error');
    console.log(error);
    throw { statusCode: 500, message: error.message };
  }
});

app.listen(PORT, '0.0.0.0').then(() => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
