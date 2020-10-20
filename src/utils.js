const crypto = require('crypto');
const dBaseApiUrl = process.env.DISCOURSE_BASE_URL || 'http://localhost:3000'

function loginfo(message){
  console.log(`${new Date().toISOString()} - ${message}`);
}

function verifySlackSignature(req, signingSecret) {
  const signature = req.headers['x-slack-signature']
  const timestamp = req.headers['x-slack-request-timestamp']
  const hmac = crypto.createHmac('sha256', signingSecret)
  const [version, hash] = signature.split('=')

  hmac.update(`${version}:${timestamp}:${req.rawBody}`)

  return hmac.digest('hex') === hash
}

function formatResults(userid, results, term){
  if (results.topics && results.topics.length > 0){
    let minf = [];
    results.topics.forEach((topic) => {
      minf.push({
        title: topic.title,
        link: `${dBaseApiUrl}/t/${topic.id}`,
        replies: (topic.posts_count - 1),
        solved: topic.has_accepted_answer
      });
    });
  
    let formatted = `Hola <@${userid}>, encontré esto en <${dBaseApiUrl}|Discourse>:`
    minf.forEach((result) => {
      formatted += `\n- *${result.title}* (${result.replies} respuesta${result.replies > 1 ? 's' : ''}) [<${result.link}|link>]${result.solved ? ' :heavy_check_mark:' : ''}`
    });
    if (minf.length === 5) {
      formatted += `_Es posible que encuentres más resultados <${dBaseApiUrl}/search?q=${encodeURIComponent(term)}|aquí>.`;
    }
    return formatted;
  } else {
    let response = `Hola <@${userid}>, no encontré resultados para lo que buscas en <${dBaseApiUrl}|Discourse>,`;
    response += `\nsé parte de la solución creando la pregunta <${dBaseApiUrl}/new-topic?title=${encodeURIComponent(term)}|aquí>.`;
    return response;
  }
}

module.exports.verifySlackSignature = verifySlackSignature;
module.exports.loginfo = loginfo;
module.exports.formatResults = formatResults;