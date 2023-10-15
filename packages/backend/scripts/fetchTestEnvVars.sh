#!/bin/bash

AWS_PROFILE="tuneaffinity-dev"
parameter_name="<your-parameter-name>"

# Fetch parameter value from AWS Parameter Store
parameter_value=$(aws ssm get-parameter --profile $AWS_PROFILE --name "$parameter_name" --query "Parameter.Value" --output text)

# Check if the AWS CLI command was successful
if [ $? -ne 0 ]; then
    echo "Failed to fetch parameter from AWS Parameter Store"
    exit 1
fi

# Replace <your-env-variable-name> with the name of the environment variable you want to set
env_variable_name="<your-env-variable-name>"

# Set environment variable with the parameter value
export $env_variable_name="$parameter_value"

# Print environment variable for verification
echo "Set $env_variable_name=$parameter_value"

# Optional: If you want the environment variable to be available in subsequent shell sessions,
# you may need to add the export command to your shell profile file (like .bashrc, .zshrc, etc.),
# or use the environment variable in the script as needed.
