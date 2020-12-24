INSERT INTO users(email, full_name, is_super) VALUES ('jjuett@umich.edu', 'James Juett', true);
INSERT INTO users(email, full_name, is_super) VALUES ('akamil@umich.edu', 'Amir Kamil', true);
INSERT INTO users(email, full_name, is_super) VALUES ('jklooste@umich.edu', 'John Kloosterman', true);
INSERT INTO users(email, full_name, is_super) VALUES ('lslavice@umich.edu', 'Laura Alford', false);

INSERT INTO courses(short_name, full_name, term, year) values ('eecs280', 'Programming and Introductory Data Structures', 'winter', 2021);
INSERT INTO courses(short_name, full_name, term, year) values ('engr101', 'Introduction to Computers and Programming', 'winter', 2021);
INSERT INTO courses(short_name, full_name, term, year) values ('eecs183', 'Elementary Programming Concepts', 'winter', 2021);

INSERT INTO users_courses VALUES (1, 1, true);
INSERT INTO users_courses VALUES (1, 2, true);
INSERT INTO users_courses VALUES (1, 3, false);
INSERT INTO users_courses VALUES (2, 2, true);
INSERT INTO users_courses VALUES (3, 2, true);
INSERT INTO users_courses VALUES (4, 2, true);

INSERT INTO projects(contents) VALUES('{"name": "Project 1", "files": [{"name": "program1.cpp", "code": "int main() {\n  int x = 1;\n  int y = x + x;\n}", "isTranslationUnit": true}]}');
INSERT INTO projects(contents) VALUES('{"name": "Project 2", "files": [{"name": "program2.cpp", "code": "int main() {\n  int x = 2;\n  int y = x + x;\n}", "isTranslationUnit": true}]}');

INSERT INTO exercises(name, starter_project_id) VALUES('test exercise 1', 1);
INSERT INTO exercises(name, starter_project_id) VALUES('test exercise 2', 2);

UPDATE projects SET exercise_id = 1 WHERE project_id = 1;
UPDATE projects SET exercise_id = 2 WHERE project_id = 2;