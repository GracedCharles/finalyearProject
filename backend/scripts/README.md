# Database Scripts

## Test Driver License Assignment Script

This script adds test driver license numbers to all existing users in the database for testing purposes.

### Usage

To run the script:

```bash
npm run add-test-licenses
```

### What it does

1. Connects to the MongoDB database
2. Finds all users in the database
3. For each user without a driver license number:
   - Generates a test license number in the format `TEST-DLXXXX` (where XXXX is a padded index)
   - Updates the user record with the generated license number
4. Reports the number of users updated

### License Format

Test licenses are generated in the format:

- `TEST-DL0001`
- `TEST-DL0002`
- `TEST-DL0003`
- etc.

### Notes

- This script is for testing purposes only
- It will not overwrite existing driver license numbers
- Users who already have license numbers will be skipped
- The script connects to the same database as the main application
