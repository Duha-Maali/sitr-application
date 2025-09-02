# dataset.py
'''This file contains the dataset class and dataloader function for the Hijab dataset.'''
import os
import xml.etree.ElementTree as ET
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from src.config import Config
from PIL import Image

class HijabDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        """
        Args:
            root_dir (str): Path to the directory containing images and XML files.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []

        # Load images and labels from XML files
        for file_name in os.listdir(root_dir):
            if file_name.endswith(".xml"):
                xml_path = os.path.join(root_dir, file_name)
                try:
                    tree = ET.parse(xml_path)
                    root = tree.getroot()

                    # Extract label from XML
                    object_tag = root.find("object")
                    if object_tag is None:
                        raise ValueError(f"Missing <object> tag in {xml_path}")
                    
                    name_tag = object_tag.find("name")
                    if name_tag is None:
                        raise ValueError(f"Missing <name> tag under <object> in {xml_path}")
                    
                    class_name = int(name_tag.text)

                    # Extract image filename
                    filename_tag = root.find("filename")
                    if filename_tag is None:
                        raise ValueError(f"Missing <filename> tag in {xml_path}")
                    
                    image_name = filename_tag.text

                    # Store image path and label
                    self.image_paths.append(os.path.join(root_dir, image_name))
                    self.labels.append(class_name)

                except Exception as e:
                    print(f"Error processing {xml_path}: {e}")

    def __len__(self):
        return len(self.image_paths)

    # قبل ما أعمل أي ترانسفورم للصور
    # I convert it into RGB format
    # If some images are in grayscale and others are in RGB format,
    # This will confuse the transformation process and will lead to errors.
    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("RGB")
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label

def get_dataloaders():
    """
    Creates and returns DataLoader objects for training, validation, and test datasets.
    """
    # Define transformations
    transform = transforms.Compose([
        transforms.Resize((224,224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # ImageNet normalization
    ])

    # Create datasets
    train_dataset = HijabDataset(root_dir=Config.DATA_DIR / "train", transform=transform)
    val_dataset = HijabDataset(root_dir=Config.DATA_DIR / "val", transform=transform)
    test_dataset = HijabDataset(root_dir=Config.DATA_DIR / "test", transform=transform)

    # Create DataLoaders
    train_loader = DataLoader(train_dataset, batch_size=Config.BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=Config.BATCH_SIZE, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=Config.BATCH_SIZE, shuffle=False)

    # Return DataLoaders
    return train_loader, val_loader, test_loader