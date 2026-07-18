#!/usr/bin/env python3
import boto3
import os
from pathlib import Path

s3 = boto3.client('s3')
bucket = 'mrtechfixes-com'
root = Path('/mnt/d/KIRO PROJECTS/METROTEC')

exclude = {'_archive', '.git', 'node_modules', '.vscode'}

for file_path in root.rglob('*'):
    if file_path.is_file():
        if any(part in file_path.parts for part in exclude):
            continue
        
        s3_key = str(file_path.relative_to(root)).replace('\\', '/')
        print(f"Uploading: {s3_key}")
        s3.upload_file(str(file_path), bucket, s3_key)

print("Upload complete!")
