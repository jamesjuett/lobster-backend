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
    exercise_id?: number | null;
    last_modified: string; // date
    contents: string;
    is_public: boolean;
  }

  interface DB_Users_Projects {
    user_id: number;
    project_id: number;
  }
  
  type ExceptID<T> = Knex.CompositeTableType<T, Omit<T, "id"> & {id?: undefined}, Partial<Omit<T, "id">> & {id?: undefined}>;

  interface Tables {
    users: Knex.CompositeTableType<
      // Base Type
      DB_Users,
      // Insert Type
      //   Required: email, name
      //   Optional: is_super
      //   (Not allowed): id
      Pick<DB_Users, "email" | "name"> & Partial<Pick<DB_Users, "is_super">> & {id?: undefined},
      // Update Type
      //   All optional except id may not be updated
      Partial<Omit<DB_Users, "id">> & {id?: undefined}
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
      //   Optional: exercise_id, is_public (default false)
      //   (Not allowed): id, last_modified
      Pick<DB_Projects, "contents"> & Partial<Pick<DB_Projects, "exercise_id" | "is_public">> & {id?: undefined} & {last_modified?: undefined},
      // Update Type
      //   All optional except id and last_modified may not be updated
      Partial<Omit<DB_Projects, "id" | "last_modified">> & {id?: undefined} & {last_modified?: undefined}
      >;

      users_projects: Knex.CompositeTableType<
        // Base Type
        DB_Users_Projects,
        // Insert Type
        //   Required: user_id, project_id
        Pick<DB_Users_Projects, "user_id" | "project_id">,
        // Update Type
        //   Doesn't make sense to update (you should be using insert/delete)
        never
      >;
  }
}

export function withoutProps<P extends string, T extends Record<P, any>>(obj: T, ...props: readonly P[]) : Omit<T, P> {
  let copy : Omit<T, P> & Partial<Pick<T,P>> = Object.assign({}, obj);
  props.forEach(p => delete copy[p]);
  return copy;
}

// export function includingProps<T extends object, P extends object>(obj: T, props: P)
//   : T extends Omit<infer R, keyof P> ? (R extends T & P ? R : T & P) : T & P {
//   return Object.assign(obj, props) as any;
// }