import os
import gzip
import shutil

def find_compressed_files(directory):
    """Find .gz files and their original counterparts"""
    compressed_files = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.gz'):
                original_file = file[:-3]  # Remove .gz extension
                original_path = os.path.join(root, original_file)
                compressed_path = os.path.join(root, file)
                
                # Check if original file exists
                if os.path.exists(original_path):
                    compressed_files.append((original_path, compressed_path))
    
    return compressed_files

def replace_with_compressed(compressed_files):
    """Replace original files with their compressed versions"""
    replaced_files = []
    
    for original_path, compressed_path in compressed_files:
        try:
            original_size = os.path.getsize(original_path)
            compressed_size = os.path.getsize(compressed_path)
            
            # Only replace if compressed file is actually smaller
            if compressed_size < original_size:
                # Remove original file
                os.remove(original_path)
                # Decompress the gz file to replace the original
                with gzip.open(compressed_path, 'rb') as f_in:
                    with open(original_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                # Remove the .gz file since we've restored the original
                os.remove(compressed_path)
                
                replaced_files.append((original_path, original_size, compressed_size))
                print(f"Replaced: {original_path}")
                print(f"  Original: {original_size / (1024*1024):.2f} MB -> Compressed: {compressed_size / (1024*1024):.2f} MB")
            else:
                print(f"Skipped: {original_path} (compressed version not smaller)")
        except Exception as e:
            print(f"Error processing {original_path}: {e}")
    
    return replaced_files

def main():
    print("Finding compressed files...")
    compressed_files = find_compressed_files('.')
    
    if not compressed_files:
        print("No .gz files found!")
        return
    
    print(f"Found {len(compressed_files)} compressed file pairs:")
    for original, compressed in compressed_files:
        print(f"  {original} <- {compressed}")
    
    print("\nReplacing large files with compressed versions...")
    replaced_files = replace_with_compressed(compressed_files)
    
    print(f"\nSuccessfully processed {len(replaced_files)} files!")
    print("Now you can try deploying with Wrangler again.")

if __name__ == "__main__":
    main()