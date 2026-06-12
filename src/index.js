// Cloudflare Worker — serves OAuth Authorization Server Metadata (RFC 8414)
// for the Welfare Board MCP server.
// All actual OAuth endpoints live on swc.iitg.ac.in/welfare-board/api/oauth/*.

const BACKEND = 'https://swc.iitg.ac.in/welfare-board/api';

const metadata = {
  issuer: null, // set dynamically to the Worker's own origin
  authorization_endpoint: `${BACKEND}/oauth/authorize`,
  token_endpoint: `${BACKEND}/oauth/token`,
  registration_endpoint: `${BACKEND}/oauth/register`,
  code_challenge_methods_supported: ['S256'],
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = url.origin; // e.g. https://swc-mcp-auth.<account>.workers.dev

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // RFC 8414: Authorization Server Metadata
    if (url.pathname === '/.well-known/oauth-authorization-server') {
      return new Response(JSON.stringify({ ...metadata, issuer: origin }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
