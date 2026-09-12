PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS departments (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, title TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS skills (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, category TEXT NOT NULL DEFAULT 'uncategorized');
CREATE TABLE IF NOT EXISTS employees (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, department_id TEXT NOT NULL REFERENCES departments(id),
 role_id TEXT NOT NULL REFERENCES roles(id), is_fictional INTEGER NOT NULL CHECK(is_fictional IN (0,1)),
 category TEXT, certification_requirements TEXT, source_row INTEGER NOT NULL UNIQUE,
 tenure REAL, retirement_eligible INTEGER CHECK(retirement_eligible IN (0,1)),
 source_file TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS employee_skills (
 employee_id TEXT NOT NULL REFERENCES employees(id), skill_id TEXT NOT NULL REFERENCES skills(id),
 proficiency INTEGER CHECK(proficiency BETWEEN 1 AND 5), source TEXT NOT NULL,
 PRIMARY KEY(employee_id,skill_id)
);
CREATE INDEX IF NOT EXISTS employee_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS employee_skill_lookup ON employee_skills(skill_id);
