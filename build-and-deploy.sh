#!/bin/bash
set -e

# Configuration (modify as needed)
IMAGE_NAME="smith-manoeuvre"
IMAGE_TAG="latest"
TAR_FILE="smith-manoeuvre-image.tar"

# Colors for output (compatible with more shells)
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function for colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_color "$BLUE" "🏗️  Building Smith Manoeuvre Financial Simulator Docker Image..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_color "$RED" "❌ Docker is not running. Please start Docker and try again."
    print_color "$YELLOW" "💡 Start Docker Desktop/Engine first, then run this script again."
    exit 1
fi

# Detect host architecture
HOST_ARCH=$(uname -m)
print_color "$BLUE" "🖥️  Host architecture: $HOST_ARCH"

# Ask user for target NAS architecture
echo ""
print_color "$YELLOW" "🎯 What's your NAS architecture?"
echo "1) AMD64/x86_64 (most common - Intel/AMD processors)"
echo "2) ARM64 (ARM-based NAS like some QNAP models)"
echo "3) Multi-platform (build for both - larger file size)"
echo "4) Auto-detect (same as host: $HOST_ARCH)"
read -p "Choose option (1-4) [default: 1]: " ARCH_CHOICE

case $ARCH_CHOICE in
    2)
        TARGET_PLATFORM="linux/arm64"
        print_color "$BLUE" "🔧 Building for ARM64..."
        ;;
    3)
        TARGET_PLATFORM="linux/amd64,linux/arm64"
        print_color "$BLUE" "🔧 Building multi-platform image..."
        ;;
    4)
        if [[ "$HOST_ARCH" == "arm64" ]]; then
            TARGET_PLATFORM="linux/arm64"
        else
            TARGET_PLATFORM="linux/amd64"
        fi
        print_color "$BLUE" "🔧 Building for host architecture: $TARGET_PLATFORM..."
        ;;
    *)
        TARGET_PLATFORM="linux/amd64"
        print_color "$BLUE" "🔧 Building for AMD64 (most common NAS)..."
        ;;
esac

# Build the Docker image with platform support
print_color "$YELLOW" "📦 Building image: ${IMAGE_NAME}:${IMAGE_TAG} for $TARGET_PLATFORM"

if [[ "$TARGET_PLATFORM" == *","* ]]; then
    # Multi-platform build requires buildx
    print_color "$YELLOW" "🔄 Setting up Docker buildx for multi-platform..."
    docker buildx create --use --name multiarch-builder 2>/dev/null || true
    docker buildx build --platform $TARGET_PLATFORM -t ${IMAGE_NAME}:${IMAGE_TAG} --load .
else
    # Single platform build
    docker build --platform $TARGET_PLATFORM -t ${IMAGE_NAME}:${IMAGE_TAG} .
fi

# Check if build was successful
if [ $? -eq 0 ]; then
    print_color "$GREEN" "✅ Build successful for $TARGET_PLATFORM!"
else
    print_color "$RED" "❌ Build failed!"
    exit 1
fi

# Save image to tar file
print_color "$YELLOW" "💾 Exporting image to ${TAR_FILE}..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} > ${TAR_FILE}

# Get file size
FILE_SIZE=$(du -h ${TAR_FILE} | cut -f1)
print_color "$GREEN" "📦 Image exported successfully! Size: ${FILE_SIZE}"

print_color "$BLUE" "🎉 Build and export complete!"
echo ""
print_color "$YELLOW" "📋 Next steps for NAS deployment:"
echo "1. Transfer ${TAR_FILE} to your NAS"
echo "2. On your NAS, run: docker load < ${TAR_FILE}"
echo "3. Deploy with: docker-compose up -d"
echo ""

# Optional: Upload to NAS automatically
if [ ! -z "$NAS_HOST" ] && [ ! -z "$NAS_USER" ]; then
    print_color "$BLUE" "📤 Uploading to NAS..."
    read -p "Upload path on NAS (default: /volume1/docker/images/): " NAS_PATH
    NAS_PATH=${NAS_PATH:-"/volume1/docker/images/"}
    
    print_color "$YELLOW" "Uploading ${TAR_FILE} to ${NAS_USER}@${NAS_HOST}:${NAS_PATH}"
    scp ${TAR_FILE} ${NAS_USER}@${NAS_HOST}:${NAS_PATH}
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✅ Upload complete!"
        echo ""
        print_color "$YELLOW" "Next: SSH to your NAS and run:"
        echo "ssh ${NAS_USER}@${NAS_HOST}"
        echo "docker load < ${NAS_PATH}${TAR_FILE}"
        echo "cd /path/to/your/project && docker-compose up -d"
    else
        print_color "$RED" "❌ Upload failed. Please transfer manually."
    fi
else
    print_color "$YELLOW" "💡 To enable automatic NAS upload, set environment variables:"
    echo "export NAS_HOST=your-nas-ip"
    echo "export NAS_USER=your-nas-username"
    echo ""
fi

print_color "$GREEN" "🚀 Your Smith Manoeuvre Simulator is ready for NAS deployment!"

# Optional: Clean up local image to save space
read -p "Remove local Docker image to save space? (y/N): " CLEANUP
if [[ $CLEANUP =~ ^[Yy]$ ]]; then
    docker rmi ${IMAGE_NAME}:${IMAGE_TAG}
    print_color "$GREEN" "🧹 Local image removed."
fi

print_color "$BLUE" "✨ Done!"
