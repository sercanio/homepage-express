# To Run

## Make ready MongoDB database
- Create data/mongo/001_users.js file with:

```javascript
db.createUser(
    {
        user: "username",
        pwd: "password",
        roles:[
            {
                role: "readWrite",
                db:   "blogDB"
            }
        ]
    }
);
```

- To run container stack:

bash:
```bash
docker compose --env-file ./backend/.env up --build
```

powershell:
```powershell
docker compose --env-file .\backend\.env up --build
```

- Environment Variables for .env file

```env
MONGO_INITDB_ROOT_USERNAME=username
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=blogDB

MONGODB_CONNECTION_STRING="mongodb://username:password@mongodb:27017/blogDB?authSource=admin"
MONGODB_CONNECTION_STRING_LOCAL="mongodb://username:password@localhost:27017/blogDB?authSource=admin"

SESSION_COOKIE_MAXAGE=8640000 # 1 day
SESSION_SECRET=

# Credentials for the BlogUser on AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_KEY=
AWS_REGION=
```