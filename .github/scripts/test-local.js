#!/usr/bin/env node

/**
 * Local testing script for Fern Scribe
 * Run with: node test-local.js [scenario]
 * 
 * Scenarios:
 * - issue: Test issue processing
 * - pr-conflict: Test PR with conflicts
 * - pr-clean: Test PR with no conflicts
 * - pr-draft: Test draft PR (should skip)
 */

const path = require('path');
const fs = require('fs');

// Load .env file from project root
const dotenvResult = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
if (dotenvResult.parsed) {
  console.log('✅ Loaded .env file from project root');
} else if (process.env.GITHUB_TOKEN || process.env.TURBOPUFFER_API_KEY) {
  console.log('✅ Using existing environment variables');
} else {
  console.log('⚠️  No .env file found at project root, will use fallback values');
}

// Load test configuration
function loadTestConfig() {
  try {
    const config = require('./test-config.js');
    console.log('✅ Loaded test-config.js');
    return config;
  } catch (error) {
    console.log('⚠️  test-config.js not found, using environment variables and .env');
    console.log('   Create test-config.js from test-config.example.js for JS-based config');
    console.log('   Or use .env file at project root (recommended)');
    return {};
  }
}

// Mock environment variables for testing
function setupTestEnvironment(scenario) {
  const config = loadTestConfig();
  
  // Set environment variables from config or existing env
  process.env.GITHUB_TOKEN = config.GITHUB_TOKEN || process.env.GITHUB_TOKEN || 'mock-github-token';
  process.env.TURBOPUFFER_API_KEY = config.TURBOPUFFER_API_KEY || process.env.TURBOPUFFER_API_KEY || 'mock-turbopuffer-key';
  process.env.ANTHROPIC_API_KEY = config.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || 'mock-anthropic-key';
  process.env.OPENAI_API_KEY = config.OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'mock-openai-key';
  process.env.SLACK_USER_TOKEN = config.SLACK_USER_TOKEN || process.env.SLACK_USER_TOKEN || 'mock-slack-token';
  process.env.REPOSITORY = config.REPOSITORY || process.env.REPOSITORY || 'test-org/test-repo';
  process.env.TURBOPUFFER_NAMESPACE = config.TURBOPUFFER_NAMESPACE || 'test';

  console.log(`🧪 Setting up test environment for scenario: ${scenario}`);
  console.log(`📁 Repository: ${process.env.REPOSITORY}`);
  console.log(`🔑 Using ${config.TEST_MODE ? 'MOCKED' : 'REAL'} API calls`);

  switch (scenario) {
    case 'issue':
      setupIssueTest();
      break;
    case 'pr-conflict':
      setupPRConflictTest();
      break;
    case 'pr-clean':
      setupPRCleanTest();
      break;
    case 'pr-draft':
      setupPRDraftTest();
      break;
    default:
      console.log('❌ Unknown scenario. Use: issue, pr-conflict, pr-clean, or pr-draft');
      process.exit(1);
  }
}

function setupIssueTest() {
  process.env.EVENT_TYPE = 'issues';
  process.env.ISSUE_NUMBER = '123';
  process.env.ISSUE_TITLE = 'Update docs for new API features';
  process.env.ISSUE_BODY = `### What do you want Fern Scribe to do?

Update the API documentation to include the new authentication features we just released.

### Slack thread (optional)

https://your-workspace.slack.com/archives/C1234567890/p1234567890123456

### Existing instructions that didn't work (optional)

Tried updating the auth docs but couldn't find all the places that need updates.

### Why they didn't work (optional)

The documentation is spread across multiple files and it's hard to keep track of all the places that mention authentication.

### Changelog

- [x] Yes, include changelog

### Priority

High

### Additional context (optional)

This is for the v2.0 API release that goes out next week.`;

  console.log('✅ Issue test environment ready');
  console.log('   📋 Issue #123: Update docs for new API features');
}

