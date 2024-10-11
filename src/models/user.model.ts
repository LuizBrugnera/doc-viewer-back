import pool from "../database/db";

interface UserCreate {
  name: string;
  email: string;
  password: string;
  role?: string;
  rg?: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
  cod?: string;
  birthdate?: string;
  department: string;
}

interface UserOutput {
  id: number;
  name: string;
  email: string;
  role: string;
  rg?: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
  cod?: string;
  birthdate?: string;
  department: string;
}

interface UserOutputWithPassword {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  rg?: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
  cod?: string;
  birthdate?: string;
  department: string;
}

const userModel = {
  async create({
    name,
    email,
    password,
    cnpj,
    cod,
    cpf,
    phone,
    rg,
    role,
    department,
  }: UserCreate): Promise<UserOutput> {
    role = role || "user";

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, cnpj, cod, cpf, phone, rg, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, password, role, cnpj, cod, cpf, phone, rg, department]
    );

    const id = (result as any).insertId;
    return { id, name, email, role, cnpj, cod, cpf, phone, rg, department };
  },

  async findByEmail(email: string): Promise<UserOutput | null> {
    const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    return (result as any)[0] || null;
  },

  async findByEmailWithPassword(
    email: string
  ): Promise<UserOutputWithPassword | null> {
    const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    return (result as any)[0] || null;
  },

  async findByCod(cod: string): Promise<UserOutput | null> {
    const [result] = await pool.query("SELECT * FROM users WHERE cod = ?", [
      cod,
    ]);

    return (result as any)[0] || null;
  },

  async findById(id: number): Promise<UserOutputWithPassword | null> {
    const [result] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    return (result as any)[0] || null;
  },

  async updatePasswordById(id: number, password: string): Promise<void> {
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      password,
      id,
    ]);
  },

  async updatePasswordByEmail(email: string, password: string): Promise<void> {
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      password,
      email,
    ]);
  },

  async updateUserInfo(
    id: number,
    {
      name,
      email,
      cpf,
      cnpj,
      phone,
      rg,
      cod,
      birthdate,
      department,
    }: Partial<UserOutput>
  ): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    name = name || user.name;
    email = email || user.email;
    cpf = cpf || user.cpf;
    cnpj = cnpj || user.cnpj;
    phone = phone || user.phone;
    rg = rg || user.rg;
    cod = cod || user.cod;
    birthdate = birthdate || user.birthdate;
    department = department || user.department;

    await pool.query(
      "UPDATE users SET name = ?, email = ?, cpf = ?, cnpj = ?, phone = ?, rg = ?, cod = ?, birthdate = ?, department = ? WHERE id = ?",
      [name, email, cpf, cnpj, phone, rg, cod, birthdate, department, id]
    );
  },

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
  },

  async findAll(): Promise<UserOutput[]> {
    const [result] = await pool.query("SELECT id, name, email FROM users");

    return result as any;
  },

  async findUsersByDepartment(department: string): Promise<UserOutput[]> {
    const [result] = await pool.query(
      "SELECT id, name, email, cnpj, phone, cod FROM users WHERE role = 'user'",
      [department]
    );

    return result as any;
  },

  async findUserByName(name: string): Promise<UserOutput | null> {
    const [result] = await pool.query("SELECT * FROM users WHERE name = ?", [
      name,
    ]);

    return (result as any)[0] || null;
  },

  async findUserByPartialName(fileName: string): Promise<UserOutput | null> {
    const [users] = await pool.query("SELECT name FROM users");
    const userNames = users as { name: string }[];
    for (let i = 0; i < userNames.length; i++) {
      if (fileName.includes(userNames[i].name) && userNames[i].name !== "") {
        const username = userNames[i].name;
        const user = await pool.query("SELECT * FROM users WHERE name = ?", [
          username,
        ]);

        return (user as any)[0] || null;
      }
    }

    return null;
  },

  async findAllUserDepartaments(): Promise<UserOutput[]> {
    const [result] = await pool.query(
      "SELECT * FROM users WHERE role = 'department'"
    );

    return result as any;
  },
  async updateUser(id: number, user: UserCreate): Promise<void> {
    const userFinded = await this.findById(id);

    if (!userFinded) {
      throw new Error("Usuário não encontrado");
    }
    userFinded.name = userFinded.name || userFinded.name;
    userFinded.email = userFinded.email || userFinded.email;
    userFinded.cpf = userFinded.cpf || userFinded.cpf;
    userFinded.cnpj = userFinded.cnpj || userFinded.cnpj;
    userFinded.phone = userFinded.phone || userFinded.phone;
    userFinded.rg = userFinded.rg || userFinded.rg;
    userFinded.cod = userFinded.cod || userFinded.cod;
    userFinded.birthdate = userFinded.birthdate || userFinded.birthdate;
    userFinded.department = userFinded.department || userFinded.department;

    await pool.query(
      "UPDATE users SET name = ?, email = ?, password = ?, role = ?, cnpj = ?, cod = ?, cpf = ?, phone = ?, rg = ?, department = ? WHERE id = ?",
      [
        user.name,
        user.email,
        user.password,
        user.role,
        user.cnpj,
        user.cod,
        user.cpf,
        user.phone,
        user.rg,
        user.department,
        id,
      ]
    );
  },
  async findByCpfWithPassword(
    cpf: string
  ): Promise<UserOutputWithPassword | null> {
    const [result] = await pool.query("SELECT * FROM users WHERE cpf = ?", [
      cpf,
    ]);

    return (result as any)[0] || null;
  },
  async findByCnpjWithPassword(
    cnpj: string
  ): Promise<UserOutputWithPassword | null> {
    const [result] = await pool.query("SELECT * FROM users WHERE cnpj = ?", [
      cnpj,
    ]);

    return (result as any)[0] || null;
  },
};

export default userModel;
