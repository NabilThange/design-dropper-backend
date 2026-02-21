#!/bin/bash

# Test script for Design Dropper Backend
# Run this after starting the server with `npm start`

echo "🧪 Testing Design Dropper Backend"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ Health check failed (HTTP $http_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 2: Extract from simple site
echo "Test 2: Extract from stripe.com"
echo "--------------------------------"
echo "This may take 10-30 seconds..."
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/extract" \
  -H "Content-Type: application/json" \
  -d '{"url": "stripe.com", "options": {}}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Extraction successful${NC}"
    
    # Parse stats from response
    colors=$(echo "$body" | grep -o '"colors":[0-9]*' | grep -o '[0-9]*')
    fonts=$(echo "$body" | grep -o '"fonts":[0-9]*' | grep -o '[0-9]*')
    
    echo "Stats:"
    echo "  - Colors: $colors"
    echo "  - Fonts: $fonts"
    
    # Check if formats exist
    if echo "$body" | grep -q '"designMD"'; then
        echo -e "${GREEN}  ✓ DESIGN.md format generated${NC}"
    fi
    if echo "$body" | grep -q '"json"'; then
        echo -e "${GREEN}  ✓ JSON format generated${NC}"
    fi
    if echo "$body" | grep -q '"css"'; then
        echo -e "${GREEN}  ✓ CSS format generated${NC}"
    fi
    if echo "$body" | grep -q '"tailwind"'; then
        echo -e "${GREEN}  ✓ Tailwind format generated${NC}"
    fi
else
    echo -e "${RED}✗ Extraction failed (HTTP $http_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 3: Test caching
echo "Test 3: Test Caching (extract stripe.com again)"
echo "------------------------------------------------"
echo "This should be faster (cached)..."
start_time=$(date +%s)
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/extract" \
  -H "Content-Type: application/json" \
  -d '{"url": "stripe.com", "options": {}}')
end_time=$(date +%s)
elapsed=$((end_time - start_time))
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q '"cached":true'; then
        echo -e "${GREEN}✓ Cache working (response in ${elapsed}s)${NC}"
    else
        echo -e "${YELLOW}⚠ Cache not used (response in ${elapsed}s)${NC}"
    fi
else
    echo -e "${RED}✗ Cached request failed (HTTP $http_code)${NC}"
fi
echo ""

# Test 4: Test error handling (invalid URL)
echo "Test 4: Error Handling (invalid URL)"
echo "-------------------------------------"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/extract" \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-valid-url", "options": {}}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "500" ] || [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
        echo -e "${GREEN}✓ Error handling works${NC}"
        echo "Error message: $(echo "$body" | grep -o '"error":"[^"]*"')"
    else
        echo -e "${YELLOW}⚠ Error response format unexpected${NC}"
    fi
else
    echo -e "${RED}✗ Error handling failed (expected 4xx/5xx, got $http_code)${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "🎉 Testing Complete!"
echo ""
echo "Next steps:"
echo "1. If all tests passed, backend is working correctly"
echo "2. Deploy to Render.com"
echo "3. Update API_URL in extension/popup/popup.js"
echo "4. Test extension with production API"
