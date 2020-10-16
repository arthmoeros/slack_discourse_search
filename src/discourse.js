const Api = require('./api-caller');

const dBaseApiUrl = process.env.DISCOURSE_BASE_URL || 'http://localhost:3000'
const dApiUser = process.env.DISCOURSE_API_USER || 'secret'
const dApiKey = process.env.DISCOURSE_API_KEY || 'secret'

const apiCaller = new Api(dBaseApiUrl);
const headers = {
  'Api-Username': dApiUser,
  'Api-Key': dApiKey,
  'X-Requested-With': 'XMLHttpRequest'
};

async function search(term, include_blurbs) {
  let qs = {
    term,
    include_blurbs
  };
  return await apiCaller.call(
    'GET',
    `/search/query`,
    undefined,
    headers,
    qs
  );
}

module.exports.search = search;
