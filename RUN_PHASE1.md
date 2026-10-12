# IndiaStay — Local Run Guide

1. Open PowerShell:
```powershell
cd D:\hotel-management\indiastay-phase1\indiastay\backend
```

2. Make sure Node 22.x is active:
```powershell
node -v
npm -v
```

3. Install:
```powershell
npm install
```

4. Seed the 96 hotels:
```powershell
npm run seed
```

5. Start:
```powershell
npm start
```

6. Open the customer website:
`http://localhost:4000/`

7. Create an admin:
```powershell
$env:ADMIN_NAME="IndiaStay Super Admin"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="StrongPassword123"
npm run create-admin
```

8. Open admin:
`http://localhost:4000/admin`

Keep the backend terminal running while testing the site.
