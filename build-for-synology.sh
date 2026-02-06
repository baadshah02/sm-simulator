#!/bin/bash
# Synology NAS Optimized Build Script with Enhanced Error Handling

IMAGE_NAME="smith-manoeuvre"
IMAGE_TAG="latest"
TAR_FILE="smith-manoeuvre-synology.tar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_color() {
    printf "${1}${2}${NC}\n"
}

print_color "$BLUE" "🏗️  Building Smith Manoeuvre for Synology NAS..."

# Enhanced Docker check with timeout
check_docker() {
    print_color "$YELLOW" "🔍 Checking Docker status..."
    
    # Check if docker command exists
    if ! command -v docker &> /dev/null; then
        print_color "$RED" "❌ Docker is not installed."
        print_color "$YELLOW" "💡 Please install Docker Desktop and try again."
        exit 1
    fi
    
    # Check if Docker daemon is running with timeout
    timeout 10s docker version &> /dev/null
    if [ $? -ne 0 ]; then
        print_color "$RED" "❌ Docker is not running or responding."
        print_color "$YELLOW" "💡 Please start Docker Desktop/Engine and wait for it to fully start."
        print_color "$BLUE" "🔧 Try these steps:"
        echo "   1. Start Docker Desktop application"
        echo "   2. Wait for Docker to fully initialize (green indicator)"
        echo "   3. Run this script again"
        exit 1
    fi
    
    print_color "$GREEN" "✅ Docker is running!"
}

# Function to build with progress indication
build_image() {
    print_color "$YELLOW" "📦 Building for Synology NAS (AMD64 architecture)..."
    print_color "$BLUE" "⏳ This may take 2-5 minutes depending on your internet connection..."
    
    # Build with platform specification and progress output
    docker build --platform linux/amd64 -t ${IMAGE_NAME}:${IMAGE_TAG} . --progress=plain
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✅ Build successful!"
        return 0
    else
        print_color "$RED" "❌ Build failed!"
        print_color "$YELLOW" "💡 Common solutions:"
        echo "   - Check your internet connection"
        echo "   - Ensure package.json and Dockerfile are present"
        echo "   - Try: docker system prune -f (to free up space)"
        return 1
    fi
}

# Function to export image
export_image() {
    print_color "$YELLOW" "💾 Exporting image for Synology..."
    print_color "$BLUE" "⏳ Creating TAR file (this may take 1-2 minutes)..."
    
    docker save ${IMAGE_NAME}:${IMAGE_TAG} > ${TAR_FILE}
    
    if [ $? -eq 0 ]; then
        FILE_SIZE=$(du -h ${TAR_FILE} | cut -f1 2>/dev/null || echo "Unknown")
        print_color "$GREEN" "📦 Synology image ready! Size: ${FILE_SIZE}"
        return 0
    else
        print_color "$RED" "❌ Export failed!"
        return 1
    fi
}

# Main execution
main() {
    check_docker
    
    if build_image; then
        if export_image; then
            print_color "$BLUE" "🎉 Synology deployment package complete!"
            echo ""
            print_color "$YELLOW" "📋 Next steps:"
            echo "1. Upload ${TAR_FILE} to your Synology via File Station"
            echo "2. Import via Container Manager > Image > Add > Add from File"
            echo "3. Create container with port mapping 3001:80"
            echo "4. Configure reverse proxy in DSM (see SYNOLOGY_DEPLOYMENT.md)"
            echo ""
            print_color "$GREEN" "🚀 Your Smith Manoeuvre Simulator is ready for Synology!"
            
            # Show file location
            FULL_PATH=$(pwd)/${TAR_FILE}
            print_color "$BLUE" "📍 File location: ${FULL_PATH}"
        else
            exit 1
        fi
    else
        exit 1
    fi
}

# Run main function
main
