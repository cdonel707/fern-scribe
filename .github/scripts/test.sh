#!/bin/bash

# Fern Scribe Testing Script
# Usage: ./test.sh [scenario]
# Scenarios: pr-conflict, pr-clean, pr-draft, issue, all

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Fern Scribe Test Runner${NC}"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Install dependencies if package.json exists and node_modules doesn't
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Check if test-config.js exists
if [ ! -f "test-config.js" ]; then
    echo -e "${YELLOW}⚠️  test-config.js not found${NC}"
    echo -e "Creating from test-config.example.js..."
    
    if [ -f "test-config.example.js" ]; then
        cp test-config.example.js test-config.js
        echo -e "${RED}❗ Please edit test-config.js with your API keys before running tests${NC}"
        echo -e "Opening test-config.js for editing..."
        
        # Try to open in common editors
        if command -v code &> /dev/null; then
            code test-config.js
        elif command -v nano &> /dev/null; then
            nano test-config.js
        elif command -v vim &> /dev/null; then
            vim test-config.js
        else
            echo -e "Please edit test-config.js manually with your API keys"
        fi
        exit 1
    else
        echo -e "${RED}❌ test-config.example.js not found. Cannot create test-config.js${NC}"
        exit 1
    fi
fi

# Get scenario from command line argument
SCENARIO=${1:-"pr-conflict"}

run_test() {
    local test_scenario=$1
    echo -e "\n${BLUE}🚀 Running test scenario: ${test_scenario}${NC}"
    echo "----------------------------------------"
    
    if node test-local.js "$test_scenario"; then
        echo -e "\n${GREEN}✅ Test '$test_scenario' passed!${NC}"
        return 0
    else
        echo -e "\n${RED}❌ Test '$test_scenario' failed!${NC}"
        return 1
    fi
}

# Run tests based on scenario
case "$SCENARIO" in
    "all")
        echo -e "${BLUE}Running all test scenarios...${NC}\n"
        
        FAILED_TESTS=()
        
        for test in "pr-conflict" "pr-clean" "pr-draft" "issue"; do
            if ! run_test "$test"; then
                FAILED_TESTS+=("$test")
            fi
            echo ""
        done
        
        echo -e "\n${BLUE}📊 Test Summary${NC}"
        echo "================="
        
        if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
            echo -e "${GREEN}✅ All tests passed!${NC}"
            exit 0
        else
            echo -e "${RED}❌ Failed tests: ${FAILED_TESTS[*]}${NC}"
            exit 1
        fi
        ;;
    "pr-conflict"|"pr-clean"|"pr-draft"|"issue")
        run_test "$SCENARIO"
        ;;
    *)
        echo -e "${RED}❌ Unknown scenario: $SCENARIO${NC}"
        echo -e "Available scenarios: pr-conflict, pr-clean, pr-draft, issue, all"
        exit 1
        ;;
esac