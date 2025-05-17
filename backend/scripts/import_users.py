import csv
import sys
import uuid
from app import create_app, db
from app.models import User

def validate_email(email):
    """Basic email validation"""
    return '@' in email and '.' in email.split('@')[1]

def process_tags(tags_str):
    """Process tags from CSV string"""
    if not tags_str:
        return []
    return [tag.strip() for tag in tags_str.split(';') if tag.strip()]

def process_available_days(days_str):
    """Process available days from CSV string"""
    if not days_str:
        return []
    valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    days = [day.strip().lower() for day in days_str.split(';') if day.strip()]
    return [day for day in days if day in valid_days]

def import_users_from_csv(file_path):
    app = create_app()
    
    with app.app_context():
        success_count = 0
        error_count = 0
        errors = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                # Validate headers
                required_headers = {'email', 'name'}
                headers = set(reader.fieldnames)
                if not required_headers.issubset(headers):
                    print(f"Error: Missing required headers. Required: {required_headers}")
                    return
                
                # Process each row
                for row_num, row in enumerate(reader, start=2):  # start=2 because row 1 is headers
                    try:
                        # Validate required fields
                        if not row['email'] or not row['name']:
                            errors.append(f"Row {row_num}: Email and name are required")
                            error_count += 1
                            continue
                            
                        # Validate email format
                        if not validate_email(row['email']):
                            errors.append(f"Row {row_num}: Invalid email format - {row['email']}")
                            error_count += 1
                            continue
                        
                        # Check if user already exists
                        if User.query.filter_by(email=row['email']).first():
                            errors.append(f"Row {row_num}: User with email {row['email']} already exists")
                            error_count += 1
                            continue
                        
                        # Create new user
                        user = User(
                            id=str(uuid.uuid4()),
                            email=row['email'],
                            name=row['name'],
                            description=row.get('description', ''),
                            tags=process_tags(row.get('tags', '')),
                            team=row.get('team', ''),
                            available_days=process_available_days(row.get('available_days', '')),
                            is_active=True
                        )
                        
                        db.session.add(user)
                        success_count += 1
                        
                        # Commit every 100 users to avoid memory issues
                        if success_count % 100 == 0:
                            db.session.commit()
                            print(f"Processed {success_count} users...")
                    
                    except Exception as e:
                        errors.append(f"Row {row_num}: Error processing row - {str(e)}")
                        error_count += 1
                        continue
                
                # Final commit for remaining users
                try:
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    print(f"Error committing to database: {str(e)}")
                    return
                
                # Print summary
                print("\nImport Summary:")
                print(f"Successfully imported: {success_count} users")
                print(f"Errors encountered: {error_count}")
                
                if errors:
                    print("\nErrors:")
                    for error in errors:
                        print(f"- {error}")
        except FileNotFoundError:
            print(f"Error: File not found - {file_path}")
        except Exception as e:
            print(f"Error: Failed to process CSV file - {str(e)}")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python import_users.py <path_to_csv_file>")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    import_users_from_csv(csv_file) 