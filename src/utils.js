const dBaseApiUrl = process.env.DISCOURSE_BASE_URL || 'http://localhost:3000'

function loginfo(message){
  console.info(`${new Date().toISOString()} - ${message}`);
}

function verifySlackSignature(req, signingSecret) {
  const signature = req.headers['x-slack-signature']
  const timestamp = req.headers['x-slack-request-timestamp']
  const hmac = crypto.createHmac('sha256', signingSecret)
  const [version, hash] = signature.split('=')

  hmac.update(`${version}:${timestamp}:${req.rawBody}`)

  return hmac.digest('hex') === hash
}

function formatResults(userid, results){
  let minf = [];
  results.topics.forEach((topic) => {
    minf.push({
      title: topic.title,
      link: `${dBaseApiUrl}/t/${topic.id}`,
      replies: (topic.posts_count - 1),
      solved: topic.has_accepted_answer
    });
  });

  let formatted = `Hola <@${userid}>, encontré esto en [Discourse](${dBaseApiUrl})`
  minf.forEach((result) => {
    formatted += `\n- *${result.title}* (${result.replies} respuestas) [link](${result.link})${result.solved ? ' :heavy_check_mark:' : ''}`
  });
  return formatted;
}

module.exports.verifySlackSignature = verifySlackSignature;
module.exports.loginfo = loginfo;
module.exports.formatResults = formatResults;