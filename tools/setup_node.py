import os
import sys
import urllib.request
import zipfile
import shutil

NODE_VERSION = "v20.11.0"
ZIP_URL = f"https://nodejs.org/dist/{NODE_VERSION}/node-{NODE_VERSION}-win-x64.zip"
WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TOOLS_DIR = os.path.join(WORKSPACE_DIR, "tools")
NODE_ENV_DIR = os.path.join(TOOLS_DIR, "node-env")
ZIP_PATH = os.path.join(TOOLS_DIR, "node.zip")

def main():
    print("Starting Node.js environment bootstrap...")
    if not os.path.exists(TOOLS_DIR):
        os.makedirs(TOOLS_DIR)
        
    if os.path.exists(NODE_ENV_DIR):
        print(f"Node environment already exists at {NODE_ENV_DIR}. Skipping download.")
        return

    # Download
    print(f"Downloading Node.js {NODE_VERSION} from {ZIP_URL}...")
    try:
        def progress(block_num, block_size, total_size):
            read_so_far = block_num * block_size
            if total_size > 0:
                percent = min(100, int(read_so_far * 100 / total_size))
                sys.stdout.write(f"\rProgress: {percent}% ({read_so_far // 1024} KB / {total_size // 1024} KB)")
                sys.stdout.flush()
        
        urllib.request.urlretrieve(ZIP_URL, ZIP_PATH, reporthook=progress)
        print("\nDownload complete.")
    except Exception as e:
        print(f"\nFailed to download: {e}")
        sys.exit(1)

    # Extract
    print(f"Extracting Node.js zip to {TOOLS_DIR}...")
    try:
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(TOOLS_DIR)
        print("Extraction complete.")
    except Exception as e:
        print(f"Failed to extract zip: {e}")
        sys.exit(1)

    # Rename folder to node-env
    extracted_folder_name = f"node-{NODE_VERSION}-win-x64"
    extracted_folder_path = os.path.join(TOOLS_DIR, extracted_folder_name)
    
    if os.path.exists(extracted_folder_path):
        print(f"Renaming {extracted_folder_path} to {NODE_ENV_DIR}...")
        shutil.move(extracted_folder_path, NODE_ENV_DIR)
    
    # Cleanup zip
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)

    print("\nNode.js and NPM successfully configured!")
    # Test execution path
    node_exe = os.path.join(NODE_ENV_DIR, "node.exe")
    if os.path.exists(node_exe):
        print(f"Tested node path: {node_exe}")
        # Print versions
        import subprocess
        try:
            node_version = subprocess.check_output([node_exe, "-v"], text=True).strip()
            print(f"Node.js version check: {node_version}")
        except Exception as e:
            print(f"Failed to run node.exe: {e}")

if __name__ == "__main__":
    main()
