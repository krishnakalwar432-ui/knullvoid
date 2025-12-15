import os
import gzip
import shutil

def find_large_files(directory, size_limit_mb=25):
    """Find files larger than the specified size limit"""
    large_files = []
    size_limit_bytes = size_limit_mb * 1024 * 1024
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                file_size = os.path.getsize(file_path)
                if file_size > size_limit_bytes:
                    large_files.append((file_path, file_size))
            except OSError:
                pass  # Skip files that can't be accessed
    
    return large_files

def compress_file(input_file, output_file):
    """Compress a file using gzip"""
    with open(input_file, 'rb') as f_in:
        with gzip.open(output_file, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    return os.path.getsize(output_file)

def main():
    print("Finding large files (>25MB)...")
    large_files = find_large_files('.', 25)
    
    if not large_files:
        print("No files larger than 25MB found!")
        return
    
    print(f"Found {len(large_files)} large files:")
    for file_path, size in large_files:
        size_mb = size / (1024 * 1024)
        print(f"  {file_path}: {size_mb:.2f} MB")
    
    print("\nCompressing large files...")
    compressed_files = []
    
    for file_path, original_size in large_files:
        try:
            compressed_path = file_path + '.gz'
            compressed_size = compress_file(file_path, compressed_path)
            
            original_mb = original_size / (1024 * 1024)
            compressed_mb = compressed_size / (1024 * 1024)
            
            print(f"Compressed: {file_path}")
            print(f"  Original: {original_mb:.2f} MB -> Compressed: {compressed_mb:.2f} MB")
            
            compressed_files.append((file_path, compressed_path, original_size, compressed_size))
        except Exception as e:
            print(f"Error compressing {file_path}: {e}")
    
    print(f"\nSuccessfully compressed {len(compressed_files)} files!")
    print("Now you can try deploying with Wrangler again.")

if __name__ == "__main__":
    main()