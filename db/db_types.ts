import Knex from "knex";

declare module "knex/types/tables" {

  // Define base types here for ALL tables
  interface DB_Users {
    id: number;
    email: string;
    name: string;
    is_super: boolean;
  }

  interface DB_Courses {
    id: number;
    short_name: string;
    full_name: string;
    term: string;
    year: number;
  }

  interface DB_Users_Courses {
    user_id: number;
    course_id: number;
    is_admin: boolean;
  }

  interface DB_Exercises {
    id: number;
    name: string;
    starter_project_id: number;
  }

  interface DB_Projects {
    id: number;
    exercise_id?: number;
    last_modified: string; // date
    contents: string;
  }
  
  type ExceptID<T> = Knex.CompositeTableType<T, Omit<T, "id">, Partial<Omit<T, "id">>>;

  interface Tables {
    users: Knex.CompositeTableType<
      // Base Type
      DB_Users,
      // Insert Type
      //   Required: email, name
      //   Optional: is_super
      //   (Not allowed): id
      Pick<DB_Users, "email" | "name"> & Partial<Pick<DB_Users, "is_super">>,
      // Update Type
      //   All optional except id may not be updated
      Partial<Omit<DB_Users, "id">>
    >;

    courses: ExceptID<DB_Courses>;

    users_courses: Knex.CompositeTableType<
      // Base Type
      DB_Users_Courses,
      // Insert Type
      //   Required: user_id, course_id
      //   Optional: is_admin
      Pick<DB_Users_Courses, "user_id" | "course_id"> & Partial<Pick<DB_Users_Courses, "is_admin">>,
      // Update Type
      //   May only update is_admin (otherwise you should be using insert/delete)
      Partial<Pick<DB_Users_Courses, "is_admin">>
    >;

    exercises: ExceptID<DB_Exercises>;

    projects: Knex.CompositeTableType<
    // Base Type
    DB_Projects,
    // Insert Type
    //   Required: contents
    //   Optional: exercise_id
    //   (Not allowed): id, last_modified
    Pick<DB_Projects, "contents"> & Partial<Pick<DB_Projects, "exercise_id">>,
    // Update Type
    //   All optional except id and last_modified may not be updated
    Partial<Omit<DB_Projects, "id" | "last_modified">>
    >;
  }
}