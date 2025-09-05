#!/bin/bash

# Base directory
BASE_DIR="./"

# Create directories
mkdir -p $BASE_DIR/config
mkdir -p $BASE_DIR/controllers
mkdir -p $BASE_DIR/middleware
mkdir -p $BASE_DIR/models
mkdir -p $BASE_DIR/routes
mkdir -p $BASE_DIR/utils

# Create files in config
touch $BASE_DIR/config/database.js
touch $BASE_DIR/config/passport.js

# Create files in controllers
touch $BASE_DIR/controllers/auth.controller.js
touch $BASE_DIR/controllers/companies.controller.js
touch $BASE_DIR/controllers/contributions.controller.js
touch $BASE_DIR/controllers/insights.controller.js
touch $BASE_DIR/controllers/internships.controller.js
touch $BASE_DIR/controllers/jobs.controller.js
touch $BASE_DIR/controllers/user.controller.js

# Create files in middleware
touch $BASE_DIR/middleware/auth.js
touch $BASE_DIR/middleware/validation.js

# Create files in models
touch $BASE_DIR/models/index.js
touch $BASE_DIR/models/Company.js
touch $BASE_DIR/models/Contribution.js
touch $BASE_DIR/models/Insight.js
touch $BASE_DIR/models/Internship.js
touch $BASE_DIR/models/Job.js
touch $BASE_DIR/models/User.js

# Create files in routes
touch $BASE_DIR/routes/auth.routes.js
touch $BASE_DIR/routes/companies.routes.js
touch $BASE_DIR/routes/contributions.routes.js
touch $BASE_DIR/routes/insights.routes.js
touch $BASE_DIR/routes/internships.routes.js
touch $BASE_DIR/routes/jobs.routes.js
touch $BASE_DIR/routes/user.routes.js

# Create files in utils
touch $BASE_DIR/utils/logger.js
touch $BASE_DIR/utils/helpers.js

# Create main app.js
touch $BASE_DIR/app.js

echo "Folder structure created successfully!"
