import oAuthClient from '../oauth/client';
import querystring from 'querystring';
import { createHash } from 'crypto';
import logger from '../../../lib/logger';

export default (provider, csrfToken, callback) => {
  const { callbackUrl, requestTokenUrl, scope } = provider;
  const client = oAuthClient(provider);
  if (provider.version && provider.version.startsWith('2.')) {
    // Handle oAuth v2.x
    let url = client.getAuthorizeUrl({
      redirect_uri: provider.callbackUrl,
      scope: provider.scope,
      // A hash of the NextAuth.js CSRF token is used as the state
      state: createHash('sha256').update(csrfToken).digest('hex'),
    });

    // If the authorizationUrl specified in the config has query parameters on it
    // make sure they are included in the URL we return.
    //
    // This is a fix for an open issue with the oAuthClient library we are using
    // which inadvertantly strips them.
    //
    // https://github.com/ciaranj/node-oauth/pull/193
    if (provider.authorizationUrl.includes('?')) {
      const parseUrl = new URL(provider.authorizationUrl);
      const baseUrl = `${parseUrl.origin}${parseUrl.pathname}?`;
      url = url.replace(baseUrl, provider.authorizationUrl + '&');
    }

    callback(null, url);
  } else {
    // Handle oAuth v1.x
    client.getOAuthRequestToken = _getOAuthRequestToken;
    client.getOAuthRequestToken(
      (error, oAuthToken, oAuthTokenSecret) => {
        if (error) {
          logger.error('GET_AUTHORISATION_URL_ERROR', error);
        }

        const url = `${provider.authorizationUrl}?oauth_token=${oAuthToken}`;
        callback(error, url, oAuthTokenSecret);
      },
      { callbackUrl, requestTokenUrl, scope }
    );
  }
};

async function _getOAuthRequestToken(callback, extraParams) {
  var requestUrl = extraParams.requestTokenUrl;
  var scopeParams = '';
  var defaultScopes = ['profile_r', 'email_r'];
  if (extraParams.scope) {
    scopeParams += '?scope=' + extraParams.scope;
    delete extraParams.scope;
    for (var i in defaultScopes) {
      if (scopeParams.search(defaultScopes[i]) === -1) {
        scopeParams += '+' + defaultScopes[i];
      }
    }
  } else if (!extraParams.scope) {
    scopeParams += defaultScopes.join('+');
  }
  requestUrl += scopeParams;

  // Callbacks are 1.0A related (sme as oauth-node)
  if (extraParams.callbackUrl) {
    extraParams.oauth_callback = extraParams.callbackUrl;
  }
  //See Oauth.js from node oauth module
  //https://github.com/ciaranj/node-oauth/blob/eefd821ea9b010a44ba49afa048a421ea23e7502/lib/oauth.js
  //...exports.OAuth.prototype._performSecureRequest= function( oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback )
  this._performSecureRequest(
    null,
    null,
    this._clientOptions.requestTokenHttpMethod,
    requestUrl,
    extraParams,
    null,
    null,
    function (error, data, response) {
      if (error) {
        callback(error);
      } else {
        var results = querystring.parse(data);

        var oauth_token = results.oauth_token;
        var oauth_token_secret = results.oauth_token_secret;
        delete results.oauth_token;
        delete results.oauth_token_secret;
        callback(null, oauth_token, oauth_token_secret);
      }
    }
  );
}
