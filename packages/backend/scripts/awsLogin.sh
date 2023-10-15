#!/bin/bash

# To make the script executable, run the following command:
# chmod +x checklogin.sh

# Set AWS profile
AWS_PROFILE="tuneaffinity-dev"

# Try to list S3 buckets
aws s3 ls --profile $AWS_PROFILE > /dev/null 2>&1

# Check the exit status of the last command
if [ $? -ne 0 ]; then
    echo "You are not logged in or another error occurred. Attempting to log in using profile $AWS_PROFILE..."
    
    # Initiate AWS SSO login
    aws sso login --profile $AWS_PROFILE
    
    # Check if login was successful
    aws s3 ls --profile $AWS_PROFILE > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Successfully logged in using profile $AWS_PROFILE."
    else
        echo "Failed to log in. Please check your credentials and try again."
    fi
else
    echo "You are already logged in using profile $AWS_PROFILE."
fi