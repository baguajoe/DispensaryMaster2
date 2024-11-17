import pandas as pd
import PyPDF2
from models import db, Product


def import_inventory_from_excel(file_path):
    """
    Import inventory data from an Excel file.
    Args:
        file_path (str): Path to the Excel file.
    Returns:
        dict: Summary of the import operation.
    """
    try:
        # Read the Excel file
        data = pd.read_excel(file_path)

        # Expected columns in the Excel file
        required_columns = [
            'name', 'category', 'thc_content', 'cbd_content', 
            'current_stock', 'reorder_point', 'unit_price', 
            'supplier', 'batch_number'
        ]
        
        # Check if required columns are present
        if not all(column in data.columns for column in required_columns):
            return {"error": "Missing required columns in the Excel file"}

        # Iterate over rows and add products
        for _, row in data.iterrows():
            product = Product(
                name=row['name'],
                category=row['category'],
                thc_content=row['thc_content'],
                cbd_content=row['cbd_content'],
                current_stock=row['current_stock'],
                reorder_point=row['reorder_point'],
                unit_price=row['unit_price'],
                supplier=row['supplier'],
                batch_number=row['batch_number'],
            )
            db.session.add(product)
        
        db.session.commit()
        return {"message": "Inventory imported successfully"}
    
    except Exception as e:
        return {"error": f"An error occurred while importing Excel: {str(e)}"}


def import_inventory_from_pdf(file_path):
    """
    Import inventory data from a PDF file.
    Args:
        file_path (str): Path to the PDF file.
    Returns:
        dict: Summary of the import operation.
    """
    try:
        # Open the PDF file
        with open(file_path, 'rb') as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""

            # Extract text from all pages
            for page in reader.pages:
                text += page.extract_text()

        # Process the extracted text
        # Assuming the PDF has a consistent format (e.g., tabular data)
        rows = text.split('\n')
        headers = rows[0].split()  # Extract headers from the first row

        # Expected columns in the PDF
        required_columns = [
            'name', 'category', 'thc_content', 'cbd_content', 
            'current_stock', 'reorder_point', 'unit_price', 
            'supplier', 'batch_number'
        ]

        if not all(column in headers for column in required_columns):
            return {"error": "Missing required columns in the PDF"}

        for row in rows[1:]:  # Skip headers
            values = row.split()
            product_data = dict(zip(headers, values))

            product = Product(
                name=product_data['name'],
                category=product_data['category'],
                thc_content=float(product_data['thc_content']),
                cbd_content=float(product_data['cbd_content']),
                current_stock=int(product_data['current_stock']),
                reorder_point=int(product_data['reorder_point']),
                unit_price=float(product_data['unit_price']),
                supplier=product_data['supplier'],
                batch_number=product_data['batch_number'],
            )
            db.session.add(product)

        db.session.commit()
        return {"message": "Inventory imported successfully from PDF"}
    
    except Exception as e:
        return {"error": f"An error occurred while importing PDF: {str(e)}"}