function setupPRConflictTest() {
  process.env.EVENT_TYPE = 'pull_request';
  process.env.PR_NUMBER = '456';
  process.env.PR_TITLE = 'Add new product documentation';
  process.env.PR_BODY = 'Adding docs for our newest product feature';
  process.env.PR_BASE_SHA = 'abc123def456';
  process.env.PR_HEAD_SHA = 'def456ghi789';
  process.env.PR_BASE_REF = 'main';
  process.env.PR_HEAD_REF = 'feature/new-product-docs';

  console.log('✅ PR conflict test environment ready');
  console.log('   🔀 PR #456: Add new product documentation');
  console.log('   ⚠️  This should detect conflicts with "newest product" claims');
}

function setupPRCleanTest() {
  process.env.EVENT_TYPE = 'pull_request';
  process.env.PR_NUMBER = '789';
  process.env.PR_TITLE = 'Fix typos in getting started guide';
  process.env.PR_BODY = 'Simple typo fixes and grammar improvements';
  process.env.PR_BASE_SHA = 'abc123def456';
  process.env.PR_HEAD_SHA = 'ghi789jkl012';
  process.env.PR_BASE_REF = 'main';
  process.env.PR_HEAD_REF = 'fix/typos';

  console.log('✅ PR clean test environment ready');
  console.log('   🔀 PR #789: Fix typos in getting started guide');
  console.log('   ✅ This should find no conflicts');
}

function setupPRDraftTest() {
  process.env.EVENT_TYPE = 'pull_request';
  process.env.PR_NUMBER = '101';
  process.env.PR_TITLE = '[DRAFT] Work in progress docs';
  process.env.PR_BODY = 'Still working on this';
  process.env.PR_BASE_SHA = 'abc123def456';
  process.env.PR_HEAD_SHA = 'mno345pqr678';
  process.env.PR_BASE_REF = 'main';
  process.env.PR_HEAD_REF = 'wip/draft-docs';

  console.log('✅ PR draft test environment ready');
  console.log('   🔀 PR #101: [DRAFT] Work in progress docs');
  console.log('   ⏭️  This should be skipped (draft PR)');
}

// Mock GitHub API responses for testing
function createMockOctokit() {
  const scenario = process.argv[2];
  
  return {
    rest: {
      pulls: {
        get: ({ pull_number }) => {
          console.log(`🔍 Mock: Getting PR #${pull_number}`);
          
          if (scenario === 'pr-draft') {
            return Promise.resolve({
              data: {
                draft: true,
                user: { type: 'User' }
              }
            });
          }
          
          return Promise.resolve({
            data: {
              draft: false,
              user: { type: 'User' }
            }
          });
        }
      },
      repos: {
        compareCommits: ({ base, head }) => {
          console.log(`🔍 Mock: Comparing ${base}...${head}`);
          
          if (scenario === 'pr-conflict') {
            return Promise.resolve({
              data: {
                files: [
                  {
                    filename: 'docs/products/overview.md',
                    status: 'modified',
                    additions: 10,
                    deletions: 2,
                    patch: `@@ -1,3 +1,10 @@
 # Product Overview
 
-Our platform offers great features.
+Our platform offers the newest and most advanced features.
+
+## Latest Product
+
+This is our newest product that surpasses all competition.
+It's the latest solution in the market.`
                  }
                ]
              }
            });
          }
          
          if (scenario === 'pr-clean') {
            return Promise.resolve({
              data: {
                files: [
                  {
                    filename: 'docs/getting-started.md',
                    status: 'modified',
                    additions: 3,
                    deletions: 3,
                    patch: `@@ -5,3 +5,3 @@
 # Getting Started
 
-To get strated, follow these steps:
+To get started, follow these steps:`
                  }
                ]
              }
            });
          }
          
          return Promise.resolve({ data: { files: [] } });
        },
        getContent: ({ path }) => {
          console.log(`🔍 Mock: Getting content for ${path}`);
          return Promise.resolve({
            data: {
              content: Buffer.from(`# Mock content for ${path}\n\nThis is mock file content.`).toString('base64')
            }
          });
        }
      },
      issues: {
        createComment: ({ issue_number, body }) => {
          console.log(`💬 Mock: Would comment on issue/PR #${issue_number}`);
          console.log(`📝 Comment preview:\n${body.substring(0, 200)}...\n`);
          return Promise.resolve({ data: { id: 123 } });
        }
      }
    }
  };
}

