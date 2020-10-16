const PORT = parseInt(process.env.PORT);

const fs = require('fs');
const path = require('path');

const discourse = require('./discourse');
const utils = require('./utils');

const fastify = require('fastify');
const app = fastify();

const loginfo = utils.loginfo;
const formatResults = utils.formatResults;
const verifySlackSignature = utils.verifySlackSignature;

app.register(require('fastify-raw-body'), {
  runFirst: true
})

app.post('/slack/discourse_search', async (req, reply) => {
  if (!verifySlackSignature(req, process.env.SLACK_API_SIGNINGSECRET)) {
    loginfo('Recieved Bad api call from slack - Signature doesnt match');
    throw { statusCode: 403, message: 'Signature doesnt match' };
  }
  let userid = req.body.user_id;
  let term = req.body.text;
  loginfo('Recieved OK api call from slack');
  try {
    let searchResults = await discourse.search(term, false);
    return {
      "response_type": "in_channel",
      "text": {
				"type": "mrkdwn",
				"text": `${formatResults(userid, searchResults)}`
			}
    };
  } catch (error) {
    loginfo('Thrown error');
    console.error(error);
    throw { statusCode: 500, message: error.message };
  }
});

app.listen(PORT, '0.0.0.0').then(() => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
