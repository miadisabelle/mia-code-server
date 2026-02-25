#!/bin/bash

# Initialize and update git submodules
echo "Initializing and updating git submodules..."
git submodule update --init --recursive
echo "Git submodules updated."