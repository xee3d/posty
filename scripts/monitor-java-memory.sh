#!/bin/bash

echo "Monitoring Java memory usage..."
echo "================================"

# Function to convert bytes to human readable format
human_readable() {
    local bytes=$1
    if [ $bytes -ge 1073741824 ]; then
        echo $(echo "scale=2; $bytes/1073741824" | bc)G
    elif [ $bytes -ge 1048576 ]; then
        echo $(echo "scale=2; $bytes/1048576" | bc)M
    elif [ $bytes -ge 1024 ]; then
        echo $(echo "scale=2; $bytes/1024" | bc)K
    else
        echo ${bytes}B
    fi
}

# Monitor Java processes
while true; do
    clear
    echo "Java Process Memory Usage - $(date)"
    echo "================================"
    
    # Find all Java processes
    for pid in $(pgrep -f java); do
        if [ -n "$pid" ]; then
            # Get process info
            cmd=$(ps -p $pid -o comm= 2>/dev/null)
            
            # Get memory info from /proc
            if [ -f "/proc/$pid/status" ]; then
                vmsize=$(grep VmSize /proc/$pid/status | awk '{print $2}')
                vmrss=$(grep VmRSS /proc/$pid/status | awk '{print $2}')
                
                # Convert KB to bytes for calculation
                vmsize_bytes=$((vmsize * 1024))
                vmrss_bytes=$((vmrss * 1024))
                
                echo "PID: $pid"
                echo "Command: $cmd"
                echo "Virtual Memory: $(human_readable $vmsize_bytes)"
                echo "Physical Memory: $(human_readable $vmrss_bytes)"
                echo "---"
            fi
        fi
    done
    
    # Also show total system memory
    echo ""
    echo "System Memory:"
    free -h | grep -E "^(Mem|Swap):"
    
    sleep 5
done
