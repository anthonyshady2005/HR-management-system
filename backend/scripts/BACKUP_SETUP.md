# Automated MongoDB Backup Setup

This guide explains how to set up automated MongoDB backups that run every midnight using cron.

## Prerequisites

1. **MongoDB Database Tools**: Install `mongodump`
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb-database-tools
   
   # macOS
   brew install mongodb-database-tools
   
   # Or download from: https://www.mongodb.com/try/download/database-tools
   ```

2. **Environment Variables**: Ensure your `.env` file in the `backend/` directory contains:
   ```
   MONGO_URI=mongodb://localhost:27017/your_database_name
   ```
   Or for remote MongoDB:
   ```
   MONGO_URI=mongodb://username:password@host:port/database_name
   ```

## Manual Testing

Before setting up automation, test the backup script manually:

```bash
cd /home/amir-bassem/Payroll-Subsystem/backend
npm run backup
```

Or directly:
```bash
cd /home/amir-bassem/Payroll-Subsystem/backend
./scripts/backup.sh
```

## Setting Up Cron Job

### Step 1: Make Script Executable

The script should already be executable, but if needed:
```bash
chmod +x /home/amir-bassem/Payroll-Subsystem/backend/scripts/backup.sh
```

### Step 2: Edit Crontab

Open your crontab for editing:
```bash
crontab -e
```

### Step 3: Add Cron Job

Add one of the following entries depending on your setup:

#### Option A: Using .env file (Recommended)
```bash
0 0 * * * cd /home/amir-bassem/Payroll-Subsystem/backend && /bin/bash scripts/backup.sh >> backups/cron.log 2>&1
```

#### Option B: With explicit environment variable
```bash
0 0 * * * cd /home/amir-bassem/Payroll-Subsystem/backend && MONGO_URI="mongodb://localhost:27017/your_database" /bin/bash scripts/backup.sh >> backups/cron.log 2>&1
```

#### Option C: Using source to load .env
```bash
0 0 * * * cd /home/amir-bassem/Payroll-Subsystem/backend && source .env && /bin/bash scripts/backup.sh >> backups/cron.log 2>&1
```

### Cron Schedule Explanation

- `0 0 * * *` = Run at midnight (00:00) every day
- `cd /path/to/backend` = Change to backend directory (required for .env file access)
- `>> backups/cron.log 2>&1` = Append output and errors to log file

### Alternative Schedules

- Every 6 hours: `0 */6 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at 2 AM: `0 2 * * *`
- Weekly on Sunday at midnight: `0 0 * * 0`

## Verifying the Cron Job

### Check if cron is running
```bash
sudo systemctl status cron
# or on some systems:
sudo systemctl status crond
```

### View cron logs
```bash
# View system cron logs
sudo tail -f /var/log/syslog | grep CRON

# View your backup script logs
tail -f /home/amir-bassem/Payroll-Subsystem/backend/backups/cron.log
```

### List your cron jobs
```bash
crontab -l
```

## Backup Location

Backups are stored in:
```
/home/amir-bassem/Payroll-Subsystem/backend/backups/
```

Each backup is stored in a directory named:
```
backup_<database_name>_<timestamp>/
```

Example:
```
backup_hr_system_20240115_000000/
```

Log files are also stored in the backups directory:
```
backup_20240115_000000.log
```

## Troubleshooting

### Issue: "mongodump: command not found"
**Solution**: Install MongoDB Database Tools (see Prerequisites)

### Issue: "Could not extract database name from MONGO_URI"
**Solution**: Ensure your MONGO_URI includes the database name:
- Correct: `mongodb://localhost:27017/my_database`
- Incorrect: `mongodb://localhost:27017`

### Issue: Cron job not running
**Solutions**:
1. Check cron service is running: `sudo systemctl status cron`
2. Check cron logs: `sudo tail -f /var/log/syslog | grep CRON`
3. Verify script path is absolute in crontab
4. Ensure script has execute permissions: `chmod +x scripts/backup.sh`
5. Check that the working directory in crontab is correct

### Issue: Environment variables not loaded
**Solutions**:
1. Use Option B (explicit MONGO_URI in crontab)
2. Or ensure the script can access the .env file by using absolute paths
3. The script automatically loads .env from the backend directory

### Issue: Permission denied
**Solution**: Ensure the user running cron has:
- Read access to the backend directory
- Write access to the backups directory
- Execute permission on the backup script

## Maintenance

### Monitor Disk Space
Regularly check backup directory size:
```bash
du -sh /home/amir-bassem/Payroll-Subsystem/backend/backups/
```

### Clean Up Old Backups
You can manually delete old backups or set up a cleanup script. Example to keep last 7 days:
```bash
find /home/amir-bassem/Payroll-Subsystem/backend/backups -type d -name "backup_*" -mtime +7 -exec rm -rf {} \;
```

### Test Restore
Periodically test restoring from a backup to ensure backups are valid.

