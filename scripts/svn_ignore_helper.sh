#!/bin/bash
# SVN Ignore Helper Commands

echo "========================================="
echo "SVN Ignore Commands Reference"
echo "========================================="

# Function to set ignores
set_svn_ignores() {
    echo "Setting SVN ignores..."
    
    # Root directory
    svn propset svn:ignore "node_modules
package-lock.json
*.log
npm-debug.log*
yarn-error.log*
.env
.env.local
.env.*.local
.metro-health-check*
.metro-cache
*.apk
*.aab
*.ipa" .

    # Android directory
    cd android
    svn propset svn:ignore "build
.gradle
local.properties" .
    
    cd app
    svn propset svn:ignore "build" .
    cd ../..
    
    echo "Ignores set successfully!"
}

# Function to remove tracked files
remove_tracked_files() {
    echo "Removing tracked files that should be ignored..."
    
    # Remove if tracked
    svn rm --keep-local package-lock.json 2>/dev/null
    svn rm --keep-local .env 2>/dev/null
    svn rm --keep-local android/local.properties 2>/dev/null
    
    # Remove all .log files
    find . -name "*.log" -exec svn rm --keep-local {} \; 2>/dev/null
    
    # Remove all .apk files
    find . -name "*.apk" -exec svn rm --keep-local {} \; 2>/dev/null
    
    echo "Tracked files removed!"
}

# Function to check current status
check_status() {
    echo "Current SVN ignore settings:"
    svn propget svn:ignore .
    
    echo -e "\nFiles that might need attention:"
    svn status | grep -E "node_modules|package-lock|\.env|\.apk|\.aab"
}

# Main execution
echo -e "\nWhat would you like to do?"
echo "1. Set all ignore properties"
echo "2. Remove tracked files that should be ignored"
echo "3. Check current status"
echo "4. Do everything (1+2+3)"

read -p "Enter choice (1-4): " choice

case $choice in
    1) set_svn_ignores ;;
    2) remove_tracked_files ;;
    3) check_status ;;
    4) 
        set_svn_ignores
        remove_tracked_files
        check_status
        ;;
    *) echo "Invalid choice" ;;
esac

echo -e "\nDone!"
