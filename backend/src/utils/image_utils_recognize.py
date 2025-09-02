from PIL import Image, ImageDraw, ImageFilter

def expand_bounding_box(box, image):
    """
    Expand bounding box to cover head and neck area.
    Args:
        box: List[float] [left, top, right, bottom]
        image: PIL.Image
    Returns:
        List[float] [new_left, new_top, new_right, new_bottom]
    """
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    
    new_left = max(0, left - width * 0.5)
    new_top = max(0, top - height * 1.5)
    new_right = min(image.width, right + width * 0.5)
    new_bottom = min(image.height, bottom + height * 0.5)
    
    return [new_left, new_top, new_right, new_bottom]

def apply_gaussian_blur(image, box):
    """
    Apply Gaussian blur to a region defined by box.
    Args:
        image: PIL.Image
        box: List[float] [left, top, right, bottom]
    Returns:
        PIL.Image with blurred region
    """
    left, top, right, bottom = map(int, box)
    region = image.crop((left, top, right, bottom))
    blurred_region = region.filter(ImageFilter.GaussianBlur(radius=20))
    image_copy = image.copy()
    image_copy.paste(blurred_region, (left, top))
    return image_copy
