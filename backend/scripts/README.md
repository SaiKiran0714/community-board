# User Import Script

This script allows you to safely import users from a CSV file into the Community Board application.

## CSV Format

The CSV file should have the following format:

```csv
email,name,description,tags,team,available_days
john.doe@example.com,John Doe,Software Engineer,python;javascript;react,Engineering,monday;wednesday
```

### Required Fields
- `email`: User's email address (must be unique)
- `name`: User's full name

### Optional Fields
- `description`: User's description or bio
- `tags`: Semicolon-separated list of skills/interests (e.g., "python;javascript;react")
- `team`: User's team or department
- `available_days`: Semicolon-separated list of available days (e.g., "monday;wednesday")

## Usage

1. Prepare your CSV file following the format above
2. Run the script:
   ```bash
   python import_users.py path/to/your/users.csv
   ```

## Error Handling

The script includes several safety features:
- Validates email format
- Checks for duplicate emails
- Validates required fields
- Processes tags and available days safely
- Commits in batches to handle large files
- Provides detailed error reporting

## Example Output

```
Processing users...
Processed 100 users...

Import Summary:
Successfully imported: 150 users
Errors encountered: 2

Errors:
- Row 3: Invalid email format - invalid.email
- Row 5: User with email john.doe@example.com already exists
``` 