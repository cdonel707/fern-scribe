# 🧪 Fern Scribe Local Testing Guide

This guide helps you test Fern Scribe locally before deploying to production.

## 🚀 Quick Start

1. **Setup Configuration**
```bash
# Create .env file at project root with your API keys
touch .env
# Add your API keys to .env (see Configuration Options below)
```

2. **Install Dependencies**
```bash
cd .github/scripts
npm install
```

3. **Run Tests**
```bash
# Test different scenarios
node test-local.js pr-conflict    # Test PR with conflicts
node test-local.js pr-clean       # Test PR with no conflicts  
node test-local.js pr-draft       # Test draft PR (should skip)
node test-local.js issue          # Test issue processing

# Or use the npm scripts
npm run test:pr-conflict
npm run test:all
```

## 📋 Test Scenarios

### 🔀 **PR Testing Scenarios**

| Scenario | Command | Description |
|----------|---------|-------------|
| `pr-conflict` | `node test-local.js pr-conflict` | Tests a PR that adds "newest product" content and should detect conflicts |
| `pr-clean` | `node test-local.js pr-clean` | Tests a PR with harmless typo fixes (no conflicts) |
| `pr-draft` | `node test-local.js pr-draft` | Tests a draft PR (should be skipped) |

### 📝 **Issue Testing Scenarios**

| Scenario | Command | Description |
|----------|---------|-------------|
| `issue` | `node test-local.js issue` | Tests issue processing with Slack thread and changelog |

## ⚙️ Configuration Options

### **Option 1: .env File (Recommended)**
Create a `.env` file at your **project root** (not in .github/scripts):
```bash
# .env (at project root)
GITHUB_TOKEN=ghp_your_token_here
TURBOPUFFER_API_KEY=tp_your_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
OPENAI_API_KEY=sk-your_key_here
REPOSITORY=your-org/your-repo
TURBOPUFFER_NAMESPACE=test
SLACK_USER_TOKEN=xoxp-your_slack_token_here
```

### **Option 2: Configuration File**
```javascript
// .github/scripts/test-config.js
module.exports = {
  GITHUB_TOKEN: 'ghp_your_token_here',
  TURBOPUFFER_API_KEY: 'tp_your_key_here',
  ANTHROPIC_API_KEY: 'sk-ant-your_key_here',
  OPENAI_API_KEY: 'sk-your_key_here',
  REPOSITORY: 'your-org/your-repo',
  TEST_MODE: true  // Use mocks vs real APIs
};
```

### **Option 3: Environment Variables**
```bash
export GITHUB_TOKEN="ghp_your_token_here"
export TURBOPUFFER_API_KEY="tp_your_key_here"
export ANTHROPIC_API_KEY="sk-ant-your_key_here"
export OPENAI_API_KEY="sk-your_key_here"
export REPOSITORY="your-org/your-repo"
```

## 🔑 Required API Keys

### **GitHub Token**
- Go to GitHub Settings → Developer settings → Personal access tokens
- Create token with `repo` permissions
- Use format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **TurboBuffer API Key**
- Get from your TurboBuffer dashboard
- Format: `tp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **Anthropic API Key**
- Get from Anthropic Console
- Format: `sk-ant-apixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **OpenAI API Key**
- Get from OpenAI Platform
- Format: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🎭 Mock vs Real Testing

### **Mock Mode (Default)**
- Set `TEST_MODE: true` in test-config.js
- Uses simulated API responses
- Safe for testing without hitting real APIs
- No API usage costs

### **Real Mode**
- Set `TEST_MODE: false` in test-config.js
- Uses actual API calls
- Tests real integration
- Requires valid API keys and will consume API credits

## 📊 Understanding Test Output

