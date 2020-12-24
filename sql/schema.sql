CREATE TABLE users(
    user_id INTEGER GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(50) NOT NULL,
    fullname VARCHAR(100),
    is_super BOOLEAN DEFAULT false,
    PRIMARY KEY(user_id)
);

CREATE TABLE courses(
    course_id INTEGER GENERATED ALWAYS AS IDENTITY,
    short_name VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    semester VARCHAR(6) NOT NULL,
    year SMALLINT NOT NULL,
    PRIMARY KEY(course_id)
);

CREATE TABLE users_courses(
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    role SMALLINT NOT NULL,
    PRIMARY KEY(user_id, course_id),
    FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
);

CREATE TABLE exercises(
    exercise_id INTEGER GENERATED ALWAYS AS IDENTITY,
    -- course_id INTEGER NOT NULL,
    -- published BOOLEAN DEFAULT false,
    name VARCHAR(40) NOT NULL,
    PRIMARY KEY(exercise_id)
    -- FOREIGN KEY (course_id)
    --     REFERENCES courses(course_id)
    --     ON UPDATE CASCADE
    --     ON DELETE CASCADE
);

-- CREATE TABLE starter_files(
--     exercise_id INTEGER GENERATED ALWAYS AS IDENTITY,
--     filename VARCHAR(20),
--     filecontents BYTEA,
--     PRIMARY KEY(exercise_id,filename),
--     FOREIGN KEY (exercise_id)
--         REFERENCES exercises(exercise_id)
--         ON UPDATE CASCADE
--         ON DELETE CASCADE
-- );

CREATE TABLE sessions(
    session_id INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL,
    owner_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT false,
    PRIMARY KEY(session_id),
    FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id),
    FOREIGN KEY (owner_id)
        REFERENCES users(user_id)
);

CREATE TABLE projects(
    project_id INTEGER GENERATED ALWAYS AS IDENTITY,
    session_id INTEGER,
    exercise_id INTEGER,
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contents JSONB NOT NULL,
    PRIMARY KEY(project_id),
    FOREIGN KEY (session_id)
        REFERENCES sessions(session_id),
    FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
);

-- Add starter_project_id to exercises.
-- Need to do this here rather than when we create
-- the exercises table due to circular dependency.
ALTER TABLE exercises ADD starter_project_id INTEGER NOT NULL;
ALTER TABLE exercises ADD FOREIGN KEY (starter_project_id) REFERENCES projects(project_id);

-- CREATE TABLE project_files(
--     project_id INTEGER,
--     filename VARCHAR(20),
--     filecontents BYTEA,
--     PRIMARY KEY(project_id,filename),
--     FOREIGN KEY (project_id)
--         REFERENCES projects(project_id)
--         ON UPDATE CASCADE
--         ON DELETE CASCADE
-- );