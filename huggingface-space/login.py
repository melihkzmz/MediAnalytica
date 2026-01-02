#!/usr/bin/env python3
"""Simple script to login to Hugging Face"""
from huggingface_hub import login

print("Hugging Face Login")
print("=" * 50)
print("You'll need a Hugging Face access token.")
print("Get one at: https://huggingface.co/settings/tokens")
print("=" * 50)

token = input("\nEnter your Hugging Face token: ").strip()

try:
    login(token=token)
    print("\n✅ Login successful!")
except Exception as e:
    print(f"\n❌ Login failed: {e}")