### **Successful PR Conflict Test**
```
🧪 Fern Scribe Local Testing
================================

✅ Loaded test-config.js
🧪 Setting up test environment for scenario: pr-conflict
📁 Repository: your-org/your-repo
🔑 Using MOCKED API calls
✅ PR conflict test environment ready
   🔀 PR #456: Add new product documentation
   ⚠️  This should detect conflicts with "newest product" claims

🚀 Starting Fern Scribe test run...

🌿 Fern Scribe GitHub starting...
📋 Event type: pull_request
🔀 Processing GitHub pull request...
📋 PR #456: Add new product documentation
🔍 Mock: Getting PR #456
📄 Extracting changed content from PR...
🔍 Mock: Comparing abc123def456...def456ghi789
   📊 Found 1 files with meaningful text changes
📊 Found changes in 1 documentation files:
   📄 docs/products/overview.md (+10 lines)
🔍 Searching for potentially conflicting content...
   🔍 Analyzing changes in: docs/products/overview.md
   🎯 Found potential conflict keywords: newest product, latest solution
🔍 Mock TurboBuffer query: [ 'vector', 'ANN', [Array] ]
⚠️  Found 1 potential conflicts:
   1. docs/products/overview.md ↔️ /docs/legacy/old-product.md
      Keyword: "newest product" (score: 0.90)
🤖 Generating recommendations for resolving conflicts...
🤖 Mock: Calling Claude API
💬 Mock: Would comment on issue/PR #456
📝 Comment preview:
## 🌿 Fern Scribe Analysis

⚠️ **Potential Documentation Conflicts Detected**

I've found some content that may conflict with existing documentation. Please review the recommendations below:

## 🚨 Documentation Conflict Analysis

I found a significant conflict that needs attention:

### Conflict 1: "Newest Product" Claims
- **Your PR**: docs/products/overview.md claims "newest product"
- **Existing docs**: docs/legacy/old-product.md also claims to be "newest"
- **Issue**: This creates conflicting information for users

### Recommended Actions:
1. **Update legacy docs**: Remove "newest" claim from docs/legacy/old-product.md
2. **Consider versioning**: Clarify which product is current vs legacy
3. **Review timeline**: Ensure product positioning is consistent across all docs

This conflict could confuse users about which product to choose.

**Files with Changes:**
- `docs/products/overview.md` (+10 lines)

**Potential Conflicts Found:**
1. `docs/products/overview.md` may conflict with `/docs/legacy/old-product.md` (keyword: "newest product")

*Powered by AI and TurboBuffer content analysis*...

✅ Posted conflict analysis and recommendations to PR

✅ Fern Scribe GitHub PR workflow complete!

✅ Test completed successfully!
```

### **No Conflicts Found**
```
✅ No potential conflicts found with existing documentation
💬 Mock: Would comment on issue/PR #789
📝 Comment preview:
## 🌿 Fern Scribe Analysis

✅ **No Documentation Conflicts Detected**

I've analyzed your documentation changes and found no conflicts with existing content...
```

## 🐛 Troubleshooting

### **Common Issues**

1. **"Cannot find module './test-fern-scribe.js'"**
   - Make sure you have the test script in the same directory
   - Check file permissions

2. **"API key not found"**
   - Verify your test-config.js has the correct keys
   - Or set environment variables

3. **"Repository not found"**
   - Update REPOSITORY in test-config.js to your actual repo
   - Make sure your GitHub token has access to the repo

4. **Network errors**
   - If using real mode, check your internet connection
   - If using mock mode, this shouldn't happen

### **Debug Mode**
Add more logging by setting:
```javascript
// In test-config.js
DEBUG: true
```

## 🔄 Testing Different Content

To test your own scenarios, modify the mock data in `test-local.js`:

```javascript
// In setupPRConflictTest(), change the patch content:
patch: `@@ -1,3 +1,10 @@
 # Product Overview
 
-Our platform offers great features.
+YOUR CUSTOM CONTENT HERE THAT MIGHT CONFLICT
+
+## YOUR TEST SECTION
+
+Add whatever content you want to test for conflicts.`
```

## 📚 Next Steps

Once your local tests pass:
1. Commit your changes to a test branch
2. Create a test PR with the `fern-scribe` label (for issues) or any PR (for PR analysis)
3. Watch it run in the GitHub Actions environment
4. When satisfied, merge to main

## 🆘 Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify your API keys are correct
3. Try mock mode first before real mode
4. Check that all dependencies are installed (`npm install`)