// Mock TurboBuffer for testing
function createMockTurbopuffer() {
  return {
    namespace: () => ({
      query: (params) => {
        console.log(`🔍 Mock TurboBuffer query:`, params.rank_by);
        
        const scenario = process.argv[2];
        if (scenario === 'pr-conflict') {
          return Promise.resolve({
            rows: [
              {
                id: 'mock-doc-1',
                pathname: '/docs/legacy/old-product.md',
                title: 'Legacy Product Documentation',
                url: 'https://docs.example.com/legacy/old-product',
                chunk: 'Our newest product has been the market leader since 2020. This latest solution provides the best features available.',
                $dist: 0.2
              }
            ]
          });
        }
        
        return Promise.resolve({ rows: [] });
      }
    })
  };
}

// Mock Anthropic API
function mockAnthropicAPI() {
  const originalFetch = global.fetch;
  
  global.fetch = (url, options) => {
    if (url.includes('anthropic.com')) {
      console.log('🤖 Mock: Calling Claude API');
      
      const scenario = process.argv[2];
      if (scenario === 'pr-conflict') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: [{
              text: `## 🚨 Documentation Conflict Analysis

I found a significant conflict that needs attention:

### Conflict 1: "Newest Product" Claims
- **Your PR**: docs/products/overview.md claims "newest product"
- **Existing docs**: docs/legacy/old-product.md also claims to be "newest"
- **Issue**: This creates conflicting information for users

### Recommended Actions:
1. **Update legacy docs**: Remove "newest" claim from docs/legacy/old-product.md
2. **Consider versioning**: Clarify which product is current vs legacy
3. **Review timeline**: Ensure product positioning is consistent across all docs

This conflict could confuse users about which product to choose.`
            }]
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Mock AI response for testing' }]
        })
      });
    }
    
    return originalFetch(url, options);
  };
}

async function runTest() {
  const scenario = process.argv[2] || 'pr-conflict';
  
  console.log('🧪 Fern Scribe Local Testing');
  console.log('================================\n');
  
  // Setup test environment
  setupTestEnvironment(scenario);
  
  // Setup mocks
  mockAnthropicAPI();
  
  // Import the test script - it should export the class
  let FernScribeGitHub;
  try {
    // Try different ways to import the class
    const module = require('./test-fern-scribe.js');
    FernScribeGitHub = module.default || module.FernScribeGitHub || module;
    
    if (typeof FernScribeGitHub !== 'function') {
      throw new Error('FernScribeGitHub is not a constructor function');
    }
  } catch (error) {
    console.error('❌ Failed to import FernScribeGitHub:', error.message);
    console.log('📋 The test-fern-scribe.js file should export the FernScribeGitHub class');
    return;
  }

  // Create a test instance with mocked APIs
  class TestFernScribeGitHub extends FernScribeGitHub {
    constructor() {
      super();
      // Override with mocks
      this.octokit = createMockOctokit();
      this.turbopuffer = createMockTurbopuffer();
    }
  }
  
  console.log('\n🚀 Starting Fern Scribe test run...\n');
  
  try {
    const fernScribe = new TestFernScribeGitHub();
    await fernScribe.run();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

if (require.main === module) {
  runTest();
}

module.exports = { setupTestEnvironment, createMockOctokit, createMockTurbopuffer };