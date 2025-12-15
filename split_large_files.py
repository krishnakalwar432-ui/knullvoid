import os
import math

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

def split_file(input_file, chunk_size_mb=20):
    """Split a file into chunks"""
    chunk_size_bytes = chunk_size_mb * 1024 * 1024
    chunk_files = []
    
    with open(input_file, 'rb') as f:
        chunk_number = 0
        while True:
            chunk_data = f.read(chunk_size_bytes)
            if not chunk_data:
                break
            
            chunk_filename = f"{input_file}.part{chunk_number:03d}"
            with open(chunk_filename, 'wb') as chunk_file:
                chunk_file.write(chunk_data)
            
            chunk_files.append(chunk_filename)
            chunk_number += 1
    
    # Remove original file after splitting
    os.remove(input_file)
    
    return chunk_files

def create_loader_html(original_file, chunk_files):
    """Create an HTML loader that reassembles the chunks"""
    loader_filename = f"{original_file}.loader.html"
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>File Loader</title>
</head>
<body>
    <script>
        async function loadAndCombineChunks() {{
            const chunkPromises = [
"""
    
    for chunk_file in chunk_files:
        # Get relative path for web access
        rel_path = os.path.relpath(chunk_file, os.path.dirname(original_file))
        html_content += f"                fetch('{rel_path}').then(response => response.arrayBuffer()),\n"
    
    html_content += f"""            ];
            
            try {{
                const chunks = await Promise.all(chunkPromises);
                const totalSize = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
                const combinedBuffer = new Uint8Array(totalSize);
                
                let offset = 0;
                for (const chunk of chunks) {{
                    combinedBuffer.set(new Uint8Array(chunk), offset);
                    offset += chunk.byteLength;
                }}
                
                // Create blob and download
                const blob = new Blob([combinedBuffer]);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '{os.path.basename(original_file)}';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }} catch (error) {{
                console.error('Error loading chunks:', error);
            }}
        }}
        
        // Auto-load when page loads
        window.addEventListener('DOMContentLoaded', loadAndCombineChunks);
    </script>
    <p>Loading large file... Please wait.</p>
</body>
</html>
"""
    
    with open(loader_filename, 'w') as f:
        f.write(html_content)
    
    return loader_filename

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
    
    print("\nSplitting large files...")
    
    for file_path, original_size in large_files:
        try:
            original_mb = original_size / (1024 * 1024)
            print(f"Splitting: {file_path} ({original_mb:.2f} MB)")
            
            # Split into 20MB chunks
            chunk_files = split_file(file_path, 20)
            
            # Create loader HTML
            loader_file = create_loader_html(file_path, chunk_files)
            
            print(f"  Created {len(chunk_files)} chunks:")
            for chunk in chunk_files:
                chunk_size = os.path.getsize(chunk)
                chunk_mb = chunk_size / (1024 * 1024)
                print(f"    {chunk}: {chunk_mb:.2f} MB")
            print(f"  Created loader: {loader_file}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"\nSuccessfully processed {len(large_files)} large files!")
    print("Now you can try deploying with Wrangler again.")

if __name__ == "__main__":
    main()