// Example configuration for local testing
// Copy this to test-config.js and fill in your actual values

module.exports = {
  // Required: GitHub Personal Access Token with repo permissions
  GITHUB_TOKEN: 'ghp_your_github_token_here',

  // Required: TurboBuffer credentials
  TURBOPUFFER_API_KEY: 'tp_your_turbopuffer_key_here',
  TURBOPUFFER_NAMESPACE: 'your_namespace',

  // Required: Anthropic API key for Claude
  ANTHROPIC_API_KEY: 'sk-ant-your_anthropic_key_here',

  // Required: OpenAI API key for embeddings
  OPENAI_API_KEY: 'sk-your_openai_key_here',

  // Optional: Slack token for thread fetching (only needed for issue processing)
  SLACK_USER_TOKEN: 'xoxp-your_slack_token_here',

  // Test repository (change to your actual repo)
  REPOSITORY: 'your-org/your-repo-name',

  // Test mode - set to true to use mocked APIs
  TEST_MODE: true
};