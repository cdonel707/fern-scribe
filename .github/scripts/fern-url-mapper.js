// Mock Fern URL Mapper for testing
// This is a simplified version that provides the expected interface

class FernUrlMapper {
  constructor(githubToken, repository) {
    this.githubToken = githubToken;
    this.repository = repository;
    console.log('🔗 Mock FernUrlMapper initialized');
  }

  async mapTurbopufferPathToGitHub(turbopufferPath) {
    // Simple mock mapping - just return the path as-is for testing
    // In real implementation, this would handle path transformations
    console.log(`🗺️  Mock: Mapping ${turbopufferPath} -> ${turbopufferPath}`);
    return turbopufferPath;
  }

  // Add any other methods that might be needed
  async mapGitHubPathToTurbopuffer(githubPath) {
    console.log(`🗺️  Mock: Mapping ${githubPath} -> ${githubPath}`);
    return githubPath;
  }
}

module.exports = FernUrlMapper;